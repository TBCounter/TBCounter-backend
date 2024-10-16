const {
  addNode,
  getAllNodes,
  removeNode,
  updateNodeStatus,
  addUser,
  getAllUsers,
  removeUser,
} = require("./redisNodes");

var { client } = require("./redisNodes");

const { addToQueue, pauseQueue, resumeQueue } = require("./queue");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("./db/index");
/**
 * Listen on provided port, on all network interfaces.
 */

let nodeIo = null;
let userIo = null;
let OCRIo = null;

const { Server } = require("socket.io");

const { Chest, Session } = require("./storage");

function saveLogToSession(sessionId, message) {
  Session.findOneAndUpdate(
    { session_id: sessionId },
    { $push: { log: { message } } }, // Добавляем новое сообщение в массив логов
    { new: true } // Возвращаем обновлённую сессию
  )
    .then((session) => {
      if (!session) {
        console.error("Сессия не найдена");
        return;
      }
    })
    .catch((err) => {
      console.error("Ошибка при обновлении сессии:", err);
    });
}

const initializeSockets = (server) => {
  const io = new Server(server);

  userIo = io.of("/user");
  nodeIo = io.of("/node");
  OCRIo = io.of("/ocr");

  // node namespace
  nodeIo.on("connection", (socket) => {
    console.log("node connected");
    addNode(socket.id, "ready");
    sendNodesUpdatesToAllUsers();
    let savedSessionId;
    let lastStatus;

    socket.conn.on("packet", function (packet) {
      if (packet.type === "pong") {
        addNode(socket.id, lastStatus);
      }
    });

    socket.on("session", async ({ sessionId, startTime, accountId }) => {
      savedSessionId = sessionId;
      await Session.create({
        session_id: sessionId,
        start_time: startTime,
        account_id: accountId,
        status: "ACTIVE",
        log: [],
      });
    });

    socket.on("cheststatus", async (status, chestId) => {
      const chest = await Chest.findByIdAndUpdate(chestId, { status });

      if (status === "UPLOADED") {
        addToQueue(chest);
      }
      await sendChestUpdatesToUsers(chest.account_id);
    });

    socket.on("disconnect", async () => {
      removeNode(socket.id);
      await sendNodesUpdatesToAllUsers();
      console.log("node disconnected");

      // По идее это временное решение, так как нода у нас падает когда отключается от бэка
      // можно не ронять ее, а просто сундуки в какую-нибудь очередь сохранять
      const currentSession = await Session.findOneAndUpdate(
        { session_id: savedSessionId }, // Используем session_id для поиска
        { end_time, status: "ERROR" },
        { new: true } // Возвращаем обновлённую запись
      );
      await sendChestUpdatesToUsers(currentSession.account_id);
    });

    socket.on("status", async ({ message, sessionId }) => {
      console.log("node updated", { message, id: socket.id });
      lastStatus = message;
      updateNodeStatus(socket.id, message);
      await sendNodesUpdatesToAllUsers();
      if (!sessionId) return;
      saveLogToSession(sessionId, message);

      const accountId = Session.findOne({ session_id: sessionId }).account_id;
      await sendChestUpdatesToUsers(accountId);
    });

    socket.on("session_status", async ({ sessionId, end_time, status }) => {
      const currentSession = await Session.findOneAndUpdate(
        { session_id: sessionId }, // Используем session_id для поиска
        { end_time, status },
        { new: true } // Возвращаем обновлённую запись
      );
      await sendChestUpdatesToUsers(currentSession.account_id);
    });
  });

  OCRIo.on("connection", async (socket) => {
    console.log("ocr node connected");
    addNode(socket.id, "ready", "ocr");
    let lastStatus;

    socket.conn.on("packet", function (packet) {
      if (packet.type === "pong") {
        addNode(socket.id, lastStatus, "ocr");
      }
    });

    await resumeQueue();
    await sendNodesUpdatesToAllUsers();

    socket.on("process_response", async (message) => {
      const { chestId, name, type, source, time } = message;

      const updatedChest = await Chest.findByIdAndUpdate(chestId, {
        name,
        type,
        source,
        time,
      });
      updateNodeStatus(socket.id, "ready", "ocr");
      await sendChestUpdatesToUsers(updatedChest.account_id);
    });

    socket.on("disconnect", async () => {
      removeNode(socket.id, "ocr");
      await pauseQueue();
      await sendNodesUpdatesToAllUsers();
      console.log("node disconnected");
    });

    socket.on("status", async (message) => {
      updateNodeStatus(socket.id, message, "ocr");
      lastStatus = message;
      await sendNodesUpdatesToAllUsers();
    });
  });

  // user namespace
  userIo.on("connection", async (socket) => {
    console.log("user connected");
    const token = socket.handshake.query.token;
    let jwttoken;
    if (!token) {
      socket.emit("user_auth", "failed: no token provided");
      socket.disconnect(true);
      return;
    }
    try {
      jwttoken = jwt.verify(token, process.env.SECRET_JWT_TOKEN);
    } catch (err) {
      console.error(err.message);
      socket.emit("user_auth", "failed: bad token");
      socket.disconnect(true);
      return;
    }

    // here user passed all the checks
    addUser(socket.id, jwttoken.user);

    await sendChestUpdatesToUsers();
    await sendNodesUpdatesToAllUsers();

    socket.emit("user_auth", "success");

    socket.on("disconnect", async () => {
      removeUser(socket.id);
    });
  });

  return io;
};

const getNodeIo = () => {
  if (!nodeIo) {
    throw new Error("Sockets not initialized yet");
  }
  return nodeIo;
};

const getOCRIo = () => {
  if (!OCRIo) {
    throw new Error("Sockets not initialized yet");
  }
  return OCRIo;
};

const getUSERIo = () => {
  if (!getUSERIo) {
    throw new Error("Sockets not initialized yet");
  }
  return userIo;
};

async function sendNodesUpdatesToAllUsers() {
  // send updates to all users

  const allConnectedUsers = await getAllUsers();

  for (const [socketId, userId] of Object.entries(allConnectedUsers)) {
    function countNodesReduce(accumulator, currentValue) {
      JSON.parse(currentValue).status === "ready"
        ? accumulator.idle++
        : accumulator.busy++;
      return accumulator;
    }

    const user_nodes = Object.values(await getAllNodes()).reduce(
      countNodesReduce,
      { idle: 0, busy: 0 }
    );
    const user_ocr_nodes = Object.values(await getAllNodes("ocr")).reduce(
      countNodesReduce,
      { idle: 0, busy: 0 }
    );

    const socket = getUSERIo();

    socket.to(socketId).emit("nodes_update", { user_nodes, user_ocr_nodes });
  }
}

async function sendChestUpdatesToUsers(accountId) {
  // send updates to user with this account id

  const allConnectedUsers = await getAllUsers();

  if (accountId) {
    const account = await db.accounts.findByPk(accountId);

    if (!Object.values(allConnectedUsers).includes(account.userId)) {
      return;
    }
  }

  for (const [socketId, userId] of Object.entries(allConnectedUsers)) {
    const accounts = await db.accounts.findAll({ where: { userId: userId } });

    let user_accounts = [];
    for (const account of accounts) {
      const user_chests = await Chest.aggregate([
        {
          $lookup: {
            from: "sessions", // Название коллекции с сессиями
            localField: "session_id", // Поле в коллекции сундуков
            foreignField: "session_id", // Поле в коллекции сессий
            as: "session", // Имя поля для результатов объединения
          },
        },
        {
          $unwind: "$session", // Развернуть массив сессий (делает их объектами)
        },
        {
          $match: {
            "session.status": "ACTIVE", // Фильтр по статусу сессии
            account_id: account.id, // Фильтр по account_id
          },
        },
        {
          $group: {
            _id: "$status", // Группировка по статусу сундука
            count: { $sum: 1 }, // Подсчет количества сундуков
          },
        },
        {
          $sort: { count: -1 }, // Сортировка по количеству
        },
      ]).catch((e) => {
        console.log(e);
      });

      // create object with { [user_chests._id]: user_chests.count}
      const user_chest_status = {};
      user_chests.forEach((el) => {
        user_chest_status[el._id] = el.count;
      });

      // Fetch the logs for the active session
      const activeSession = await Session.findOne({
        account_id: account.id,
        status: "ACTIVE",
      })
        .select("log")
        .catch((e) => {
          console.log(e);
        });

      user_accounts.push({
        ...account.dataValues,
        session: user_chest_status,
        logs: activeSession ? activeSession.log : [],
      });
    }

    const socket = getUSERIo();

    socket.to(socketId).emit("user_payload", user_accounts);
  }
}

module.exports = {
  initializeSockets,
  nodeIo,
  userIo,
  client,
  getNodeIo,
  getOCRIo,
};

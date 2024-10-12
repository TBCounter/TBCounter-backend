var express = require("express");
var router = express.Router();
const authorization = require("../middleware/authorization");

const db = require("../db/index");

const { getNodeIo } = require("../sockets");

const { getAllNodes, client, updateNodeStatus } = require("../redisNodes");

// create new account

router.post("/", authorization, async (req, res) => {
  try {
    const { name } = await req.body;

    if (!name) {
      return res.status(401).send("account must have a name");
    }

    const newAccount = await db.accounts.create({
      name: name,
      ...req.body,
      userId: req.user,
    });
    res.status(200).json({ newAccount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

router.post("/run", authorization, async (req, res) => {
  try {
    const { accountId } = await req.body;

    if (!accountId) {
      return res.status(400).send("provide account ID");
    }

    const account = await db.accounts.findByPk(accountId, {
      where: { userId: req.user },
    });

    if (!account) {
      return res.status(404).send("Account not found");
    }

    const nodes = await getAllNodes();
    let nodeId = "";
    for (const property in nodes) {
      let node = JSON.parse(nodes[property]);
      if (node.status === "ready") {
        nodeId = property;
      }
    }

    const nodeIo = getNodeIo();

    nodeIo.to(nodeId).emit("run_account", {
      address: "https://totalbattle.com", // run url is from request
      login: account.login,
      password: account.password,
    });

    await client.hSet(
      "nodes",
      nodeId,
      JSON.stringify({ status: "busy", timestamp: Date.now() })
    );

    res.status(200).json({ result: "ok" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

router.post("/cookie", authorization, async (req, res) => {
  try {
    const { accountId, cookie, url, open } = await req.body;


    const usersAccount = await db.accounts.findOne({ where: { userId: req.user, id: accountId } })
    if (!usersAccount) {
      res.status(400).send('Not your account')
      return
    }

    if (!accountId) {
      res.status(400).send("provide account ID");
      return
    }

    if (!cookie) {
      res.status(400).send("provide cookie");
      return
    }

    if (!url) {
      res.status(400).send("provide url");
      return
    }

    const nodes = await getAllNodes();
    let nodeId = "";
    for (const property in nodes) {
      let node = JSON.parse(nodes[property]);
      if (node.status === "ready") {
        nodeId = property;
      }
    }
    console.log(nodeId);

    if (!nodeId) {
      res.status(403).send("No ready nodes");
    }
    const nodeIo = getNodeIo();

    usersAccount.new_cookie = cookie

    await usersAccount.save()
    if (usersAccount.old_cookie) {
      nodeIo.to(nodeId).emit('run_cookie', {
        address: 'https://totalbattle.com', // run url is from request
        accountId: accountId,
        cookie: usersAccount.old_cookie,
        open
      })
    } else {

      nodeIo.to(nodeId).emit('run_cookie', {
        address: 'https://totalbattle.com', // run url is from request
        accountId: accountId,
        cookie: cookie,
        open
      })

    }


    await client.hSet(
      "nodes",
      nodeId,
      JSON.stringify({ status: "busy", timestamp: Date.now() })
    );

    res.status(200).send("Running cookie, please wait...");
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/", authorization, async function (req, res) {
  try {
    const accounts = await db.accounts.findAll({ where: { userId: req.user } });
    res.status(200).json({ accounts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = router;

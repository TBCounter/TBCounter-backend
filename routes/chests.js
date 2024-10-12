const express = require("express");
const router = express.Router();
const authorization = require("../middleware/authorization");

const { Parser } = require("json2csv"); // Убедитесь, что вы установили json2csv
const { Chest } = require("../storage");

const db = require("../db/index");

/* GET home page. */
router.get("/", authorization, async function (req, res, next) {
  const accountId = req.query.accountId;
  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);

  console.log("accid", accountId);

  // Проверка наличия accountId
  if (!accountId) {
    return res.status(401).send("Invalid account");
  }

  // Проверка существования пользователя
  const account = await db.accounts.findOne({ where: { id: accountId } });
  if (!account) {
    return res.status(401).send("Invalid account");
  }

  try {
    // Получение сундуков со статусом PROCESSED и в заданном диапазоне дат
    const allChests = await Chest.find({
      account_id: accountId,
      status: "PROCESSED",
      got_at: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // Проверка на наличие найденных сундуков
    if (allChests.length === 0) {
      return res.status(404).send("No chests found");
    }

    // Преобразование данных для CSV
    const csvFields = ["name", "type", "source", "time", "got_at"];
    const json2csvParser = new Parser({ fields: csvFields });
    const csv = json2csvParser.parse(allChests);

    // Установка заголовков для скачивания
    res.header("Content-Type", "text/csv");
    res.attachment("chests.csv");
    return res.send(csv);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

router.get("/session", authorization, async (req, res, next) => {
  const sessionId = req.query.sessionId;
  const allChests = await Chest.find({
    session_id: sessionId,
    status: "PROCESSED",
  });

  // Проверка на наличие найденных сундуков
  if (allChests.length === 0) {
    return res.status(404).send("No chests found");
  }

  // Преобразование данных для CSV
  const csvFields = ["name", "type", "source", "time", "got_at"];
  const json2csvParser = new Parser({ fields: csvFields });
  const csv = json2csvParser.parse(allChests);

  // Установка заголовков для скачивания
  res.header("Content-Type", "text/csv");
  res.attachment("chests.csv");
  return res.send(csv);
});

module.exports = router;

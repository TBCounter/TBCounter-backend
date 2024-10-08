var express = require("express");
var router = express.Router();
var path = require("path");
const { Session, Chest } = require("../storage");
const authorization = require("../middleware/authorization");

const db = require("../db");

router.get("/", authorization, async function (req, res) {
  const accountId = req.query.accountId;
  console.log("accid", accountId);

  if (!accountId) {
    return res.status(401).send("Invalid account");
  }

  const account = await db.accounts.findOne({ where: { id: accountId } });
  if (!account) {
    return res.status(401).send("Invalid account");
  }

  const accSessions = await Session.aggregate([
    {
      $match: {
        account_id: accountId, // Фильтр по account_id
        status: { $ne: "ACTIVE" }, // Фильтр по статусу
      },
    },
    {
      $lookup: {
        from: "chests", // Название коллекции сундуков
        localField: "session_id", // Поле session_id в коллекции сессий
        foreignField: "session_id", // Поле session_id в коллекции сундуков
        as: "chests", // Имя поля для объединенных данных
      },
    },
    {
      $addFields: {
        chestStatusCounts: {
          $reduce: {
            input: "$chests",
            initialValue: {
              CREATED: 0,
              UPLOADED: 0,
              PROCESSING: 0,
              PROCESSED: 0,
              ERROR: 0,
            },
            in: {
              CREATED: {
                $cond: [
                  { $eq: ["$$this.status", "CREATED"] },
                  { $add: ["$$value.CREATED", 1] },
                  "$$value.CREATED",
                ],
              },
              UPLOADED: {
                $cond: [
                  { $eq: ["$$this.status", "UPLOADED"] },
                  { $add: ["$$value.UPLOADED", 1] },
                  "$$value.UPLOADED",
                ],
              },
              PROCESSING: {
                $cond: [
                  { $eq: ["$$this.status", "PROCESSING"] },
                  { $add: ["$$value.PROCESSING", 1] },
                  "$$value.PROCESSING",
                ],
              },
              PROCESSED: {
                $cond: [
                  { $eq: ["$$this.status", "PROCESSED"] },
                  { $add: ["$$value.PROCESSED", 1] },
                  "$$value.PROCESSED",
                ],
              },
              ERROR: {
                $cond: [
                  { $eq: ["$$this.status", "ERROR"] },
                  { $add: ["$$value.ERROR", 1] },
                  "$$value.ERROR",
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        session_id: 1, // Выводим session_id
        start_time: 1, // Выводим start_time
        end_time: 1, // Выводим end_time
        status: 1, // Выводим статус сессии
        chestStatusCounts: 1, // Выводим сгруппированные статусы сундуков
      },
    },
  ]);
  res.status(200).json(accSessions);
});

router.delete("/", authorization, async (req, res) => {
  const sessionId = req.query.sessionId;
  const whole = req.query.whole;

  if (!sessionId) {
    return res.status(400).send("Invalid session");
  }

  console.log("params", { sessionId, whole });
  let count = 0;
  if (whole) {
    count = await Chest.deleteMany({ session_id: sessionId });
  }

  await Session.deleteOne({ session_id: sessionId });

  res.status(200).json({ deleted: count });
});

module.exports = router;

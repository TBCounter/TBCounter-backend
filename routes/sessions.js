var express = require('express');
var router = express.Router();
var path = require('path');
const { Session } = require('../storage');
const authorization = require('../middleware/authorization');

const db = require('../db')

// image route
router.get('/', authorization, async function (req, res) {
  const { accountId } = req.body
  console.log(accountId)

  const user = await db.accounts.findOne({ where: { id: accountId } })
  if (!user) {
    return res.status(401).send('Invalid account')
  }

  const accSessions = await Session.find({ account_id: accountId })
  console.log(accSessions)
  res.status(200).json(accSessions)
});

module.exports = router;
var express = require('express');
var router = express.Router();
var path = require('path');
const { Session } = require('../storage');


// image route
router.get('/', function (req, res) {
  accountId = req.body
  const sessions = Session.find({account_id:accountId})
  res.status(200).send(sessions)
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db/index');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  res.send(await db.users.findAll());
});

module.exports = router;

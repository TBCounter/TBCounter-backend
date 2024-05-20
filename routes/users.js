const express = require('express');
const router = express.Router();
const db = require('../db/index');

/* GET users listing. */
router.get('/', async function(req, res) {
  const users = await db.users.findAll()
  res.status(200).json({users});
});

module.exports = router;

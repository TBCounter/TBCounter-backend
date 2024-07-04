var express = require('express');
var router = express.Router();
var path = require('path')
const { Chest } = require('../storage')

router.post('/', async function (req, res) {
  let { chestname } = await req.body
  const chestId = await Chest.create({
    "name": chestname
})
  res.status(200).json(chestId.id)
});

module.exports = router;
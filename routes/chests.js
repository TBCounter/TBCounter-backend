var express = require('express');
var router = express.Router();

var { Chest } = require('../storage')

/* GET home page. */
router.get('/', async function (req, res, next) {
    return res.status(500)
    // const newChest = new Chest({ name: 'Склеп 5 уровень' });

    // await newChest.save();

    const allChests = await Chest.find();

    console.log(allChests)

    res.status(200).json(allChests);
});

module.exports = router;

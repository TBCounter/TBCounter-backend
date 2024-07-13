const { addNode } = require('../redisNodes');
const express = require('express');
const { uid } = require('uid')

const { Chest } = require('../storage')

const router = express.Router();


/* GET home page. */
router.put('/register', function (req, res) {
    const id = uid()
    addNode(id, 'ready', 'ocr')
    res.status(200).json({ id });
});

router.patch('/process', async (req, res) => {
    const { chestId, name, type, source, time, status } = await req.body
    await Chest.findByIdAndUpdate(chestId, { name, type, source, time, status })

    res.status(200).json(await Chest.findOne({ status: 'UPLOADED' }).exec())
})

module.exports = router;

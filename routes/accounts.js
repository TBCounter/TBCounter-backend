var express = require('express');
var router = express.Router();
var image = require('../routes/images')

const db = require('../db/index')


// create new account

router.post('/', async (req, res) => {
  try {
    const { name, userId } = await req.body

    
    const newAccount = await db.accounts.create({ name: name, userId: userId })
    res.status(200).json({newAccount})
  } 
  catch (err) {
    console.error(err.message)
    res.status(500).send(err.message)
} 
});

module.exports = router;
var express = require('express');
var router = express.Router();
const authorization = require('../middleware/authorization')

const db = require('../db/index')


// create new account

router.post('/', authorization, async (req, res) => {
  try {
    const { name } = await req.body

    if (!name) {
      return res.status(401).send('account must have a name')
    }

    const newAccount = await db.accounts.create({ name: name, userId: req.user })
    res.status(200).json({newAccount})
  } 
  catch (err) {
    console.error(err.message)
    res.status(500).send(err.message)
} 
});

router.get('/', async function(req, res) {
  try {
    const accounts = await db.accounts.findAll({ userId: req.user })
    res.status(200).json({accounts});
  }
  catch (err) {
    console.error(err.message)
    res.status(500).send(err.message)
  }
});

/*
{
  "email": "helloworld@gmail.com",
  "password": "123123123"
}  
*/

module.exports = router;
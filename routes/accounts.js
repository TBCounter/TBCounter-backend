var express = require('express');
var router = express.Router();
const authorization = require('../middleware/authorization')

const db = require('../db/index')


// create new account

router.post('/', authorization, async (req, res) => {
  try {
    const { name } = await req.body
    
    const newAccount = await db.accounts.create({ name: name, userId: userId })
    res.status(200).json({newAccount})
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
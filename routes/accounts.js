var express = require('express');
var router = express.Router();
const authorization = require('../middleware/authorization')

const db = require('../db/index')

const { getNodeIo } = require('../sockets')

// create new account

router.post('/', authorization, async (req, res) => {
  try {
    const { name } = await req.body

    if (!name) {
      return res.status(401).send('account must have a name')
    }

    const newAccount = await db.accounts.create({ name: name, ...req.body, userId: req.user })
    res.status(200).json({ newAccount })
  }
  catch (err) {
    console.error(err.message)
    res.status(500).send(err.message)
  }
});


router.post('/run', authorization, async (req, res) => {
  try {
    const { accountId } = await req.body

    if (!accountId) {
      return res.status(400).send('provide account ID')
    }

    const account = await db.accounts.findByPk(accountId, { where: { userId: req.user } })

    if (!account) {
      return res.status(404).send('Account not found')
    }
    const nodeIo = getNodeIo();
    nodeIo.emit('run_account', {
      address: 'https://totalbattle.com',
      login: account.login,
      password: account.password
    })

    res.status(200).json({ result: "ok" })
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
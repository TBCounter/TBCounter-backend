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

router.post('/cookie', authorization, async (req, res) => {
  try {
    const { accountId, cookie, url } = await req.body
    

        if (!accountId) {
          res.status(400).send('provide account ID')
        }
          
        if (!cookie) {
          res.status(400).send('provide cookie')
        }
          
        if (!url) {
          res.status(400).send('provide url')
        }
    
      const nodeIo = getNodeIo();
      nodeIo.emit('run_cookie', {
        address: 'https://totalbattle.com',
        accountId: accountId,
        cookie: cookie
      })

      res.status(200).send('Running cookie, please wait...')
  }
  catch (err) {
    console.error(err.message)
    res.status(500).send(err.message)
  }
})

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

module.exports = router;
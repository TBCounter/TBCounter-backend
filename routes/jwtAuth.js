const db = require('../db/index')

const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwtGenerator = require('../utils/jwtGenerator')
const validInfo = require('../middleware/validInfo')
const authorization = require('../middleware/authorization')

// registration route

router.post('/register', validInfo, async (req, res) => {
  try {
    const { email, password } = await req.body


    const user = await db.users.findOne({where: {email: email }})

    if (user) {
      return res.status(401).send('user already exists')
    }

    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound)

    const bcryptPassword = await bcrypt.hash(password, salt)

    const newUser = await db.users.create({ email: email, password: bcryptPassword })
    const token = jwtGenerator(newUser.id)
    res.status(200).json({token})
  } catch (err) {
      console.error(err.message)
      res.status(500).send(err.message)
  }
})

// login route

router.post("/login", validInfo, async (req, res) => {
  try {

    const { email, password } = req.body

    const user = await db.users.findOne({where: {email: email }})

    if (!user) {
      return res.status(401).send('password or email is incorrect')
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).send('password or email is incorrect')
    }

    const token = jwtGenerator(user.id)

    res.status(200).json({token})
  }
  catch (err) {
    console.error(err.message)
    res.status(500).send(err.message)
}});

router.get('/is-verify', authorization, async (req, res) => {
  try {

    res.status(200).send('true')
  } catch (err) {
      console.error(err.message)
      res.status(500).send(err.message)
  }})

module.exports = router
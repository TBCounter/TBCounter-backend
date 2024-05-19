const db = require('../db/index')

const router = require('express').Router()
const bcrypt = require('bcrypt')

// registration
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await db.users.findAll({where: {email: email }})
    res.json(user.rows)

    if (user.rows.length !== 0) {
      return res.status(401).send('user already exists')
    }

    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound)

    const bcryptPassword = await bcrypt.hash(password, salt)

    const newUser = await db.users.create({ email: email, password: bcryptPassword })
    res.json(newUser.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

module.exports = router;
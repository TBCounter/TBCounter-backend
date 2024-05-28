const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header('token')
    if (!jwtToken) {
      return res.status(403).json('unauthorized')
    }

    const payload = jwt.verify(jwtToken, process.env.SECRET_JWT_TOKEN)

    req.user = payload.user
    next()
  } catch (err) {
    console.error(err.message)
    return res.status(403).json('unauthorized')
  }
}
const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header('Authorization')
    if (!jwtToken) {
      return res.status(403).json('unauthorized, no token provided')
    }

    const token = jwtToken.substring(7)
    
    const payload = jwt.verify(token, process.env.SECRET_JWT_TOKEN)

    req.user = payload.user
    next()
  } catch (err) {
    console.error(err.message)
    return res.status(403).json('unauthorized, invalid token')
  }
}
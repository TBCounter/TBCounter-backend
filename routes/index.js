var express = require('express');
var router = express.Router();

/**
 * @openapi
 * /:
 *   get:
 *     description: Healthckeck of backend
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.get('/', function (req, res, next) {
  res.send('respond with a home');
});

module.exports = router;

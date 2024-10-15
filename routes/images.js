var express = require("express");
var router = express.Router();
var path = require("path");

// image route
router.get("/", function (req, res) {
  return res.status(200).send("respond with images");
});

module.exports = router;

var express = require('express');
var router = express.Router();
var path = require('path')

// image route
router.get('/', function (req, res) {
  const options = {
      root: path.join(__dirname + '/images')
  };

  const fileName = 'default_user_1.jpg';
  res.sendFile(fileName, options, function (err) {
      if (err) {
          console.error('Error sending file:', err);
      } else {
          console.log('Sent:', fileName);
      }
  });
});

module.exports = router;

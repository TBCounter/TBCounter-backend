var fs = require('fs');
var express = require('express');
var router = express.Router();
const yaml = require('js-yaml');

router.get('/', async (req, res) => {
  try {
    const { lang } = await req.body

    if (lang === 'EN') {
      let logs = yaml.load(fs.readFileSync('./changelogEN.yaml', 'utf8'));
      res.status(200).send(logs)
    } else if (lang === 'RU') {
      let logs = yaml.load(fs.readFileSync('./changelogRU.yaml', 'utf8'));
      res.status(200).send(logs)
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send(err.message)
  }
})

module.exports = router;
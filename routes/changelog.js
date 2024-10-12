var fs = require('fs');
var express = require('express');
var router = express.Router();
const yaml = require('js-yaml');

/**
 * @openapi
 * /changelog:
 *   get:
 *     description: get changelog with given language
 *     parameters:
 *       - name: lang
 *         description: Russian or English language
 *         in: query
 *         required: true
 *         type: string
 *     produces: 
 *       - application/json 
 *     responses:
 *       200:
 *         description: Returns list of changelogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 Date: string
 *                 Text: string
 */
router.get('/', async (req, res) => {
  try {
    const lang = req.query.lang

    if (lang === 'EN') {
      let logs = yaml.load(fs.readFileSync('./changelogs/changelogEN.yaml', 'utf8'));
      return res.status(200).send(logs);
    } else if (lang === 'RU') {
      let logs = yaml.load(fs.readFileSync('./changelogs/changelogRU.yaml', 'utf8'));
      return res.status(200).send(logs);
    }
    else {
      return res.status(400).send("language reqired");
    }
  } catch (err) {
    console.error(err.message)
    return res.status(500).send(err.message);
  }
})

module.exports = router;
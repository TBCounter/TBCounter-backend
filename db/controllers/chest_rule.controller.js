const db = require("../index.js");

const ChestRule = db.chest_rules;

exports.create = (req, res) => {

  const chest_rule = {
    group: req.body.group,
    chest_name: req.body.chest_name,
    chest_type: req.body.chest_type,
    scores: req.body.scores,
};

ChestRule.create(chest_rule)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Chest Rule."
        });
    });}
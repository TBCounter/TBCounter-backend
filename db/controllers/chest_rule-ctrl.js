const db = require("../index.js");

const ChestRule = db.chest_rules;

exports.create = (req, res) => {

  const chest_rule = {
    account_id: req.body.account_id,
    group: req.body.group,
    ideal_chest_name: req.body.ideal_chest_name,
    ideal_chest_type: req.body.ideal_chest_type,
    scores: req.body.scores,
    ideal_chest_name_id: req.body.ideal_chest_name_id,
    ideal_chest_type_id: req.body.ideal_chest_type_id,

    published: req.body.published ? req.body.published : false
};

ChestRule.create(chest_rule)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Account."
        });
    });}
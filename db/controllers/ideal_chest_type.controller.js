const db = require("../index.js");

const ChestType = db.chest_types;

exports.create = (req, res) => {

  const chest_type = {
    hash: req.body.hash,
    path: req.body.path,
    text: req.body.text,
};

ChestType.create(chest_type)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Chest Type."
        });
    });}

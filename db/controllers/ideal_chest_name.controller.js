const db = require("../index.js");

const ChestName = db.chest_names;

exports.create = (req, res) => {

  const chest_name = {
    hash: req.body.hash,
    path: req.body.path,
    text: req.body.text,
};

ChestName.create(chest_name)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Chest Name."
        });
    });}

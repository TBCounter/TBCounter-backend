const db = require("../index.js");

const IdealChestType = db.ideal_chest_types;

exports.create = (req, res) => {

  const ideal_chest_type = {
    hash: req.body.hash,
    path: req.body.path,
    text: req.body.text,
    
    published: req.body.published ? req.body.published : false
};

IdealChestType.create(ideal_chest_type)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Account."
        });
    });}

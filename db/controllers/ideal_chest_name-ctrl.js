const db = require("../index.js");

const IdealChestName = db.ideal_chest_names;

exports.create = (req, res) => {

  const ideal_chest_name = {
    hash: req.body.hash,
    path: req.body.path,
    text: req.body.text,
    
    published: req.body.published ? req.body.published : false
};

IdealChestName.create(ideal_chest_name)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Account."
        });
    });}

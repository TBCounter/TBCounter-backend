const db = require("../index.js");

const Chest = db.chests;

exports.create = (req, res) => {

  const chest = {
    player: req.body.player,
    got_at: req.body.got_at,
    path: req.body.path,
    check_needed: req.body.check_needed,
};

Chest.create(chest)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Chest."
        });
    });}
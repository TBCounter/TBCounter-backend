const db = require("../index.js");

const Player = db.players;

exports.create = (req, res) => {
  
  const player = {
    hash: req.body.hash,
    path: req.body.path,
    name: req.body.name,
    level: req.body.level,
};

Player.create(player)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Player."
        });
    });}
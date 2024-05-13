const db = require("../index.js");

const Chest = db.chests;

exports.create = (req, res) => {

  const chest = {
    account_id: req.body.account_id,
    chest_type: req.body.chest_type,
    chest_name: req.body.chest_name,
    player: req.body.player,
    chest_type_id: req.body.chest_type_id,
    chest_name_id: req.body.chest_name_id,
    player_id: req.body.player_id,
    got_at: req.body.got_at,
    path: req.body.path,
    check_needed: req.body.check_needed,
  
    published: req.body.published ? req.body.published : false
};

Chest.create(chest)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Account."
        });
    });}
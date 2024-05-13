const db = require("../index.js");

const ClanPlayer = db.clan_players;

exports.create = (req, res) => {
  
  const clan_player = {
    account_id: req.body.account_id,
    hash: req.body.hash,
    path: req.body.path,
    name: req.body.name,
    level: req.body.level,

    published: req.body.published ? req.body.published : false
};

ClanPlayer.create(clan_player)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Account."
        });
    });}
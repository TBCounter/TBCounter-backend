const db = require("../index.js");

const Account = db.accounts;

exports.create = (req, res) => {

  const account = {
    login: req.body.login,
    password: req.body.password,
    isTriumph: req.body.isTriumph,
    name: req.body.name,
    clan: req.body.clan,
    avatar: req.body.avatar,
    is_locked: req.body.is_locked,
    selenium_url: req.body.selenium_url,
    selenium_url_id: req.body.selenium_url_id,
    vip: req.body.vip,
};

Account.create(account)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Account."
        });
    });}
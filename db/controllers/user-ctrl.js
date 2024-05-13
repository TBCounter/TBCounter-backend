const db = require("../index.js");

const User = db.users;

exports.create = (req, res) => {

    if (!req.body.title) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }}

    const user = {
        username: req.body.username,
        email: req.body.email,

        published: req.body.published ? req.body.published : false
    };

    User.create(user)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the User."
            });
        });
const db = require("../index.js");

const Queue = db.queues;

exports.create = (req, res) => {
  
  const queue = {
    url: req.body.url,
    cookies: req.body.cookies,
    active: req.body.active,
    timestamp: req.body.timestamp,
    done: req.body.done,
};

Queue.create(queue)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Queue."
        });
    });}
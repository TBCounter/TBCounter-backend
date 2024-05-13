const db = require("../index.js");

const Report = db.reports;

exports.create = (req, res) => {
 
  const report = {
    hash: req.body.hash,
    report_query: req.body.report_query,
    account_id: req.body.account_id,

    published: req.body.published ? req.body.published : false
};

Report.create(report)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Account."
        });
    });}
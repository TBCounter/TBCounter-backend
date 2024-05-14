const db = require("../index.js");

const Report = db.reports;

exports.create = (req, res) => {
 
  const report = {
    hash: req.body.hash,
    report_query: req.body.report_query,
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
module.exports = (sequelize, Sequelize) => {
  const Report = sequelize.define("report", {
      hash: {
        type: Sequelize.STRING
      },
      report_query: {
        type: Sequelize.STRING
      },
      account_id: {
        type: Sequelize.INTEGER
      }
  });

  

  return Report;
};
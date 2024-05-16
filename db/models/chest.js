module.exports = (sequelize, Sequelize) => {
  const Chest = sequelize.define("chest", {
      got_at: {
        type: Sequelize.DATE
      },
      path: {
        type: Sequelize.STRING
      },
      check_needed: {
        type: Sequelize.STRING
      }
  });


  return Chest;
};
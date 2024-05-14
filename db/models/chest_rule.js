module.exports = (sequelize, Sequelize) => {
  const ChestRule = sequelize.define("chest_rule", {
      group: {
        type: Sequelize.INTEGER
      },
      scores: {
        type: Sequelize.REAL
      }
  });

  

  return ChestRule;
};

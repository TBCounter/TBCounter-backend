module.exports = (sequelize, Sequelize) => {
  const ChestRule = sequelize.define("chest_rule", {
      account_id: {
        type: Sequelize.INTEGER
      },
      group: {
        type: Sequelize.INTEGER
      },
      ideal_chest_name: {
        type: Sequelize.STRING
      },
      ideal_chest_type: {
        type: Sequelize.STRING
      },
      scores: {
        type: Sequelize.REAL
      },


      ideal_chest_name_id: {
        type: Sequelize.INTEGER
      },
      ideal_chest_type_id: {
        type: Sequelize.INTEGER
      }
  });

  

  return ChestRule;
};

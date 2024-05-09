module.exports = (sequelize, Sequelize) => {
  const IdealChestType = sequelize.define("ideal_chest_type", {
    hash: {
      type: Sequelize.STRING
    },
    path: {
      type: Sequelize.STRING
    },
    text: {
      type: Sequelize.STRING
    },
  });

  

  return IdealChestType;
};
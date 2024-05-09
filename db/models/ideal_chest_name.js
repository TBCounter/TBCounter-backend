module.exports = (sequelize, Sequelize) => {
  const IdealChestName = sequelize.define("ideal_chest_name", {
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

  

  return IdealChestName;
};
module.exports = (sequelize, Sequelize) => {
  const ChestType = sequelize.define("chest_type", {
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

  

  return ChestType;
};
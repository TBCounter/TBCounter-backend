module.exports = (sequelize, Sequelize) => {
  const ChestName = sequelize.define("chest_name", {
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

  

  return ChestName;
};
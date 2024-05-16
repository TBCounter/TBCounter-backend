module.exports = (sequelize, Sequelize) => {
  const Player = sequelize.define("player", {
    hash: {
      type: Sequelize.STRING
    },
    path: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    level: {
      type: Sequelize.INTEGER
    }
  });

  return Player;
};

//has relationship
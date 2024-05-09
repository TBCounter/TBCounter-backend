module.exports = (sequelize, Sequelize) => {
  const ClanPlayer = sequelize.define("clan_player", {
    account_id: {
      type: Sequelize.INTEGER
    },
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

  return ClanPlayer;
};

//has relationship
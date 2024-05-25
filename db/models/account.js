module.exports = (sequelize, Sequelize) => {
  const Account = sequelize.define("account", {
      login: {
        type: Sequelize.STRING,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isTriumph: {
        type: Sequelize.BOOLEAN
      },

      name: {
        type: Sequelize.STRING
      },
      clan: {
        type: Sequelize.STRING
      },
      avatar: {
        type: Sequelize.STRING
      },
      is_locked: {
        type: Sequelize.BOOLEAN
      },


      node_url: {
        type: Sequelize.STRING
      },
      node_url_id: {
        type: Sequelize.STRING
      },


      vip: {
        type: Sequelize.BOOLEAN
      },
  });

  return Account;
};

//has relationship
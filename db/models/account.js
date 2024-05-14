module.exports = (sequelize, Sequelize) => {
  const Account = sequelize.define("account", {
      login: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
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


      selenium_url: {
        type: Sequelize.STRING
      },
      selenium_url_id: {
        type: Sequelize.STRING
      },


      vip: {
        type: Sequelize.BOOLEAN
      },
  });

  return Account;
};

//has relationship
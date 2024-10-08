module.exports = (sequelize, Sequelize) => {
  const Account = sequelize.define("account", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
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
      type: Sequelize.STRING,
      allowNull: false
    },
    clan: {
      type: Sequelize.STRING
    },
    avatar: {
      type: Sequelize.STRING,
      defaultValue: __dirname + '/images'
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

    new_cookie:{
      type: Sequelize.JSONB
    },
    old_cookie: {
      type: Sequelize.JSONB
    }
  });

  return Account;
};

//has relationship
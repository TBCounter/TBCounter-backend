module.exports = (sequelize, Sequelize) => {
  const Queue = sequelize.define("queue", {
    url: {
      type: Sequelize.STRING
    },
    account_id: {
      type: Sequelize.INTEGER
    },
    cookies: {
      type: Sequelize.STRING
    },
    active: {
      type: Sequelize.BOOLEAN
    },
    timestamp: {
      type: Sequelize.DATE
    },
    done: {
      type: Sequelize.BOOLEAN
    },
  });

  

  return Queue;
};
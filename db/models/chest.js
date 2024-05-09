module.exports = (sequelize, Sequelize) => {
  const Chest = sequelize.define("chest", {
      account_id: {
        type: Sequelize.INTEGER
      },
      chest_type: {
        type: Sequelize.STRING
      },
      chest_name: {
        type: Sequelize.STRING
      },
      player: {
        type: Sequelize.STRING
      },


      chest_type_id: {
        type: Sequelize.INTEGER
      },
      chest_name_id: {
        type: Sequelize.INTEGER
      },
      player_id: {
        type: Sequelize.INTEGER
      },
  

      got_at: {
        type: Sequelize.DATE
      },
      path: {
        type: Sequelize.STRING
      },
      check_needed: {
        type: Sequelize.STRING
      }
  });


  return Chest;
};
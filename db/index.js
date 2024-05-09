const Sequelize = require("sequelize");

const sequelize = new Sequelize({
    dialect: 'postgres',
    database: 'tbcounter',
    username: 'admin',
    password: 'admin',
    host: 'db',
    port: 5432,
    ssl: true,
    clientMinMessages: 'notice',
});


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./models/user")(sequelize, Sequelize);
db.accounts = require("./models/account")(sequelize, Sequelize);
db.chests = require("./models/chest")(sequelize, Sequelize);
db.chest_rules = require("./models/chest_rule")(sequelize, Sequelize);
db.clan_players = require("./models/clan_player")(sequelize, Sequelize);
db.ideal_chest_names = require("./models/ideal_chest_name")(sequelize, Sequelize);
db.ideal_chest_types = require("./models/ideal_chest_type")(sequelize, Sequelize);
db.queues = require("./models/queue")(sequelize, Sequelize);
db.reports = require("./models/report")(sequelize, Sequelize);

module.exports = db;
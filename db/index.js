const Sequelize = require("sequelize");

const sequelize = new Sequelize({
    dialect: 'postgres',
    database: 'tbcounter',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: 'db',
    port: 5432,
    ssl: true,
    clientMinMessages: 'notice',
});


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./models/user')(sequelize, Sequelize);
db.accounts = require('./models/account')(sequelize, Sequelize);
db.chests = require("./models/chest")(sequelize, Sequelize);
db.chest_rules = require("./models/chest_rule")(sequelize, Sequelize);
db.players = require("./models/player")(sequelize, Sequelize);
db.chest_names = require("./models/chest_name")(sequelize, Sequelize);
db.chest_types = require("./models/chest_type")(sequelize, Sequelize);
db.queues = require("./models/queue")(sequelize, Sequelize);
db.reports = require("./models/report")(sequelize, Sequelize);

//account relationships
db.users.hasMany(db.accounts)
db.accounts.belongsTo(db.users)

//chest rules relationships
db.accounts.hasMany(db.chest_rules)
db.chest_rules.belongsTo(db.accounts)

db.chest_names.hasMany(db.chest_rules)
db.chest_rules.belongsTo(db.chest_names)

db.chest_types.hasMany(db.chest_rules)
db.chest_rules.belongsTo(db.chest_types)

//chest relationships
db.accounts.hasMany(db.chests)
db.chests.belongsTo(db.accounts)

db.chest_types.hasMany(db.chests)
db.chests.belongsTo(db.chest_types)

db.chest_names.hasMany(db.chests)
db.chests.belongsTo(db.chest_names)

db.players.hasMany(db.chests)
db.chests.belongsTo(db.players)

//player relationships
db.accounts.hasMany(db.players)
db.players.belongsTo(db.accounts)

//queue relationships
db.accounts.hasMany(db.queues)
db.queues.belongsTo(db.accounts)

//report relationships
db.accounts.hasMany(db.reports)
db.reports.belongsTo(db.accounts)

module.exports = db;
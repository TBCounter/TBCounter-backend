const Sequelize = require("sequelize");

const sequelize = new Sequelize({
    dialect: 'postgres',
    database: 'tbcounter',
    user: 'admin',
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

module.exports = db;
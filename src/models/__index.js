require("dotenv").config();
const Sequelize = require("sequelize");
const db = {};

//establish connection to db
const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PWD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: "mysql",
  },
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//mysql model
db.user = require("./user.model")(sequelize, Sequelize);
db.authToken = require("./auth_token.model")(sequelize, Sequelize);
db.inviteCode = require("./invite_code.model")(sequelize, Sequelize);

module.exports = db;

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("node-complete", "root", "qSg3qMsnNA", {
  dialect: "mysql",
  host: "localhost",
});
module.exports = sequelize;

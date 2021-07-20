const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "node-complete",
  password: "qSg3qMsnNA",
});

//promise allow us to work with async tasks, promises allow us to write code in a more structured way.
module.exports = pool.promise();
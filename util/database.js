//EXAMPLES:
//**************************** Sequelize **************************************************** */

// const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize("node-complete", "root", "qSg3qMsnNA", {
//   dialect: "mysql",
//   host: "localhost",
// });
// module.exports = sequelize;

//**************************** MongoDb Client **************************************************** */

// const mongodb = require("mongodb");
// const MongoClient = mongodb.MongoClient;

// //_ means it will only be used internally for this file.
// let _db;

// const mongoConnect = (callback) => {
//   MongoClient.connect(
//     "mongodb+srv://joaquim-nodejs:Lz55SAZBtXJIF7i1@nodejscourse.8jnne.mongodb.net/shop?retryWrites=true&w=majority"
//   )
//     .then((client) => {
//       console.log("Connected!");
//       _db = client.db(); //connect to the default database https://gyazo.com/fab61e140cb12cc506bf44abe8d1e981
//       callback(client);
//     })
//     .catch((err) => {
//       console.error(err);
//       throw err;
//     });
// };

//SQL translated to NoSQL Quick resume:
// tables -> collections
// rows -> documents

// const getDb = () => {
//   if (_db) {
//     return _db;
//   }
//   throw "No database found!";
// };

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
// const expressHbs = require("express-handlebars");

const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

// app.engine(
//   "hbs",
//   expressHbs({
//     layoutsDir: "views/layouts/",
//     defaultLayout: "main-layout",
//     extname: "hbs"
//   })
// ); //"external" engines

//setting name to value

// app.set("view engine", "pug"); //compile view engine with pug
app.set("view engine", "ejs"); //compile view engine with pug
app.set("views", "views"); //where to find the views for view engine

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); //for static files we will assume that we are allready inside public folder

//order matter, route with only '/' should be the last
app.use("/admin", adminData.routes);
app.use(shopRoutes);

app.use((request, response, next) => {
  response.status(404).render("404", { pageTitle: "Page Not Found", path: "" });
});

app.listen(3000);

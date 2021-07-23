const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
// const expressHbs = require("express-handlebars");

const User = require("./models/user");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorController = require("./controllers/error");

// const { mongoConnect } = require("./util/database");
const mongoose = require("mongoose");

// const User = require("./models/user");

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

//middleware
app.use((req, res, next) => {
  User.findById("60f9aa195214cb63985e2956")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  if (req.originalUrl.includes("favicon.ico")) {
    res.status(204).end();
  }
  next();
});

//order matter, route with only '/' should be the last
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.get("/favicon.ico", (req, res) => res.status(204));

// mongoConnect(() => {
//   app.listen(3000);
// });

mongoose
  .connect(
    "mongodb+srv://joaquim-nodejs:Lz55SAZBtXJIF7i1@nodejscourse.8jnne.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then(() => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "user",
          email: "user@user.com",
          cart: {
            items: [],
          },
        });

        user.save();
      }
    });
    app.listen(3000);
  })
  .catch((err) => console.log(err));

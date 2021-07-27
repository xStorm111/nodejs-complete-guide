const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session); //passed to a function that requires express-session
const csrf = require("csurf");
const flash = require("connect-flash");
// const expressHbs = require("express-handlebars");

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI =
  "mongodb+srv://joaquim-nodejs:Lz55SAZBtXJIF7i1@nodejscourse.8jnne.mongodb.net/shop";

const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const shopRoutes = require("./routes/shop");

// const { mongoConnect } = require("./util/database");

// const User = require("./models/user");

const app = express();

//Session will be stored in mongoDB
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

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

app.use(
  session({
    secret: "my secret",
    resave: false, //session will not be saved on every request sent, only if something changes
    saveUninitialized: false, //no session will be saved where he doesnt need to be saved bcause nothing was changed
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((request, response, next) => {
  if (!request.session.user) {
    return next();
  }
  User.findById(request.session.user._id)
    .then((user) => {
      request.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

//middleware
// app.use((req, res, next) => {
//   if (req.originalUrl.includes("favicon.ico")) {
//     res.status(204).end();
//   }
//   next();
// });

//Needs to come after bodyParser and before routes
app.use((request, response, next) => {
  //method provided by express which allow us to pass local variables to all the views
  response.locals.isAuthenticated = request.session.isLoggedIn;
  response.locals.csrfToken = request.csrfToken();
  next();
});
//order matter, route with only '/' should be the last
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

// app.get("/favicon.ico", (req, res) => res.status(204));

// mongoConnect(() => {
//   app.listen(3000);
// });

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));

const path = require("path");
const fs = require("fs");
const https = require("https");

const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session); //passed to a function that requires express-session
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const compression = require("compression");
const morgan = require("morgan");
// const expressHbs = require("express-handlebars");

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@nodejscourse.8jnne.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

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

// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

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
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public"))); //for static files we will assume that we are allready inside public folder
app.use("/images", express.static(path.join(__dirname, "images"))); //static files for path with '/images'

app.use(
  session({
    secret: "my secret",
    resave: false, //session will not be saved on every request sent, only if something changes
    saveUninitialized: false, //no session will be saved where he doesnt need to be saved bcause nothing was changed
    store: store,
  })
);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(csrfProtection);
app.use(flash());

//Needs to come after bodyParser and before routes
app.use((request, response, next) => {
  //method provided by express which allow us to pass local variables to all the views
  response.locals.isAuthenticated = request.session.isLoggedIn;
  response.locals.csrfToken = request.csrfToken();
  next();
});

app.use((request, response, next) => {
  //sync throw new Error(x)
  //async aKa promise next(new Error(x))
  if (!request.session.user) {
    return next();
  }
  User.findById(request.session.user._id)
    .then((user) => {
      request.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

//middleware
// app.use((req, res, next) => {
//   if (req.originalUrl.includes("favicon.ico")) {
//     res.status(204).end();
//   }
//   next();
// });

//order matter, route with only '/' should be the last
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

//Express.js error handling middleware
app.use((error, request, response, next) => {
  console.log(error);
  response.redirect("/500");
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

// mongoConnect(() => {
//   app.listen(3000);
// });

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));

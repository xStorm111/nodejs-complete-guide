const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); //for static files we will assume that we are allready inside public folder

//order matter, route with only '/' should be the last
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use((request, response, next) => {
  response.sendFile(path.join(__dirname, "./", "views", "not-found.html"));
});

app.listen(3000);

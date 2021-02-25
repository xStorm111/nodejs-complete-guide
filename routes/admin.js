const path = require("path");

const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

//admin/add-product => GET
router.get("/add-product", (request, response, next) => {
  //use allow us to use middleware functions
  response.sendFile(path.join(rootDir, "views", "add-product.html"));
});

//admin/add-product => POST
router.post("/add-product", (request, response, next) => {
  console.log(request.body);
  response.redirect("/");
});

module.exports = router;

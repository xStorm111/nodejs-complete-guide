const path = require("path");

const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

//this should be allows the last one
router.get("/", (request, response, next) => {
  //use allow us to use middleware functions
  response.sendFile(path.join(rootDir, "views", "shop.html"));
});

module.exports = router;

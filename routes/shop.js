const path = require("path");

const express = require("express");

const rootDir = require("../util/path");
const adminData = require("./admin");

const router = express.Router();

//this should be allows the last one
router.get("/", (request, response, next) => {
  const products = adminData.products;
  response.render("shop", {
    prods: products,
    pageTitle: "Shop",
    path: '/',
    hasProducts: products.length > 0,
    activeShop: true,
    productCss: true
  }); //use default template engine
});

module.exports = router;

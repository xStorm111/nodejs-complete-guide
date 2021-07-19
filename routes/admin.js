const path = require("path");

const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

const products = [];
//admin/add-product => GET
router.get("/add-product", (request, response, next) => {
  //render .pug file
  response.render("add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
  });
});

//admin/add-product => POST
router.post("/add-product", (request, response, next) => {
  products.push({ title: request.body.title });
  response.redirect("/");
});

// module.exports = router;

exports.routes = router;
exports.products = products;

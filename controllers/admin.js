const Product = require("../models/product");

exports.getAddProductPage = (request, response, next) => {
  //render .pug file
  response.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.getEditProductPage = (request, response, next) => {
  const editMode = request.query.edit;
  if (!editMode) {
    return response.redirect("/");
  }

  const prodId = request.params.productId;
  Product.findById(prodId, (product) => {
    if (!product) {
      return response.redirect("/");
    }

    response.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
    });
  });
};

exports.postAddProduct = (request, response, next) => {
  const title = request.body.title;
  const imageUrl = request.body.imageUrl;
  const price = request.body.price;
  const description = request.body.description;

  const product = new Product(null, title, imageUrl, description, price);

  product
    .save()
    .then(() => response.redirect("/"))
    .catch((err) => console.log(err));
};

exports.postEditProduct = (request, response, next) => {
  const prodId = request.body.productId;
  const updatedTitle = request.body.title;
  const updatedImageUrl = request.body.imageUrl;
  const updatedPrice = request.body.price;
  const updatedDescription = request.body.description;

  const updatedProduct = new Product(
    prodId,
    updatedTitle,
    updatedImageUrl,
    updatedDescription,
    updatedPrice
  );

  updatedProduct.save();
  response.redirect("/admin/products");
};

exports.postDeleteProduct = (request, response, next) => {
  const prodId = request.body.productId;
  Product.deleteById(prodId);
  response.redirect("/admin/products");
};

exports.getProducts = (request, response, next) => {
  Product.fetchAll((products) => {
    response.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    }); //use default template engine
  });
};

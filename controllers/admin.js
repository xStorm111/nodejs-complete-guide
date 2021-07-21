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
  request.user
    .getProducts({ where: { id: prodId } })
    .then((products) => {
      const product = products[0];
      if (!product) {
        return response.redirect("/");
      }

      response.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postAddProduct = (request, response, next) => {
  const title = request.body.title;
  const imageUrl = request.body.imageUrl;
  const price = request.body.price;
  const description = request.body.description;

  request.user
    .createProduct({ title, imageUrl, price, description })
    .then((product) => {
      console.log("Product created");
      response.redirect("/admin/products");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postEditProduct = (request, response, next) => {
  const prodId = request.body.productId;
  const updatedTitle = request.body.title;
  const updatedImageUrl = request.body.imageUrl;
  const updatedPrice = request.body.price;
  const updatedDescription = request.body.description;

  Product.findByPk(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.description = updatedDescription;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;

      return product.save(); //sequelize
    })
    .then((result) => {
      //handles first then
      console.log("UPDATED PRODUCT");
      response.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (request, response, next) => {
  const prodId = request.body.productId;
  Product.findByPk(prodId)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      response.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (request, response, next) => {
  request.user
    .getProducts()
    .then((products) => {
      response.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      }); //use default template engine
    })
    .catch((err) => console.log(err));
};

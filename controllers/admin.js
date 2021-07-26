const Product = require("../models/product");

exports.getAddProductPage = (request, response, next) => {
  //render .pug file
  response.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: request.session.isLoggedIn,
  });
};

exports.getEditProductPage = (request, response, next) => {
  const editMode = request.query.edit;
  if (!editMode) {
    return response.redirect("/");
  }

  const prodId = request.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return response.redirect("/");
      }

      response.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        isAuthenticated: request.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postAddProduct = (request, response, next) => {
  const title = request.body.title;
  const imageUrl = request.body.imageUrl;
  const price = request.body.price;
  const description = request.body.description;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: request.user, //mongoose will reach _id by itself
  });

  product
    .save() //coming from mongoose
    .then(() => {
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

  Product.findById(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then((result) => {
      //handles first then
      console.log("UPDATED PRODUCT");
      response.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (request, response, next) => {
  Product.find()
    // .select("title price -_id") //specific fields, with '-' we say we don't want _id
    // .populate("userId") //add after find, populate certain field with all the detail information. First comment can be applied here on second argument
    .then((products) => {
      response.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: request.session.isLoggedIn,
      }); //use default template engine
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (request, response, next) => {
  const prodId = request.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log("REMOVED PRODUCT");
      response.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

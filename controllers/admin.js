const fileHelper = require("../util/file");

const { validationResult } = require("express-validator");

const Product = require("../models/product");

exports.getAddProductPage = (request, response, next) => {
  //render .pug file
  response.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
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
        hasError: false,
        product: product,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      return generate500Error(error);
    });
};

exports.postAddProduct = (request, response, next) => {
  const title = request.body.title;
  const image = request.file;
  const price = request.body.price;
  const description = request.body.description;

  if (!image) {
    return response.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/admin-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image.",
      validationErrors: [],
    });
  }
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/admin-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      // return generate500Error(error);
    });
};

exports.postEditProduct = (request, response, next) => {
  const prodId = request.body.productId;
  const updatedTitle = request.body.title;
  const image = request.file;
  const updatedPrice = request.body.price;
  const updatedDescription = request.body.description;
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== request.user._id.toString()) {
        return response.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save();
    })
    .then((result) => {
      //handles first then
      console.log("UPDATED PRODUCT");
      response.redirect("/admin/products");
    })
    .catch((err) => {
      return generate500Error(error);
    });
};

exports.getProducts = (request, response, next) => {
  Product.find({ userId: request.user._id })
    // .select("title price -_id") //specific fields, with '-' we say we don't want _id
    // .populate("userId") //add after find, populate certain field with all the detail information. First comment can be applied here on second argument
    .then((products) => {
      response.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      }); //use default template engine
    })
    .catch((err) => {
      return generate500Error(error);
    });
};

exports.deleteProduct = (request, response, next) => {
  const prodId = request.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) return next(new Error("Product not found"));

      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: request.user._id });
    })
    .then(() => {
      console.log("REMOVED PRODUCT");
      response.status(200).json({ message: "Success!" });
    })
    .catch((err) => {
      response.status(500).json({ message: "Deleting product failed." });
    });
};

generate500Error = (err) => {
  const error = new Error(error.message);
  error.httpStatusCode = 500;
  return next(error);
};

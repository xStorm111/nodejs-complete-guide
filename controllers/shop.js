const Product = require("../models/product");
const Cart = require("../models/cart");
const { response } = require("express");

exports.getProducts = (request, response, next) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      response.render("shop/product-list", {
        prods: rows,
        pageTitle: "All Products",
        path: "/products",
      }); //use default template engine
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductById = (request, response, next) => {
  const productId = request.params.productId;

  Product.findById(productId)
    .then(([product]) => {
      response.render("shop/product-detail", {
        product: product[0],
        pageTitle: product[0].title,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));

  // response.redirect("/");
};

exports.getIndex = (request, response, next) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      response.render("shop/index", {
        prods: rows,
        pageTitle: "Shop",
        path: "/",
      }); //use default template engine
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (request, response, next) => {
  Cart.getCart((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (product of products) {
        const cartProductData = cart.products.find(
          (prod) => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      response.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: cartProducts,
      }); //use default template engine
    });
  });
};

exports.postCart = (request, response, next) => {
  const prodId = request.body.productId;
  Product.findById(prodId, (product) => {
    Cart.addProduct(prodId, product.price);
    response.redirect("/cart");
  });
};

exports.postCartDeleteProduct = (request, response, next) => {
  const prodId = request.body.productId;
  Product.findById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price);
    response.redirect("/cart");
  });
};

exports.getOrders = (request, response, next) => {
  response.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
  }); //use default template engine
};

exports.getCheckout = (request, response, next) => {
  response.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  }); //use default template engine
};

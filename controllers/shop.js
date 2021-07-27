const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (request, response, next) => {
  Product.find()
    .then((products) => {
      response.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: request.session.isLoggedIn,
      }); //use default template engine
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductById = (request, response, next) => {
  const productId = request.params.productId;

  Product.findById(productId)
    .then((product) => {
      response.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: request.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));

  // response.redirect("/");
};

exports.getIndex = (request, response, next) => {
  Product.find()
    .then((products) => {
      response.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      }); //use default template engine
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (request, response, next) => {
  request.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      response.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isAuthenticated: request.session.isLoggedIn,
      }); //use default template engine
    })
    .catch((err) => console.log(err));
};

exports.postCart = (request, response, next) => {
  const prodId = request.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return request.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      response.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (request, response, next) => {
  const prodId = request.body.productId;
  request.user
    .removeFromCart(prodId)
    .then((result) => {
      response.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (request, response, next) => {
  request.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((p) => {
        return { quantity: p.quantity, product: { ...p.productId._doc } }; //_doc only the data we need, because otherwise we will retrieve a bunch of unnecessary data
      });
      const order = new Order({
        user: {
          email: request.user.email,
          userId: request.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      request.user.clearCart();
    })
    .then(() => {
      response.redirect("/orders");
    })
    .catch((err) => console.log(err));
};
exports.getOrders = (request, response, next) => {
  Order.find({ "user.userId": request.user._id })
    .then((orders) => {
      response.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuthenticated: request.session.isLoggedIn,
      }); //use default template engine
    })
    .catch((err) => console.log(err));
};

// exports.getCheckout = (request, response, next) => {
//   response.render("shop/checkout", {
//     path: "/checkout",
//     pageTitle: "Checkout",
//   }); //use default template engine
// };

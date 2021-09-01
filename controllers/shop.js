const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 1;
exports.getProducts = (request, response, next) => {
  const page = +request.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      response.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      }); //use default template engine
    })
    .catch((err) => {
      return generate500Error(err);
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
    .catch((err) => generate500Error(err));

  // response.redirect("/");
};

exports.getIndex = (request, response, next) => {
  const page = +request.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      response.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      }); //use default template engine
    })
    .catch((err) => {
      return generate500Error(err);
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
    .catch((err) => generate500Error(err));
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
    .catch((err) => generate500Error(err));
};

exports.postCartDeleteProduct = (request, response, next) => {
  const prodId = request.body.productId;
  request.user
    .removeFromCart(prodId)
    .then((result) => {
      response.redirect("/cart");
    })
    .catch((err) => generate500Error(err));
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
    .catch((err) => generate500Error(err));
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
    .catch((err) => generate500Error(err));
};

exports.getInvoice = (request, response, next) => {
  const orderId = request.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }

      if (order.user.userId.toString() !== request.user._id.toString()) {
        return next(new Error("Unauthorized!"));
      }

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();

      response.setHeader("Content-Type", "application/pdf");
      response.setHeader(
        "Content-Disposition",
        "attachment; filename=" + invoiceName + ""
      );

      //stream allows browser to download files step by step
      //this way we avoid overflows on memory for large files.
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(response);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.text("--------------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " x " +
              " $ " +
              prod.product.price
          );
      });
      pdfDoc.text("---");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
      pdfDoc.end();
    })
    .catch((err) => next(err));
};

exports.getCheckout = (request, response, next) => {
  let products;
  let total = 0;
  request.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      total = 0;

      products.forEach((prod) => {
        total += prod.quantity * prod.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"], //credit-card payment
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100, //specify in cents
            currency: "usd",
            quantity: p.quantity,
          };
        }),
        success_url:
          request.protocol + "://" + request.get("host") + "/checkout/success",
        cancel_url:
          request.protocol + "://" + request.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      response.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        totalSum: total,
        products: products,
        sessionId: session.id,
      }); //use default template engine
    })
    .catch((err) => generate500Error(err));
};

exports.getCheckoutSuccess = (request, response, next) => {
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
    .catch((err) => generate500Error(err));
};

generate500Error = (err) => {
  const error = new Error(err.message);
  error.httpStatusCode = 500;
  return next(error);
};

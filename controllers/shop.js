const Product = require("../models/product");

exports.getProducts = (request, response, next) => {
  Product.findAll()
    .then((products) => {
      response.render("shop/product-list", {
        prods: products,
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

  // Product.findAll({ where: { productId: productId } })
  //   .then((products) => {
  //     response.render("shop/product-detail", {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: "/products",
  //     });
  //   })
  //   .catch((err) => {});

  Product.findById(productId)
    .then((product) => {
      response.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));

  // response.redirect("/");
};

exports.getIndex = (request, response, next) => {
  Product.findAll()
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
    .getCart()
    .then((cart) => {
      return cart
        .getProducts()
        .then((products) => {
          response.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
          }); //use default template engine
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postCart = (request, response, next) => {
  const prodId = request.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  request.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }

      return Product.findByPk(prodId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      response.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (request, response, next) => {
  const prodId = request.body.productId;
  request.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then((result) => {
      response.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (request, response, next) => {
  let fetchedCart;
  request.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return request.user
        .createOrder()
        .then((order) => {
          order.addProducts(
            products.map((product) => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .then((result) => {
          fetchedCart.setProducts(null);
        })
        .then((result) => {
          response.redirect("/orders");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
exports.getOrders = (request, response, next) => {
  request.user
    .getOrders({ include: ["products"] })
    .then((orders) => {
      response.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
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

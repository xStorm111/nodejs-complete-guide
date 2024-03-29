const express = require("express");
const router = express.Router();

const isAuth = require("../middleware/is-auth");
const shopController = require("../controllers/shop");

//this should be allows the last one
router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProductById);
router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);
router.get("/orders", isAuth, shopController.getOrders);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.get("/checkout", shopController.getCheckout);
router.get("/checkout/success", shopController.getCheckoutSuccess);
router.get("/checkout/cancel", shopController.getCheckout);

module.exports = router;

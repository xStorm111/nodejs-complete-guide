const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

//this should be allows the last one
router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProductById);
router.get("/cart", shopController.getCart);
router.post("/cart", shopController.postCart);
router.post("/cart-delete-item", shopController.postCartDeleteProduct);
router.post("/create-order", shopController.postOrder);
router.get("/orders", shopController.getOrders);
// router.get("/checkout", shopController.getCheckout);
module.exports = router;

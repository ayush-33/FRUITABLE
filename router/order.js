const express = require("express");
const router = express.Router();
const Cart = require("../models/cart"); 
const Product = require("../models/product");
const { v4: uuidv4 } = require('uuid');
const Order = require("../models/orders");
const {isLoggedIn} = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const orderController = require("../controller/orderController.js");

//preapre payment
router.post("/prepare-payment",isLoggedIn, wrapAsync(orderController.preparePayment));

//Payment page
router.get("/payment",isLoggedIn,wrapAsync(orderController.payment));

//confirm order
router.post("/confirm", isLoggedIn, wrapAsync(orderController.confirmOrder));

module.exports = router;

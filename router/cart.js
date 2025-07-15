const express = require("express");
const router = express.Router();
const Cart = require("../models/cart"); 
const Product = require("../models/product");
const { v4: uuidv4 } = require('uuid');
const Order = require("../models/orders");
const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const CartController = require("../controller/cartController.js");

// GET cart page (protected)
router.get("/", isLoggedIn, wrapAsync(CartController.renderCart));

// Add item to cart (protected)
router.post("/add/:productId", isLoggedIn, wrapAsync(CartController.addToCart));

// Update cart item quantity (protected)
router.post("/update/:cartItemId", isLoggedIn, wrapAsync(CartController.updateCartItem));

// Remove item from cart (protected)
router.post("/delete/:cartItemId", isLoggedIn, wrapAsync(CartController.removeCartItem));

// GET checkout page (protected)
router.get("/checkout", isLoggedIn, wrapAsync(CartController.checkout));

module.exports = router;

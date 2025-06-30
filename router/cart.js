const express = require("express");
const router = express.Router();
const Cart = require("../models/cart"); 
const Product = require("../models/product");
const { v4: uuidv4 } = require('uuid');

router.get("/", async (req, res) => {
    if (!req.session.cart) req.session.cart = [];
  console.log("Session cart on load:", req.session.cart);
  try {
    let cartItems = [];

    if (req.user) {
      const userId = req.user._id;
      cartItems = await Cart.find({ user: userId }).populate("product");
    } else if (req.session.cart && req.session.cart.length > 0) {
      // Guest user session cart
      const productIds = req.session.cart.map(item => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });

      cartItems = req.session.cart.map(item => {
        const product = products.find(p => p._id.toString() === item.productId);
        return {
          product,
          quantity: item.quantity,
          cartItemId: item.cartItemId
        };
      });
    }

    // If no cartItems found, render empty.ejs
    if (cartItems.length === 0) {
      return res.render("products/empty.ejs");
    }

    // Otherwise render cart page
    res.render("products/cart.ejs", { cartItems });

  } catch (err) {
    console.error("Cart GET Error:", err);
    res.status(500).send("Server error");
  }
});


router.post("/add/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    // If user is logged in
    if (req.user) {
      const userId = req.user._id;
      let cartItem = await Cart.findOne({ user: userId, product: productId });

      if (cartItem) {
        cartItem.quantity += 1;
      } else {
        cartItem = new Cart({ user: userId, product: productId, quantity: 1 });
        req.flash("success", "Item added to Cart");
      }

      await cartItem.save();
      return res.redirect("/cart");
    }

    // If user is not logged in — use session
    if (!req.session.cart) req.session.cart = [];

    const existingItem = req.session.cart.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      req.session.cart.push({
        cartItemId: uuidv4(), // generate a temporary ID
        productId,
        quantity: 1
      });
      req.flash("success", "Item added to Cart");
    }

    res.redirect("/cart");

  } catch (err) {
    console.error("Cart POST Error:", err);
    res.status(500).send("Server error");
  }
});

//update
router.post("/update/:cartItemId", async (req, res) => {
  const cartItemId = req.params.cartItemId;
  const { quantity } = req.body;

  try {
    if (req.user) {
      await Cart.findByIdAndUpdate(cartItemId, { quantity });
      return res.json({ success: true });
    }

    // Guest user logic
    const sessionCart = req.session.cart || [];
    const item = sessionCart.find(item => item.cartItemId === cartItemId);
    if (item) {
      item.quantity = quantity;
      return res.json({ success: true });
    }

    res.json({ success: false, error: "Cart item not found" });
  } catch (error) {
    console.log("Error updating cart:", error);
    res.json({ success: false, error: error.message });
  }
});

// Remove item from cart
router.post("/delete/:cartItemId", async (req, res) => {
  try {
    const userId = req.user._id;
    const cartItemId = req.params.cartItemId;

    const deletedItem = await Cart.findOneAndDelete({ _id: cartItemId, user: userId });

    if (!deletedItem) {
      return req.flash("error","Cart item not found");
    }
    req.flash("success","Item removed From Cart");
    res.redirect("/cart"); // Redirect back to cart page
  } catch (err) {
    console.error("Delete Cart Item Error:", err);
    req.flash("error","Server error");
  }
});

module.exports = router;

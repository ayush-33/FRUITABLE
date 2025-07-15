const Cart = require("../models/cart"); 
const Product = require("../models/product");
const { v4: uuidv4 } = require('uuid');
const Order = require("../models/orders");

module.exports.renderCart = async (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be logged in to view your cart");
    return res.redirect("/login");
  }

  try {
    const userId = req.user._id;
    let cartItems = await Cart.find({ user: userId }).populate("product");
    cartItems = cartItems.filter(item => item.product);

    if (cartItems.length === 0) {
      return res.render("products/empty.ejs");
    }

    res.render("products/cart.ejs", { cartItems });
  } catch (err) {
    console.error("Cart GET Error:", err);
    res.status(500).send("Server error");
  }
};

// Add item to cart
module.exports.addToCart = async (req, res) => {
  try {
    const productId = req.params.productId;

    // If user is not logged in, redirect to login
    if (!req.user) {
      req.flash("error", "You must be logged in to add to cart");
      return res.redirect("/login");
    }

    // If user is logged in
    const userId = req.user._id;
    let cartItem = await Cart.findOne({ user: userId, product: productId });

    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      cartItem = new Cart({ user: userId, product: productId, quantity: 1 });
      req.flash("success", "Item added to Cart");
    }

    await cartItem.save();
    res.redirect("/cart");

  } catch (err) {
    console.error("Cart POST Error:", err);
    res.status(500).send("Server error");
  }
};

module.exports.updateCartItem = async (req, res) => {
  const cartItemId = req.params.cartItemId;
  const { quantity } = req.body;

  try {
    await Cart.findByIdAndUpdate(cartItemId, { quantity });
    res.json({ success: true });
  } catch (error) {
    console.log("Error updating cart:", error);
    res.json({ success: false, error: error.message });
  }
};

module.exports.removeCartItem = async (req, res) => {
  try {
    const cartItemId = req.params.cartItemId;
    const userId = req.user._id;

    const deletedItem = await Cart.findOneAndDelete({ _id: cartItemId, user: userId });
    if (!deletedItem) {
      req.flash("error", "Cart item not found");
    } else {
      req.flash("success", "Item removed From Cart");
    }
    res.redirect("/cart");
  } catch (err) {
    console.error("Delete Cart Item Error:", err);
    req.flash("error", "Server error");
    res.redirect("/cart");
  }
};

module.exports.checkout = async (req, res) => {
  try {
    let cartItems = [];
    let user = req.user;

    // Fetch cart items for logged-in user
    cartItems = await Cart.find({ user: user._id, quantity: { $gt: 0 } }).populate("product");

    // Filter out any cart items with missing product references
    cartItems = cartItems.filter(item => item.product);

    // Defensive default address if missing
    if (!user.address) {
      user.address = { line1: "", city: "", state: "", pincode: "" };
    }

    // Render checkout page
    res.render("products/checkout", { cartItems, user });

  } catch (err) {
    console.error("Checkout GET Error:", err);
    res.status(500).send("Server error");
  }
};

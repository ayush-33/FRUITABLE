const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError");
const Cart = require("../models/cart.js");
const Product = require("../models/product.js");
const Order = require("../models/orders.js");

module.exports.preparePayment = async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error", "Please log in to proceed");
      return res.redirect("/user/login");
    }

    const { name, phone, line1, city, state, pincode } = req.body;

    // Fetch user's cart items with products populated
    const cartItems = await Cart.find({ user: req.user._id, quantity: { $gt: 0 } }).populate("product");

    if (cartItems.length === 0) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/cart");
    }

    // Prepare items array with only product IDs (for DB storage) + product names (for temporary display)
    const items = cartItems.map(item => ({
      product: item.product._id, // store only ObjectId in DB
      productName: item.product.name, // for temporary session display
      quantity: item.quantity,
      price: item.product.price
    }));

    const itemsTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const platformFee = 3;
    const totalAmount = itemsTotal + platformFee;

    // Save order details temporarily in session for payment page
    req.session.tempOrder = {
      name, phone, line1, city, state, pincode,
      items,
      totalAmount
    };

    return res.redirect("/order/payment");

  } catch (err) {
    console.error("Prepare Payment Error:", err);
    return res.status(500).send("Server error");
  }
};

module.exports.payment = (req, res) => {
  if (!req.session.tempOrder) {
    req.flash("error", "No order in progress");
    return res.redirect("/cart");
  }

  // Render payment page with tempOrder containing product names for display
  return res.render("products/payment", { tempOrder: req.session.tempOrder });
};

module.exports.confirmOrder = async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error", "Please log in to place an order");
      return res.redirect("/user/login");
    }

    const tempOrder = req.session.tempOrder;
    if (!tempOrder) {
      req.flash("error", "No order to confirm");
      return res.redirect("/cart");
    }

    const { name, phone, line1, city, state, pincode, items, totalAmount } = tempOrder;

    // Prepare items array for order schema (removing productName as schema stores only ObjectId)
    const orderItems = items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price
    }));

    // Create new order
    const newOrder = new Order({
      user: req.user._id,
      phone,
      address: { line1, city, state, pincode },
      items: orderItems,
      totalAmount
    });

    await newOrder.save();

    // Clear user's cart after order placed
    await Cart.deleteMany({ user: req.user._id });

    // Delete tempOrder from session
    delete req.session.tempOrder;

    req.flash("success", "🎉 Congratulations! Your order has been placed successfully.");
    return res.redirect("/"); // redirect to home page

  } catch (err) {
    console.error("Order POST Error:", err);
    return res.status(500).send("Server error");
  }
};

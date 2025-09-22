const Cart = require("../models/cart");
const Product = require("../models/product");
// Removed uuidv4 and Order since unused

// 📌 Render Cart Page
module.exports.renderCart = async (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be logged in to view your cart");
    return res.redirect("/user/login");
  }

  try {
    const userId = req.user._id;
    let cartItems = await Cart.find({ user: userId }).populate("product");

    // filter out invalid/missing products
    cartItems = cartItems.filter(item => item.product);

    if (cartItems.length === 0) {
      return res.render("products/empty.ejs");
    }

    res.render("products/cart.ejs", { cartItems });
  } catch (err) {
    console.error("Cart GET Error:", err);
    req.flash("error", "Unable to load your cart");
    res.redirect("/");
  }
};

// 📌 Add item to cart
module.exports.addToCart = async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!req.user) {
      req.flash("error", "You must be logged in to add to cart");
      return res.redirect("/user/login");
    }

    const userId = req.user._id;
    let cartItem = await Cart.findOne({ user: userId, product: productId });

    if (cartItem) {
      cartItem.quantity += 1;
      req.flash("success", "Item quantity updated in Cart");
    } else {
      cartItem = new Cart({ user: userId, product: productId, quantity: 1 });
      req.flash("success", "Item added to Cart");
    }

    await cartItem.save();
    res.redirect("/cart");

  } catch (err) {
    console.error("Cart POST Error:", err);
    req.flash("error", "Unable to add item to cart");
    res.redirect("/product");
  }
};

// 📌 Update cart item quantity
module.exports.updateCartItem = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const cartItemId = req.params.cartItemId;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.json({ success: false, error: "Invalid quantity" });
  }

  try {
    const updated = await Cart.findOneAndUpdate(
      { _id: cartItemId, user: req.user._id },
      { quantity },
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, error: "Cart item not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.log("Error updating cart:", error);
    res.json({ success: false, error: error.message });
  }
};

// 📌 Remove cart item
module.exports.removeCartItem = async (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be logged in to remove items");
    return res.redirect("/user/login");
  }

  try {
    const cartItemId = req.params.cartItemId;
    const userId = req.user._id;

    const deletedItem = await Cart.findOneAndDelete({ _id: cartItemId, user: userId });

    if (!deletedItem) {
      req.flash("error", "Cart item not found");
    } else {
      req.flash("success", "Item removed from Cart");
    }

    res.redirect("/cart");
  } catch (err) {
    console.error("Delete Cart Item Error:", err);
    req.flash("error", "Unable to remove item from cart");
    res.redirect("/cart");
  }
};

// 📌 Checkout page
module.exports.checkout = async (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be logged in to checkout");
    return res.redirect("/user/login");
  }

  try {
    let cartItems = await Cart.find({ user: req.user._id, quantity: { $gt: 0 } }).populate("product");

    // filter out invalid/missing products
    cartItems = cartItems.filter(item => item.product);

    if (cartItems.length === 0) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/cart");
    }

    // Ensure user has an address (fallback empty object)
    if (!req.user.address) {
      req.user.address = { line1: "", city: "", state: "", pincode: "" };
    }

    res.render("products/checkout", { cartItems, user: req.user });

  } catch (err) {
    console.error("Checkout GET Error:", err);
    req.flash("error", "Unable to proceed to checkout");
    res.redirect("/cart");
  }
};

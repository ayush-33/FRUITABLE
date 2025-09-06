const User = require("../models/user");
const Cart = require("../models/cart");

module.exports.renderSignup = (req,res) => {
    res.render("users/signup.ejs");
};


module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });

    await User.register(user, password);

    req.flash("success", "Welcome to Fruitable!");
    const redirectUrl = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(redirectUrl);

  } catch (err) {
    console.log("Signup error:", err);

    if (err.name === "UserExistsError") {
      req.flash("error", "Username already exists. Please login or use a different username.");
      return res.redirect("/user/login");
    }

    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      req.flash("error", "Email already registered. Please login.");
      return res.redirect("/user/login");
    }

    req.flash("error", err.message);
    res.redirect("/user/signup");
  }
};


module.exports.renderLogin = (req,res) => {
    console.log("Login page requested");
    res.render("users/login.ejs");
};


module.exports.login = (req, res) => {
  let redirectUrl = req.session.returnTo || req.cookies.returnTo || "/";

  // Prevent redirecting to API/JSON endpoints
  if (
    redirectUrl.startsWith("/api") ||
    redirectUrl.startsWith("/product/shop/api") ||
    redirectUrl.endsWith(".json")
  ) {
    redirectUrl = "/product/shop"; // or your dashboard/home page
  }

  // Prevent looping back to auth pages
  if (
    redirectUrl === "/user/login" ||
    redirectUrl === "/user/signup" ||
    redirectUrl === "/user/logout"
  ) {
    redirectUrl = "/";
  }

  res.clearCookie("returnTo");
  delete req.session.returnTo;

  req.flash("success", "Welcome back!");
  res.redirect(redirectUrl);
};




module.exports.logout = (req,res) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success","Logged you out!");
        res.redirect("/");
    });
};
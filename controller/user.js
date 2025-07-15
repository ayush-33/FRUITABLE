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
    const redirectUrl = req.session.returnTo || "/product";
    delete req.session.returnTo;
    res.redirect(redirectUrl);

  } catch (err) {
    console.log("Signup error:", err);

    if (err.name === "UserExistsError") {
      req.flash("error", "Username already exists. Please login or use a different username.");
      return res.redirect("/login");
    }

    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      req.flash("error", "Email already registered. Please login.");
      return res.redirect("/login");
    }

    req.flash("error", err.message);
    res.redirect("/signup");
  }
};


module.exports.renderLogin = (req,res) => {
    console.log("Login page requested");
    res.render("users/login.ejs");
};


module.exports.login = (req, res) => {
  // console.log("Login page requested");
  const redirectUrl = req.cookies.returnTo || "/product";
  res.clearCookie("returnTo"); // Clean up after use
  // console.log(" Redirecting to:", redirectUrl);
  req.flash("success", "Welcome back!");
  res.redirect(redirectUrl);
};



module.exports.logout = (req,res) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success","Logged you out!");
        res.redirect("/product");
    });
};
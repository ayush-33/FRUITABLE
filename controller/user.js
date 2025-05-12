const User = require("../models/user");

module.exports.renderSignup = (req,res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req,res) => {
    try {
        let {username , email ,password} = req.body;
        const newUser = new User ({email , username});
        const registerUser = await User.register(newUser , password);

        req.login(registerUser , (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Fruitable!");
            res.redirect("/product");
        })
    }catch (e) {
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLogin = (req,res) => {
    console.log("Login page requested");
    res.render("users/login.ejs");
};

module.exports.login = (req,res) => {
    req.flash("success", "welcome back to Fruitable!");
    let redirectUrl = res.locals.redirectUrl || "/product";
    res.redirect(redirectUrl)
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
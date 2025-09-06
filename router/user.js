const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/user.js");


//signup 
router.route("/signup")
.get(userController.renderSignup)
.post(wrapAsync(userController.signup));

//login
router.route("/login")
.get(userController.renderLogin)
.post(passport.authenticate("local",{failureRedirect : "/user/login", failureFlash : true}),userController.login);

//Log out route
router.get("/logout", userController.logout);

module.exports = router;

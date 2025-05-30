const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Product = require("../models/product.js");
const {isLoggedIn,validateProduct} = require("../middleware.js");
const productController = require("../controller/productController.js");


router.get('/contact', (req, res) => {
  res.render("products/contact.ejs"); 
});

router.route("/")
//index route
.get(wrapAsync(productController.index))
//post route
.post(isLoggedIn,validateProduct,wrapAsync(productController.createProduct));

//Router to render form 
router.get("/new",isLoggedIn,productController.renderForm);

router.route("/:id")
//show route
.get(wrapAsync(productController.showProduct))
//put route
.put(isLoggedIn,validateProduct,wrapAsync(productController.updateProduct))
//delete route
.delete(wrapAsync(isLoggedIn,productController.delete))

//edit form 
router.get("/:id/edit",isLoggedIn,wrapAsync(productController.renderEditForm))

module.exports = router;
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Product = require("../models/product.js");
const {validateProduct} = require("../middleware.js");
const productController = require("../controller/productController.js");

router.route("/")
//index route
.get(wrapAsync(productController.index))
//post route
.post(validateProduct,wrapAsync(productController.createProduct));

//Router to render form 
router.get("/new",productController.renderForm);

router.route("/:id")
//show route
.get(wrapAsync(productController.showProduct))
//put route
.put(validateProduct,wrapAsync(productController.updateProduct))
//delete route
.delete(wrapAsync(productController.delete))

//edit form 
router.get("/:id/edit",wrapAsync(productController.renderEditForm))

module.exports = router;
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Product = require("../models/product.js");
const {isLoggedIn,validateProduct} = require("../middleware.js");
const productController = require("../controller/productController.js");
const multer  = require('multer')
const {storage} = require("../CloudConfig.js");
const upload = multer({ storage })

router.get('/contact', (req, res) => {
  res.render("products/contact.ejs", { currentRoute: "/product/contact"}); 
});

// search route (e.g., /search?q=apple)
const pluralize = require('pluralize');

router.get("/search", async (req, res) => {
  const q = req.query.q;
  const category = req.query.category;
  const query = (q || category || '').toLowerCase().trim();

  const redisClient = req.app.locals.redisClient;

  const singular = pluralize.singular(query);
  const plural = pluralize.plural(query);

  // Combined regex matches both singular, query and plural
  const searchRegex = new RegExp(`\\b(${singular}|${plural}|${query})s?\\b`, 'i');

  try {
    const cached = await redisClient.get(query);
    if (cached) {
      console.log("Cache Hit for:", query);
      return res.render("products/searchResults.ejs", {
        query,
        rawQuery: q,
        category,
        results: JSON.parse(cached)
      });
    }

    const results = await Product.find({
      $or: [
        { name: searchRegex },
        { category: searchRegex }
      ]
    });

    await redisClient.set(query, JSON.stringify(results), { EX: 3600 });

    console.log("📡 DB Hit for:", query);
    res.render("products/searchResults.ejs", { query, rawQuery: q, category, results });

  } catch (err) {
    console.error("Search error:", err);
    req.flash("error", "Something went wrong while searching.");
   return  res.redirect("/");
  }
});


router.route("/")
//index router

//post route
.post(isLoggedIn,upload.single("image"), validateProduct,wrapAsync(productController.createProduct));

//shop
router.get("/shop",wrapAsync(productController.renderShopPageSSR)); 
router.get("/shop/api",wrapAsync(productController.renderShopItems));


//Router to render form 
router.get("/new",isLoggedIn,productController.renderForm);

router.route("/:id")
//show route
.get(wrapAsync(productController.showProduct))
//put route
.put(isLoggedIn,upload.single("image"),validateProduct,wrapAsync(productController.updateProduct))
//delete route
.delete(isLoggedIn, wrapAsync(productController.delete))

//edit form 
router.get("/:id/edit",isLoggedIn,wrapAsync(productController.renderEditForm))


module.exports = router;
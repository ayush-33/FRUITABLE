const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Product = require("../models/product.js");
const {isLoggedIn,validateProduct} = require("../middleware.js");
const productController = require("../controller/productController.js");


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
    res.redirect("/");
  }
});

// router.get("/category", async (req, res) => {
//   try {
//     const category = req.query.category;

//     let filter = { isFresh: false };
//     if (category) {
//       filter.category = { $regex: `^${category}$`, $options: "i" };
//     }

//     const allitems = await Product.find(filter);
//     const freshItems = await Product.find({ isFresh: true });

//     // ✅ add category here
//     res.render("products/index.ejs", { allitems, freshItems, category });
//   } catch (err) {
//     console.error("Error in /product/category route:", err);
//     req.flash("error", "Unable to load products");
//     res.redirect("/");
//   }
// });




router.route("/")
//index router
// .get(wrapAsync(productController.index))
//post route
.post(isLoggedIn,validateProduct,wrapAsync(productController.createProduct));

//shop
router.get("/shop",wrapAsync(productController.renderShopPageSSR)); 
router.get("/shop/api",wrapAsync(productController.renderShopItems));


//Router to render form 
router.get("/new",isLoggedIn,productController.renderForm);

router.route("/:id")
//show route
.get(wrapAsync(productController.showProduct))
//put route
.put(isLoggedIn,validateProduct,wrapAsync(productController.updateProduct))
//delete route
.delete(isLoggedIn, wrapAsync(productController.delete))

//edit form 
router.get("/:id/edit",isLoggedIn,wrapAsync(productController.renderEditForm))

// router.get("/api/products", async (req, res) => {
//   try {
//     const products = await Product.find({ isFresh: false }); // or {} for all products
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// router.get("/api/products", async (req, res) => {
//   try {
//     const category = req.query.category || "";
//     let filter = { isFresh: false };

//     if (category) {
//       filter.category = { $regex: `^${category}$`, $options: "i" };
//     }

//     const products = await Product.find(filter);
//     res.json(products);
//   } catch (err) {
//     console.error("Error in /api/products route:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

module.exports = router;
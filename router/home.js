const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// Home page (render all products for JS, and freshItems for scroller)
router.get("/", async (req, res) => {
  try {
    const category = req.query.category || ""; // always defined
    let filter = { isFresh: false };

    if (category) {
      filter.category = { $regex: category, $options: "i" };

    }

    const allitems = await Product.find(filter);
    const freshItems = await Product.find({ isFresh: true });

    res.render("products/index.ejs", { allitems, freshItems, category });
  } catch (err) {
    console.error("Error loading products:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

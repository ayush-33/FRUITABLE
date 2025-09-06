const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// Fetch products as JSON
router.get("/products", async (req, res) => {
  try {
    const category = req.query.category || "";
    let filter = { isFresh: false };

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    const allitems = await Product.find(filter);
    res.json(allitems); // return products in JSON
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

const Product = require("../models/product.js");

module.exports.index = async (req, res) => {
    const allitems = await Product.find({});
    res.render("products/index.ejs", { allitems });
};

module.exports.renderForm = (req, res) => {
    res.render("products/new.ejs");
};

module.exports.showProduct =  async (req, res) => {
    let { id } = req.params;
    let product = await Product.findById(id);
    res.render("products/show.ejs", { product });
};

module.exports.createProduct =  async (req, res, next) => {
    const newProduct = new Product(req.body.product);
    await newProduct.save();
    console.log("item saved to db");
    res.redirect("/product");
};

module.exports.renderEditForm =  async (req, res) => {
    let { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
        return res.status(404).send('Product not found');
  }
  res.render("products/edit.ejs", { product });
};

module.exports.updateProduct =  async (req, res) => {
    let { id } = req.params;
    let product = await Product.findByIdAndUpdate(id, { ...req.body.product });
    await product.save();
    res.redirect(`/product/${id}`);
};
  
module.exports.delete = async (req, res) => {
    let { id } = req.params;
    let product = await Product.findByIdAndDelete(id);
    res.redirect("/product");
  };


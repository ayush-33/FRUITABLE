const Product = require("../models/product.js");
const { productSchema } = require("../schema.js"); // Adjust path as needed
const ExpressError = require("../utils/ExpressError");
const pluralize = require('pluralize');

// module.exports.index = async (req, res) => {
//   try {
//     const category = req.query.category;
//     let filter = { isFresh: false }; // base filter

//     if (category) {
//       filter.category = { $regex: `^${category}$`, $options: 'i' }; // add category filter case-insensitively
//     }

//     const allitems = await Product.find(filter);
//     const freshItems = await Product.find({ isFresh: true }); // unchanged

//     res.render("products/index.ejs", { allitems, freshItems, currentRoute: "/product" });
//   } catch (err) {
//     console.error("Error in /product controller:", err);
//     res.status(500).send("Internal Server Error");
//   }
// };


module.exports.renderForm = (req, res) => {
    res.render("products/new.ejs");
};

module.exports.renderShopPageSSR = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const category = req.query.category;

  let filter = {};
  if (category) {
    const singular = pluralize.singular(category);
    const plural = pluralize.plural(category);
    filter.category = { $regex: `^(${singular}|${plural})$`, $options: 'i' };
  }

  const totalProducts = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  const products = await Product.find(filter)
    .skip((page - 1) * limit)
    .limit(limit);

  res.render("products/shop", {
    products,
    currentPage: page,
    totalPages,
    category
  });
};


module.exports.renderShopItems = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const category = req.query.category;

  try {
    let filter = {};
    if (category) {
      const singular = pluralize.singular(category);
      const plural = pluralize.plural(category);
      filter.category = { $regex: `^(${singular}|${plural})$`, $options: 'i' };
    }

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      products,
      currentPage: page,
      totalPages,
      category
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports.showProduct =  async (req, res) => {
    let { id } = req.params;
    let product = await Product.findById(id).populate({path : "reviews",
        populate : {
            path : "author", }
        }).populate("owner");
        console.log(product.reviews);
    if(!product) {
        req.flash("error","Product you requested for does not exists");
     return  res.redirect("/product");
    }
    res.render("products/show.ejs", { product });
};

module.exports.createProduct =  async (req, res, next) => {
 const { error } = productSchema.validate(req.body);
 if (error) {
        // Collect all error messages from Joi
        const msg = error.details.map(el => el.message).join(", ");
        req.flash("error", msg);
        return res.redirect("/product/new");
    }

    try {
        const newProduct = new Product(req.body.product);
        newProduct.owner = req.user._id;
         if (req.file) {
      newProduct.image = {
        url: req.file.path,       // Cloudinary URL
        filename: req.file.filename
      };
    }
    console.log(req.file);

        await newProduct.save();
        req.flash("success", "New Product Created!");
        res.redirect("/");
    } catch (err) {
        next(err);
    }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    req.flash("error", "Product you requested for does not exist");
    return res.redirect("/");
  }

  let originalImageUrl = product.image?.url || "";
  let resizedImageUrl = originalImageUrl
    ? originalImageUrl.replace("/upload", "/upload/h_300,w_250,c_fill")
    : null;

  res.render("products/edit.ejs", { product, resizedImageUrl });
};


module.exports.updateProduct = async (req, res) => {
  const { id } = req.params;

  // Find product first
  const product = await Product.findById(id);
  if (!product) {
    req.flash("error", "Product not found!");
    return res.redirect("/");
  }

  // Update fields from form
  Object.assign(product, req.body.product);

  // Update image if new file uploaded
  if (req.file) {
    product.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  // Save updated product
  await product.save();

  req.flash("success", "Product Updated!");
  res.redirect(`/product/${id}`);
};

  
module.exports.delete = async (req, res) => {
    let { id } = req.params;
    let product = await Product.findByIdAndDelete(id);
      req.flash("success", "Product Deleted!");
    res.redirect("/");
  };


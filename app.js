const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Product = require("./models/product.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/Fruitable";
const path = require("path"); //for ejs
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

main()
  .then(() => {
    console.log("Connecting to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs"); //enable ejs template
app.set("views", path.join(__dirname, "views")); //ensure ejs looks for ejs file in correct folder
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static("public"));

//index route
app.get("/product", async (req, res) => {
  const allitems = await Product.find({});
  // console.log(allitems);
  res.render("index.ejs", { allitems });
});

//new route
app.get("/product/new", (req, res) => {
  res.render("new.ejs");
});

//post route
app.post("/product", async (req, res) => {
  // console.log(req.body);
  const newProduct = new Product(req.body.product);
  await newProduct.save();
  console.log("item saved to db");
  res.redirect("/product");
});

//show route
app.get("/product/:id", async (req, res) => {
  let { id } = req.params;
  let product = await Product.findById(id);
  res.render("show.ejs", { product });
});

//edit form
app.get("/product/:id/edit", async (req, res) => {
  let { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.redirect("/product");
  }
  res.render("edit.ejs", { product });
});

//update route
app.put("/product/:id", async (req, res) => {
  let { id } = req.params;
  let product = await Product.findByIdAndUpdate(id, { ...req.body.product });
  await product.save();
  res.redirect("/product");
});

//delete route
app.delete("/product/:id", async (req, res) => {
  let { id } = req.params;
  // console.log(id);
  let product = await Product.findByIdAndDelete(id);
  res.redirect("/product");
});

app.listen(8080, () => {
  console.log("Listening to port");
});

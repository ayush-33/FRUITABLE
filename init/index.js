const mongoose = require("mongoose");
const initData = require("./data.js");
const Product = require("../models/product.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/Fruitable";

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

const initDb = async () => {
  await Product.deleteMany({});
  initData.data = initData.data.map((obj) => ({...obj,owner : "683568148b6f68ae949e1e6e"}));
  await Product.insertMany(initData.data);
  console.log("data was inserted");
};

initDb();

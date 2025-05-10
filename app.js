const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Product = require("./models/product.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/Fruitable";
const path = require("path"); //for ejs
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");


const productRouter = require("./router/product.js");

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

//Router
app.use("/product",productRouter);

app.all("*",(req,res,next)=> {
  next(new ExpressError(404, "Page not Found"));
})

//error handling 
app.all("*", (req,res,next) => {
  next(new ExpressError(404,"Page not Found"));
  });
    
//Error handling middleware
app.use((err,req,res,next) => {
  let {statusCode = 500,message = "Some Error Occured"} = err;
  res.status(statusCode).send({ error: message });
});

app.listen(8080, () => {
  console.log("Listening to port");
});

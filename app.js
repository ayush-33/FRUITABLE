const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Product = require("./models/product.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/Fruitable";
const path = require("path"); //for ejs
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

//Redis
const redis = require('redis');
const productRouter = require('./router/product');

const client = redis.createClient();
client.on('error', (err) => console.error('Redis Client Error', err));

// Start server only after Redis is connected
(async () => {
  await client.connect();
  console.log('✅ Redis connected!');
  app.locals.redisClient = client;

  app.listen(8080, () => {
    console.log("Listening to port");
  });
})();

const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
app.use(cookieParser());

// const productRouter = require("./router/product.js");
const userRouter = require("./router/user.js");
const reviewsRouter = require("./router/review.js");
const cartRouter = require("./router/cart.js");
const Cart = require("./models/cart.js");
const orderRouter = require("./router/order.js");

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
app.use(express.json()); 

const store = MongoStore.create({
    mongoUrl : "mongodb://127.0.0.1:27017/Fruitable" ,
    crypto : {
    secret : "SecretCode",
    },
    touchAfter : 24 * 3600,
});
store.on("error", (err) => {
    console.log("error in mongodb store", err);
})


const sessionOptions = {
    store ,
    secret : "SecretCode",
    resave : false,
    saveUninitialized : false,
    cookie : {
        expires: Date.now() + 1000 * 7 * 24 * 60 * 60 ,
        maxAge : 1000 * 7 * 24 * 60 * 60 ,
        httpOnly : true
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curUser = req.user;
    res.locals.req = req; // Pass req to views for dynamic content
    next();
});

// Middleware to set current route for active link highlighting
app.use((req, res, next) => {
  res.locals.currentRoute = req.path;
  next();
});

// Example middleware (add before your routes)
app.use(async (req, res, next) => {
  try {
    if (req.user) {
      res.locals.cartCount = await Cart.countDocuments({ user: req.user._id, quantity: { $gt: 0 } });
    } else {
      res.locals.cartCount = 0;
    }
    next();
  } catch (err) {
    res.locals.cartCount = 0;
    next();
  }
});

// 🔑 Cookie-based returnTo middleware
app.use((req, res, next) => {
  if (!req.isAuthenticated() && req.method === "GET" && !req.path.startsWith("/login") && !req.path.startsWith("/signup")) {
    res.cookie("returnTo", req.originalUrl, { httpOnly: true });
    console.log("🍪 [ReturnTo Cookie] Stored:", req.originalUrl);
  }
  next();
});

//Router
app.use("/product",productRouter);
app.use("/product/:id/reviews", reviewsRouter);
app.use("/cart",cartRouter);
app.use("/",userRouter);
app.use("/order",orderRouter);

app.all("*", (req,res,next) => {
  next(new ExpressError(404,"Page not Found"));
});

//Error handling middleware
app.use((err,req,res,next) => {
  let {statusCode = 500,message = "Some Error Occured"} = err;
  res.status(statusCode).render("error.ejs", {err});
});

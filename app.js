if("process.env.NODE_ENV!==production"){
    require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require('./models/listing.js');
let port=8080;
const path = require("path");
const methodOverride= require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require('./models/review.js');
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash= require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js")


//const Mongo_URL='mongodb://127.0.0.1:27017/wanderlust';

const dbUrl=process.env.ATLASDB_URL;

main()
.then(()=>{
console.log("connected to db");
})

.catch((err)=>{
console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true})); 
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{

        secret:"mysupersecretcode",
    },
    touchAfter:24*3600,
});


store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
});


const sessionOptions={
    store,//session store in Mongodb storage insted of memory.
    secret: "mysuperscretcode",
    resave:false,
    saveUninitialized: true,
    cookie: {
expires: Date.now()+7*24*60*60*1000,
maxAge: 7*24*60*60*1000,
httpOnly: true,//to avoid cross scripting attacks.
    },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=> {
    res.locals.success = req.flash("success"); 
    res.locals.error = req.flash("error");
    res.locals.currUser=req.user;
    next();
});

app.get("/demouser",async(req,res)=>{
    let fakeUser = new User({
        email:"student@gmail.com",
        username: "delta-student"
});
  let registeredUser= await User.register(fakeUser,"helloworld");
  res.send(registeredUser);
})

//app.get("/",(req,res) => {
  //  res.send("I'm root");
//});

/*app.get("/testListing",async(req,res)=>{
let sampleListing = new Listing({
title: "My New Villa",
description: "By the beach ",
price: 200,
location: "Calangute,Goa",
country: "India",
});
await sampleListing.save();
console.log("sample was saved");
res.send("Successful Testing");
}); */




app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);



app.all("*", (req,res,next) => {
    next(new ExpressError(404,"Page Not found!"));
});


app.use((err,req,res,next) => {
    let {statusCode=500,message="Someting went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs",{message});
    //res.status(statusCode).send(message);
});

app.listen(8080,() => {
 console.log("Server listening to this port");     
    });

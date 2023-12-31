//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy;
const findOrCreate = require("mongoose-findOrCreate");




const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret : "Our little secret.",
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://krish:kaviya@blogs.jkftvh7.mongodb.net/bloginc",{useNewURLParser: true});

const postSchema = {

  title: String,
 
  content: String
 
 };
 const userSchema = new mongoose.Schema({
  email : String,
  password : String,
  googleId : String

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Post = mongoose.model("Post", postSchema);
const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


passport.use(new GoogleStrategy({
  clientID:     process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://blogcom-inc.onrender.com/auth/google/home",
  userProfileURL : " https://www.googleapis.com/oauth2/v3/userinfo",
  passReqToCallback   : true
},
function(request, accessToken, refreshToken, profile, done) {
  // console.log(profile)
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return done(err, user);
  });
}
));




app.get("/", function(req, res) {
  res.render("list");
  
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] }));
//The above code is to enough to bring up the pop up that lets you log in into your google account
/*  The next two lines are for when we get back from google and have a response */
app.get("/auth/google/home", 
  passport.authenticate('google', { failureRedirect: '/log' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });




//HOME ROUTE//
app.route("/home")
.get(function(req,res){
 if(req.isAuthenticated()){
  Post.find({}).then(function(posts){
    res.render("home", {
      posts : posts
      });
  })
 }else{
  res.redirect("/log");
 }
      
   
})
.post(function(req,res){
  Post.find({}).then(function(posts){
    res.render("home", {
      posts : posts
      });
  });
});


//REGISTER ROUTE//
app.route("/register")
.get(function(req,res){
  res.render("register");
})
.post(function(req,res){
  User.register({username : req.body.username}, req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/home");
      })
    }
  });
});

//LOG ROUTE//
app.route("/log")
.get(function(req,res){
    
    res.render("login");
  })
  .post(function(req,res){
    const user = new User({
      username : req.body.username,
      password : req.body.password
    });
    req.login(user,function(err){
      if(err){
        console.log(err);
        res.redirect("/");
      }else{
        passport.authenticate("local")(req,res,function(){
          res.redirect("/home");
        });
      }
    });
  });
  

//COMPOSE ROUTE//
app.route("/compose")
.get(function(req, res){
  res.render("compose");
})
.post(function(req, res){
  
    const post = new Post ({
      title: req.body.postTitle,
      content: req.body.postBody
    });
  
    post.save();
    res.redirect("/home")
});


app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;


  Post.findOne({_id: requestedPostId}).then(function(post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  })
  
});


app.get("/logout",function(req,res){
  req.logout(function(err){
    if(err){console.log(err)};
  });
  res.redirect("/");
});


app.get("/about",function(req,res){
  res.render("about");
});
app.get("/contact", function(req, res){
  res.render("contact");
});




app.listen(process.env.PORT || 5000, function() {
  console.log("Server started on port 5000");
});

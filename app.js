//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://krish:kaviya@blogs.jkftvh7.mongodb.net/bloginc",{useNewURLParser: true});
const postSchema = {

  title: String,
 
  content: String
 
 };
 const userSchema = {
  email : String ,
  password : String
 };
const Post = mongoose.model("Post", postSchema);
const User = new mongoose.model("User",userSchema);




app.get("/", function(req, res) {
  res.render("list");
  
});

//HOME ROUTE//
app.route("/home")
.get(function(req,res){
  Post.find({}).then(function(posts){
    res.render("home", {
      posts : posts
      });
      
  });  
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
  const newUser = new User({
    email : req.body.username ,
    password : req.body.password
});
newUser.save()
.then(()=> res.redirect("/home"))
.catch((err)=> console.log(err))
});

//LOG ROUTE//
app.route("/log")
.get(function(req,res){
    
    res.render("login");
  })
  .post(function(req,res){
    const username = req.body.username;
  
    const password = req.body.password;
   
     
        User.findOne({ email: username })
        .then((user) => {
          if (!user) {
            console.log("User doesn't exists at all.");
            res.redirect("/login");
          }
     
          if (user.password === password) {
            res.redirect("/home");
            console.log("User Exists!");
          } else {
            res.redirect("/")
            console.log("Password entered is wrong!");
          }
        })
        .catch((err) => {
          console.log(err);
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

app.get("/about",function(req,res){
  res.render("about");
});
app.get("/contact", function(req, res){
  res.render("contact");
});




app.listen(process.env.PORT || 5000, function() {
  console.log("Server started on port 3000");
});

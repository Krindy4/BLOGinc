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

mongoose.connect('mongodb://127.0.0.1:27017/joshu');
const postSchema = {

  title: String,
 
  content: String
 
 };
const Post = mongoose.model("Post", postSchema);





app.get("/", function(req, res) {
  res.render("list");
  
})
app.get("/about",function(req,res){
  res.render("about");
})
app.post("/log",function(req,res){
  res.render("login")
});
app.post("/home",function(req,res){
  Post.find({}).then(function(posts){
    res.render("home", {
      posts : posts
      });
  });
});

  app.get("/home",function(req,res){
    Post.find({}).then(function(posts){
      res.render("home", {
        posts : posts
        });
        
    });  });
  

  app.get("/about", function(req, res){
    res.render("about");
  });
  
  app.get("/contact", function(req, res){
    res.render("contact");
  });
  
  app.get("/compose", function(req, res){
    res.render("compose");
  });
  app.get("/log",function(req,res){
    let us = req.body.uname;
    let ps = req.body.psw;
    const user = "krish";
    const pass = "krishnan";
    console.log(pass);
    console.log(ps);
    if(us === user && ps === pass ){
      res.redirect("/home");
    }else{
      console.log("Wrong credentials");
    }

    res.render("login");
  });
  app.post("/log",function(req,res){
   
  })
  app.post("/compose", function(req, res){
  
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
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

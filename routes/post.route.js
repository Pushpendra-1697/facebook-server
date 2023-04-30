const Post = require("../model/Post.modal");
const User = require("../model/User.model");
const express = require("express");
const postrouter = express.Router();


// get post
postrouter.get("/", async (req, res) => {
    try {
      const notes = await Post.find();
      res.send(notes.reverse());
    } catch (error) {
      console.log(error)
    }
  
  });




//create a post

postrouter.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost)
  } catch (err) {
    res.status(500).json(err);
  }
});


//update a post

postrouter.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete a post

postrouter.delete("/:id", async (req, res) => {

  // console.log(req.body.userId);
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like / dislike a post

postrouter.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//get a post

postrouter.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});


// get post by userId


postrouter.get("/userpost/:id", async (req, res) => {
  try {
    const post = await Post.find({userId:req.params.id});
    res.status(200).json(post.reverse());
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts

postrouter.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user's all posts

postrouter.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});


//comment
postrouter.put("/:id/comment", async (req, res) => {
  const postId  = req.params.id;
  const { username,profilePicture,comment,curenttime } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const newComment = { username, profilePicture, comment,curenttime };

    post.comment.push(newComment);

    await post.save();

    res.status(200).json({ msg: "Comment added successfully" });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});




module.exports = {
    postrouter,
  };

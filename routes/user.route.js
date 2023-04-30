const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("./../model/User.model");

const userrouter = express.Router();

//all users

userrouter.get("/", async (req, res) => {
  try {
    const notes = await User.find();
    res.send(notes);
  } catch (error) {
    console.log(error)
  }

});

//register


userrouter.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    bcrypt.hash(password, 5, async (err, hash) => {
      // Store hash in your password DB.
      if (err) {
        res.send({ massege: "something went wrong", error: err.message });
      } else {
        const user = new User({ username, email, password: hash });
        await user.save();
        res.send({ massege: "New user register" });
      }
    });
  } catch (error) {
    res.send({ massege: "something went wrong" });
  }
});

//login

let count = 0

userrouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let BlockedTime = Date.now()
  try {
    const user = await User.find({ email });
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, async(err, result) => {
        // result == true
        if (result) {
          const token = jwt.sign({ userID: user[0]._id }, "masai");

          res.send({ massege: "login successful", token: token, id: user[0]._id });
        } else {
          count++

          if(count === 5){
            await User.updateOne({email},{$set:{BlockedTime}})
          }
          res.send({ massege: "wrong Passwaor" });
        }
      });
    } else {
      res.send({ massege: "wrong Email" });
    }
  } catch (error) {
    res.send({ massege: "something went wrong" });
  }
});


// get 


userrouter.get('/get', async (req, res) => {
  var currentTime = Date.now();
  const { email } = req.headers;

  try {
      const user = await User.findOne({ email });
      let BlockedTime = user.BlockedTime;
      if (currentTime - BlockedTime >= 120000 && BlockedTime !== undefined) {
          await User.updateOne({ email }, { $unset: { BlockedTime } });
          res.send({ msg: "Not Blocked" });
      } else if (currentTime - BlockedTime < 120000 && BlockedTime !== undefined) {
          res.send({ msg: "Blocked" });
      } else {
          res.send({ msg: "Login Successful" });
      }
  } catch (err) {
      res.status(404).send({ msg: "Something went wrong😒" })
  }
});


//update user
userrouter.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//delete user
userrouter.delete("/:id", async (req, res) => {
  // if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  // } else {
  //   return res.status(403).json("You can delete only your account!");
  // }
});

//get a user
userrouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update users  profilePicture


userrouter.put("/:id/profilePicture", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = req.body.profilePicture;
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


//update users  coverPicture


userrouter.put("/:id/coverPicture", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.coverPicture = req.body.coverPicture;
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


//get friends
userrouter.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

userrouter.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

userrouter.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});


// Search 

userrouter.get("/search/:username", async (req, res) => {
  const userdata = req.params.username;

  try {
    const user = await User.find(  { username: { $regex: userdata || "", $options: 'i' } },);

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});






module.exports = {
  userrouter,
};

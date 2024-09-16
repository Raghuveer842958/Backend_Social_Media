const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { authentication } = require("../middlewares/authtentication");
const Post = require("../models/postModel");

const createToken = (data) => {
  const token = jwt.sign(data, "Raghu", { expiresIn: "8h" });
  return token;
};

const signUpHandler = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.send({
        response: null,
        message: "Please enter all Fields for SignUp",
        result: false,
      });
    }

    const user = await User.findOne({ email: email });
    if (user) {
      // console.log("User All readey registered");
      return res.send({
        response: null,
        message: "This Email is Allready Registered",
        result: false,
      });
    }

    const newUser = new User({ name, email, password });
    const createdUser = await newUser.save();

    console.log("User Created Successfully");
    return res.send({
      response: createdUser,
      message: "You Registered Successfully",
      result: true,
    });
  } catch (err) {
    console.log("Error in SignUp Route", err);
    return res.send({
      response: err.message,
      message: "SignUp Failed",
      result: false,
    });
  }
};

const loginHandler = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.send({
        response: null,
        message: "Invalid Email Id",
        result: false,
      });
    }

    if (!user.comparePassword(user.password)) {
      return res.send({
        response: null,
        message: "Invalid User Password",
        result: false,
      });
    }

    const payload = {
      email: user.email,
      id: user.id,
    };

    const jwtToken = createToken(payload);
    console.log("User Logined Successfully");

    return res.send({
      response: user,
      message: "You Logined Successfully",
      result: true,
      token: jwtToken,
    });
  } catch (err) {
    console.log("Error in Login Route", err);
    return res.send({
      response: null,
      message: "Login Failed",
      result: false,
    });
  }
};

const logOutHandler = async (req, res) => {
  return res.send({
    message: "This route is Remain to Complete",
  });
};

const followHandler = async (req, res) => {
  let userId = req.params.userId;
  let candidateId = req.params.candidateId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");
  candidateId = candidateId.replace(/[^a-zA-Z0-9]/g, "");

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any user with this id",
        result: false,
      });
    }

    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.send({
        response: null,
        message: "There is no any candidate with this id",
        result: false,
      });
    }

    const userFollowings = user.following;
    const filteredList = userFollowings.filter(
      (data) => data.toString() === candidateId
    );
    if (filteredList.length !== 0) {
      return res.send({
        response: null,
        message: `${user.name} You have Allready Follow to ${candidate.name}`,
        result: false,
      });
    }

    user.following.push(candidate.id);
    const updatedUser = await user.save();
    candidate.followers.push(user.id);
    const updatedCandidate = await candidate.save();

    return res.send({
      response: updatedUser,
      message: `${user.name} You Successfully follow to ${candidate.name}`,
      result: true,
      candidate: updatedCandidate,
    });
  } catch (err) {
    console.log("Error in Follow Route", err.message);
    return res.send({
      error: err.message,
      message: "Error in Follow Route",
      result: null,
    });
  }
};

const unFollowHandler = async (req, res) => {
  let userId = req.params.userId;
  let candidateId = req.params.candidateId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");
  candidateId = candidateId.replace(/[^a-zA-Z0-9]/g, "");

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any user with this id",
        result: false,
      });
    }

    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.send({
        response: null,
        message: "There is no any candidate with this id",
        result: false,
      });
    }

    const userFollowings = user.following;
    const filteredList = userFollowings.filter(
      (data) => data.toString() === candidateId
    );
    if (filteredList.length === 0) {
      return res.send({
        response: null,
        message: `${user.name} First Follow ${candidate.name} then You can unFollow to ${candidate.name}`,
        result: false,
      });
    }

    const newFollowingList = userFollowings.filter(
      (data) => data.toString() !== candidateId
    );
    const candidateFollowers = candidate.followers;
    const newFollowersList = candidateFollowers.filter(
      (data) => data.toString() !== userId
    );

    user.following = newFollowingList;
    const updatedUser = await user.save();
    candidate.followers = newFollowersList;
    const updatedCandidate = await candidate.save();

    return res.send({
      response: updatedUser,
      message: `${user.name} You Successfully unfollow to ${candidate.name}`,
      result: true,
      updatedCandidate: updatedCandidate,
    });
  } catch (err) {
    console.log("Error in Follow Route", err.message);
    return res.send({
      error: err.message,
      message: "Error in Follow Route",
      result: null,
    });
  }
};

const userPostsHandler = async (req, res) => {
  let userId = req.params.userId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any user with this id",
        result: false,
      });
    }

    return res.send({
      response: user.posts,
      message: `${user.name} This is your all Posts`,
      result: true,
    });
  } catch (err) {
    console.log("Error in fetch allPosts routes", err.message);
    return res.send({
      error: err.message,
      message: "Error in Follow Route",
      result: null,
    });
  }
};

const userFollowersHandler = async (req, res) => {
  let userId = req.params.userId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any user with this id",
        result: false,
      });
    }

    return res.send({
      response: user.followers,
      message: `${user.name} This is your followers list`,
      result: true,
    });
  } catch (err) {
    console.log("Error in fetch allFollowers routes", err.message);
    return res.send({
      error: err.message,
      message: "Error in Follow Route",
      result: null,
    });
  }
};

const userFollowingsHandler = async (req, res) => {
  let userId = req.params.userId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any user with this id",
        result: false,
      });
    }

    return res.send({
      response: user.following,
      message: `${user.name} This is Your Following List`,
      result: true,
    });
  } catch (err) {
    console.log("Error in fetch allFollowings routes", err.message);
    return res.send({
      error: err.message,
      message: "Error in Follow Route",
      result: null,
    });
  }
};

const userProfileHandler = async (req, res) => {
  let userId = req.params.userId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any user with this id",
        result: false,
      });
    }

    return res.send({
      response: user,
      message: `This is ${user.name} Profile`,
      result: true,
    });
  } catch (err) {
    console.log("Error in User Profile Route", err.message);
    return res.send({
      error: err.message,
      message: "Error in User Profile Route",
      result: null,
    });
  }
};

const userEditProfileHandler = async (req, res) => {
  // this router incomplete
  return res.send({
    message: "This route is Remain to Complete",
  });
};

router.post("/user/signUp", signUpHandler);
router.post("/user/login", loginHandler);
router.post("/user/logout", authentication, logOutHandler); // incomplete

router.post("/:userId/follow/:candidateId", authentication, followHandler);
router.post("/:userId/unFollow/:candidateId", authentication, unFollowHandler);

router.get("/user/posts/:userId", authentication, userPostsHandler);
router.get("/user/followers/:userId", authentication, userFollowersHandler);
router.get("/user/followings/:userId", authentication, userFollowingsHandler);
router.get("/user/profile/:userId", authentication, userProfileHandler);
router.put("/user/profile/:userId", authentication, userEditProfileHandler); // incomplete

module.exports = router;

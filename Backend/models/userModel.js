const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    unique: true,
    default: function () {
      return new mongoose.Types.ObjectId().toString();
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },
  bio: {
    type: String,
  },
  followers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  posts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.methods.comparePassword = async function (userPassword) {
  try {
    const isMatch = await bcrypt.compare(this.password, userPassword);
    return isMatch;
  } catch (err) {
    console.log("Error in comparing password", err);
    return err;
  }
};

userSchema.pre("save", async function (next) {
  const currUser = this;
  if (!currUser) next();
  if (!currUser.isModified("password")) next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
    next();
  } catch (err) {
    console.log("errorn in hashing password");
    next();
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;

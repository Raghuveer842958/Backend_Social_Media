const express = require("express");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const { authentication } = require("../middlewares/authtentication");
const router = express.Router();

const createPostHandler = async (req, res) => {
  const { title, content } = req.body;
  let userId = req.params.user;
  console.log("User id is :", userId);
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");
  console.log("Sanitized User id is:", userId);
  try {
    if (!title || !content) {
      return res.send({
        response: null,
        message: "Please complete the Post",
        result: false,
      });
    }
    const user = await User.findById(userId);
    console.log("User is :", user);
    if (!user) {
      return res.send({
        response: null,
        message: "Invalid User Id",
        result: false,
      });
    }
    const post = new Post({ title, content, user: userId });
    const createdPost = await post.save();

    user.posts.push(createdPost);
    await user.save();

    return res.send({
      response: createdPost,
      message: "Your Post Successfully Created",
      result: true,
      updatedUser: user,
    });
  } catch (err) {
    console.log("Error in /post/create route");
    return res.send({
      response: err.message,
      message: "Errorn occure is creating post",
      result: true,
    });
  }
};

const editPostHandler = async (req, res) => {
  const data = req.body;
  let userId = req.params.user;
  let postId = req.params.postId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");
  postId = postId.replace(/[^a-zA-Z0-9]/g, "");

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any user with this id",
        result: false,
      });
    }

    const userPosts = user.posts;
    const isMatch = userPosts.filter((data) => {
      if (data == postId) {
        return data.id;
      }
    });

    if (isMatch.length === 0) {
      return res.send({
        response: null,
        message: "There is no any post releted to this user",
        result: false,
      });
    }

    const findPost = await Post.findByIdAndUpdate(isMatch[0], data, {
      new: true,
    });

    if (!findPost) {
      return res.send({
        response: null,
        message: "You can not update This post b/c this is not Your post",
        result: false,
      });
    }

    return res.send({
      response: findPost,
      message: "Your Post updated successfully",
      result: true,
    });
  } catch (err) {
    console.log("Erron in modifing the post");
    return res.send({
      error: err.message,
      message: "error in modifing the post",
      result: false,
    });
  }
};

const deletePostHandler = async (req, res) => {
  let userId = req.params.user;
  let postId = req.params.postId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");
  postId = postId.replace(/[^a-zA-Z0-9]/g, "");
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any User with this id",
        result: false,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.send({
        response: null,
        message: "There is no any post with this id",
        result: false,
      });
    }

    const postUserId = post.user.toString();
    if (postUserId !== userId) {
      return res.send({
        response: null,
        message: "this is not your post you can not delete it",
        result: false,
      });
    }

    console.log("User Post before filtered:", user.posts.length);
    const filteredUserPost = user.posts.filter(
      (data) => data.toString() !== postId
    );
    console.log("User Post after filtered:", filteredUserPost.length);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { posts: filteredUserPost },
      {
        new: true,
      }
    );
    const deletedPost = await Post.findByIdAndDelete(postId);
    return res.send({
      response: updatedUser,
      message: "Your post is Deleted",
      result: true,
      deletedPost: deletedPost,
    });
  } catch (err) {
    console.log("Error in Deleting Post route", err.message);
    res.send({
      error: err.message,
      message: "Errorn in Deleting Post route",
      result: false,
    });
  }
};

const postLikeHandler = async (req, res) => {
  let userId = req.params.userId;
  let postId = req.params.postId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");
  postId = postId.replace(/[^a-zA-Z0-9]/g, "");
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any User with this id",
        result: false,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.send({
        response: null,
        message: "There is no any post with this id",
        result: false,
      });
    }

    if (post.likes.length !== 0) {
      const filter = post.likes.filter((data) => data.toString() === userId);

      if (filter.length !== 0) {
        console.log("Your have allready Like this post");
        return res.send({
          response: post,
          message: `${user.name} You Successfully Likes Post`,
          result: true,
        });
      }
    }

    post.likes.push(userId);
    const updatedCandidatePost = await post.save();

    return res.send({
      response: updatedCandidatePost,
      message: `${user.name} You Successfully Likes Post`,
      result: true,
    });
  } catch (err) {
    console.log("Error in Like Post route", err.message);
    res.send({
      error: err.message,
      message: "Errorn in Like Post route",
      result: false,
    });
  }
};

const postUnlikeHandler = async (req, res) => {
  let userId = req.params.userId;
  let postId = req.params.postId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");
  postId = postId.replace(/[^a-zA-Z0-9]/g, "");
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any User with this id",
        result: false,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.send({
        response: null,
        message: "There is no any post with this id",
        result: false,
      });
    }

    const filteredLikes = post.likes.filter(
      (data) => data.toString() !== userId
    );
    post.likes = filteredLikes;
    const updatedPostLikes = await post.save();

    return res.send({
      response: updatedPostLikes,
      message: `${user.name} You Successfully unLike Post`,
      result: true,
    });
  } catch (err) {
    console.log("Error in Like Post route", err.message);
    res.send({
      error: err.message,
      message: "Errorn in Like Post route",
      result: false,
    });
  }
};

const postCommentHandler = async (req, res) => {
  let userId = req.params.userId;
  let postId = req.params.postId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");
  postId = postId.replace(/[^a-zA-Z0-9]/g, "");
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any User with this id",
        result: false,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.send({
        response: null,
        message: "There is no any post with this id",
        result: false,
      });
    }

    // remaining login
    const { comment } = req.body;
    const newComment = await new Comment({ userId, postId, content: comment });
    const createdComment = await newComment.save();
    post.comments.push(createdComment);
    const updatedPost = await post.save();

    console.log("Every Things ok");

    return res.send({
      response: updatedPost,
      message: "You have Successfully Commented",
      result: true,
      comment: createdComment,
    });
  } catch (err) {
    console.log("Error in Comment Post route", err.message);
    res.send({
      error: err.message,
      message: "Error in Comment Post route",
      result: false,
    });
  }
};

const postEditCommentHandler = async (req, res) => {
  let userId = req.params.userId;
  let postId = req.params.postId;
  let commentId = req.params.commentId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");
  postId = postId.replace(/[^a-zA-Z0-9]/g, "");
  commentId = commentId.replace(/[^a-zA-Z0-9]/g, "");
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any User with this id",
        result: false,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.send({
        response: null,
        message: "There is no any post with this id",
        result: false,
      });
    }

    const checkComment = await Comment.findById(commentId);
    if (!checkComment) {
      return res.send({
        response: null,
        message: "There is no any Comment with this id",
        result: false,
      });
    }

    const { comment } = req.body;
    checkComment.content = comment;
    const updatedComment = await checkComment.save();

    return res.send({
      response: updatedComment,
      message: `${user.name} You have Successfully Update our Commented`,
      result: true,
    });
  } catch (err) {
    console.log("Error in Like Post route", err.message);
    res.send({
      error: err.message,
      message: "Errorn in Like Post route",
      result: false,
    });
  }
};

const postDeleteCommentHandler = async (req, res) => {
  let userId = req.params.userId;
  let postId = req.params.postId;
  let commentId = req.params.commentId;
  userId = userId.replace(/[^a-zA-Z0-9]/g, "");
  postId = postId.replace(/[^a-zA-Z0-9]/g, "");
  commentId = commentId.replace(/[^a-zA-Z0-9]/g, "");
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send({
        response: null,
        message: "There is no any User with this id",
        result: false,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.send({
        response: null,
        message: "There is no any post with this id",
        result: false,
      });
    }

    const checkComment = await Comment.findById(commentId);
    if (!checkComment) {
      return res.send({
        response: null,
        message: "There is no any Comment with this id",
        result: false,
      });
    }

    const filteredComments = post.comments.filter(
      (data) => data.toString() !== commentId
    );
    post.comments = filteredComments;
    const updatedComment = await post.save();
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    return res.send({
      response: updatedComment,
      message: `${user.name} You have Successfully Delete our Commented`,
      result: true,
    });
  } catch (err) {
    console.log("Error in Comment Delete Post route", err.message);
    res.send({
      error: err.message,
      message: "Errorn in Like Post route",
      result: false,
    });
  }
};

router.post("/post/:user/create", authentication, createPostHandler);
router.put("/post/:user/:postId", authentication, editPostHandler);
router.delete("/post/:user/:postId", authentication, deletePostHandler);

router.post("/post/like/:userId/:postId", authentication, postLikeHandler);
router.post("/post/unlike/:userId/:postId", authentication, postUnlikeHandler);

// router.post("/post/comment/:userId/:postId",authentication,postCommentHandler);
// router.put("/post/comment/:userId/:postId",authentication,postEditCommentHandler);
// router.delete("/post/comment/:userId/:postId",authentication,postDeleteCommentHandler);

router.post(
  "/post/comment/:userId/:postId",
  authentication,
  postCommentHandler
);

router.put(
  "/post/comment/:userId/:postId/:commentId",
  authentication,
  postEditCommentHandler
);

router.delete(
  "/post/comment/:userId/:postId/:commentId",
  authentication,
  postDeleteCommentHandler
);

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const Comment = require('../model/comment.model');
const Blog = require('../model/blog.model');
const router = express.Router();

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  const { postId } = req.body;
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid or missing postId' });
  }
  next();
};

// Create comment
router.post('/post-comment', validateObjectId, async (req, res) => {
  try {
    const { comment, postId, userId } = req.body;

    if (!comment?.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const newComment = new Comment({
      comment: comment.trim(),
      postId,
      user: userId || null, // optional if not logged in
    });

    await newComment.save();

    // Populate user info (optional but helpful)
    const populatedComment = await Comment.findById(newComment._id).populate(
      'user',
      'username'
    );

    // Increment commentCount in Blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      postId,
      { $inc: { commentCount: 1 } },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.status(201).json({
      message: 'Comment posted successfully',
      comment: populatedComment,
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ message: 'Server error while posting comment' });
  }
});

// Get total comments
router.get('/total-comments', async (req, res) => {
  try {
    const total = await Comment.countDocuments({});
    res.json({ totalComments: total });
  } catch (error) {
    console.error('Error fetching total comments:', error);
    res.status(500).json({ message: 'Failed to fetch total comments' });
  }
});

module.exports = router;
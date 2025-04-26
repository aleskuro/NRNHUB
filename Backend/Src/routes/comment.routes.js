const express = require('express');
const mongoose = require('mongoose');
const Comment = require('../model/comment.model');
const Blog = require('../model/blog.model');
const router = express.Router();

// Create comment
router.post('/post-comment', async (req, res) => {
  try {
    const newComment = new Comment(req.body);
    await newComment.save();

    // Increment commentCount in the Blog
    await Blog.findByIdAndUpdate(
      req.body.postId,
      { $inc: { commentCount: 1 } },
      { new: true }
    );

    res.status(200).send({
      message: 'Comment Created Successfully',
      Comment: newComment,
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    if (!mongoose.Types.ObjectId.isValid(req.body.postId)) {
      return res.status(400).send({ message: 'Invalid postId' });
    }
    res.status(500).send({ message: 'Failed to post comment' });
  }
});

// Get total comments
router.get('/total-comments', async (req, res) => {
  try {
    const totalComments = await Comment.countDocuments({});
    res.status(200).send({ message: 'Total Comments are:', totalComments });
  } catch (error) {
    console.error('Error fetching total comments:', error);
    res.status(500).send({ message: 'Failed to fetch total comments' });
  }
});

module.exports = router;
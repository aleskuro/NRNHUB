const express = require('express');
const router = express.Router();
const Blog = require('../model/blog.model');
const Comment = require('../model/comment.model');
const verifyToken = require('../middleware/verifyToken');

// Create a blog post
router.post('/create-post', verifyToken, async (req, res) => {
  try {
    const newPost = new Blog({ ...req.body, author: req.userId });
    await newPost.save();
    res.status(201).json({
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (error) {
    console.error('Error Creating Post:', error);
    res.status(500).json({ message: 'Error Creating Post' });
  }
});

router.get('/', async (req, res) => {
    try {
      const query = {};
      if (req.query.search) {
        query.title = { $regex: req.query.search, $options: 'i' };
      }
      if (req.query.category) {
        query.category = req.query.category;
      }
  
      const posts = await Blog.find(query)
        .populate('author', 'email name')
        .sort({ createdAt: -1 });
  
      // Sanitize content.blocks
      const sanitizedPosts = posts.map(post => ({
        ...post.toObject(),
        content: {
          blocks: Array.isArray(post.content?.blocks)
            ? post.content.blocks.filter(block => block && typeof block === 'object' && block.type && block.data)
            : []
        }
      }));
  
      res.status(200).send(sanitizedPosts);
    } catch (error) {
      console.error('Error Fetching Posts:', error);
      res.status(500).json({ message: 'Error Fetching Posts' });
    }
  });
  

// Get blogs by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const blogs = await Blog.find({
      category: { $regex: `^${category}$`, $options: 'i' },
    }).sort({ createdAt: -1 });

    if (blogs.length === 0) {
      return res.status(404).json({ message: `No blogs found for category: ${category}` });
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error(`Error fetching blogs for category ${req.params.category}:`, error);
    res.status(500).json({ message: 'Server error while fetching category blogs' });
  }
});

// Get single blog by ID and increment views
router.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    // Increment views
    const post = await Blog.findByIdAndUpdate(
      postId,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'email');

    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }

    const comments = await Comment.find({ postId }).populate('user', 'username email');

    res.status(200).send({
      post,
      comments,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send({ message: 'Failed to fetch post' });
  }
});

// Update read time for a blog
router.post('/:id/read-time', async (req, res) => {
  try {
    const postId = req.params.id;
    const { readTime } = req.body; // readTime in seconds

    if (!readTime || typeof readTime !== 'number' || readTime < 0) {
      return res.status(400).json({ message: 'Invalid read time' });
    }

    const post = await Blog.findByIdAndUpdate(
      postId,
      {
        $inc: { readTime: readTime, readCount: 1 },
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Read time updated', post });
  } catch (error) {
    console.error('Error updating read time:', error);
    res.status(500).json({ message: 'Failed to update read time' });
  }
});

// Like a blog
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Blog.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post liked', post });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
});

// Share a blog
router.post('/:id/share', async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Blog.findByIdAndUpdate(
      postId,
      { $inc: { shares: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post shared', post });
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ message: 'Failed to share post' });
  }
});

// Update a post
router.patch('/update-post/:id', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const updatedPost = await Blog.findByIdAndUpdate(postId, { ...req.body }, { new: true });

    if (!updatedPost) {
      return res.status(404).send({ message: 'Post not found' });
    }

    res.status(200).send({ message: 'Post updated successfully', post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).send({ message: 'Failed to update post' });
  }
});

// Delete a post
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Blog.findByIdAndDelete(postId);

    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }

    await Comment.deleteMany({ postId });

    res.status(200).send({
      message: 'Post and associated comments deleted successfully',
      deletedPostId: postId,
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).send({ message: 'Failed to delete post' });
  }
});

// Get related blogs
router.get('/related/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: 'Blog ID is required' });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).send({ message: 'Blog post not found' });
    }

    const titleRegex = new RegExp(blog.title.split(' ').join('|'), 'i');

    const relatedQuery = {
      _id: { $ne: id },
      category: blog.category,
      title: { $regex: titleRegex },
    };

    const relatedPosts = await Blog.find(relatedQuery)
      .limit(10)
      .sort({ createdAt: -1 });

    res.status(200).send(relatedPosts);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    res.status(500).send({ message: 'Failed to fetch related posts' });
  }
});

module.exports = router;
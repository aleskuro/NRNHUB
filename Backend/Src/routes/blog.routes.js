// routes/blog.routes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Blog = require('../model/blog.model');
const Comment = require('../model/comment.model');
const verifyToken = require('../middleware/verifyToken');

// ======================
// CREATE POST
// ======================
router.post('/create-post', verifyToken, async (req, res) => {
  try {
    const post = new Blog({
      ...req.body,
      author: req.userId,
    });
    await post.save();
    res.status(201).json({ message: 'Post created', post });
  } catch (err) {
    console.error('Create Post Error:', err);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// ======================
// GET ALL BLOGS (search + category)
// ======================
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    const blogs = await Blog.find(query)
      .populate('author', 'email name username')
      .select('title description coverImg category createdAt views likes shares author')
      .sort({ createdAt: -1 })
      .lean();

    res.json(blogs);
  } catch (err) {
    console.error('Fetch All Blogs Error:', err);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
});

// ======================
// GET BY CATEGORY
// ======================
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const normalized = category.trim();

    const blogs = await Blog.find({
      category: { $regex: `^${normalized}$`, $options: 'i' },
    })
      .populate('author', 'email name')
      .select('title description coverImg category createdAt views likes shares author')
      .sort({ createdAt: -1 })
      .lean();

    if (!blogs.length) {
      return res.status(404).json({ message: `No blogs in "${normalized}"` });
    }

    res.json(blogs);
  } catch (err) {
    console.error('Category Fetch Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ======================
// GET SINGLE BLOG + INC VIEWS
// ======================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    const post = await Blog.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'email name username')
      .lean();

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ postId: id })
      .populate('user', 'username email')
      .lean();

    res.json({ post, comments });
  } catch (err) {
    console.error('Fetch Post Error:', err);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
});

// ======================
// UPDATE READ TIME
// ======================
router.post('/:id/read-time', async (req, res) => {
  try {
    const { id } = req.params;
    const { readTime } = req.body;

    if (!readTime || typeof readTime !== 'number' || readTime < 0 || readTime > 3600) {
      return res.status(400).json({ message: 'readTime must be 0–3600 seconds' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    const post = await Blog.findByIdAndUpdate(
      id,
      { $inc: { readTime, readCount: 1 } },
      { new: true }
    ).lean();

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json({ message: 'Read time updated', post });
  } catch (err) {
    console.error('Read Time Error:', err);
    res.status(500).json({ message: 'Failed to update read time' });
  }
});

// ======================
// LIKE / SHARE
// ======================
const incrementField = (field) => async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    const post = await Blog.findByIdAndUpdate(
      id,
      { $inc: { [field]: 1 } },
      { new: true }
    ).lean();

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json({ message: `Post ${field}d`, post });
  } catch (err) {
    console.error(`Error ${field}ing post:`, err);
    res.status(500).json({ message: `Failed to ${field} post` });
  }
};

router.post('/:id/like', verifyToken, incrementField('likes'));
router.post('/:id/share', incrementField('shares'));

// ======================
// UPDATE POST
// ======================
router.patch('/update-post/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    const post = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json({ message: 'Post updated', post });
  } catch (err) {
    console.error('Update Post Error:', err);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// ======================
// DELETE POST + COMMENTS
// ======================
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    const post = await Blog.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await Comment.deleteMany({ postId: id });

    res.json({ message: 'Post and comments deleted', deletedPostId: id });
  } catch (err) {
    console.error('Delete Post Error:', err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// ======================
// RELATED BLOGS (SMART)
// ======================
router.get('/related/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    const blog = await Blog.findById(id).lean();
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const keywords = blog.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);

    const query = {
      _id: { $ne: id },
      category: blog.category,
      ...(keywords.length > 0 && {
        $or: keywords.map(kw => ({ title: { $regex: kw, $options: 'i' } }))
      }),
    };

    const related = await Blog.find(query)
      .select('title description coverImg category createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json(related);
  } catch (err) {
    console.error('Related Blogs Error:', err);
    res.status(500).json({ message: 'Failed to fetch related blogs' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Blog = require('../model/blog.model');
const Comment = require('../model/comment.model');
const verifyToken = require('../middleware/verifyToken');

// const isAdmin = require('../middleware/isAdmin'); // Expects default export



// Log to verify (remove after testing)
// console.log('verifyToken:', verifyToken);
// console.log('isAdmin:', isAdmin);

// Create a blog post
router.post('/create-post', verifyToken, async (req, res) => {
    try {
        const newPost = new Blog({ ...req.body, author: req.userId });
        await newPost.save();
        res.status(201).json({
            message: 'Post created successfully',
            post: newPost
        });
    } catch (error) {
        console.error('Error Creating Post:', error);
        res.status(500).json({ message: 'Error Creating Post' });
    }
})

//get all blogs
router.get('/',async (req, res) => {
    try {
        const {search, category, location} = req.query;
        console.log(search);
        let query = {}

        if (search) {
            query = {
                ...query,
                $or: [
                    {title: {$regex: search,$options: "i"}},
                    {content: {$regex: search,$options: "i"},
                
                }
                ]
            }
        }

        if (category) {
            query = { ...query, category };
        }
        if (location) {
            query = { ...query, location };
        }
        

        const posts = await Blog.find(query).populate('author','email').sort({createdAt: -1});
        res.status(200).send(posts)



    } catch (error) {
        console.error('Error Creating Post:', error);
        res.status(500).json({ message: 'Error Creating POST' });

    }
} )

//get single blogs by id
router.get("/:id",   async(req, res) => {
    try {
        const postId = req.params.id;
        // console.log(postId)
        
        const post = await Blog.findById(postId);

        if (!post) {
            return res.status(404).send({ message: 'Post not found' });
        }

        
        const comments = await Comment.find({postId: postId}).populate('user', "username email")

        res.status(200).send({ 
            post, comments
        });
    }catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send({ message: 'Failed to fetch post' });
    } 
})

// Get blogs by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        const posts = await Blog.find({ category: { $regex: category, $options: 'i' } })
            .populate('author', 'email')
            .sort({ createdAt: -1 });

        if (posts.length === 0) {
            return res.status(404).json({ message: `No blogs found for category: ${category}` });
        }

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error Fetching Blogs by Category:', error);
        res.status(500).json({ message: 'Error Fetching Blogs by Category' });
    }
});

// update a post (protected route)
router.patch('/update-post/:id', verifyToken,async (req, res) => {
    try {
        const postId = req.params.id;
        // const { title, content, category } = req.body;
        const updatedPost = await Blog.findByIdAndUpdate(postId, { ...req.body }, { new: true });
        
        if (!updatedPost) {
            return res.status(404).send({ message: 'Post not found' });
        }
        
        res.status(200).send({ message: 'Post updated successfully', post: updatedPost });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send({ message: 'Failed to fetch post' });
    }
})


//delete a post
router.delete('/:id', verifyToken,  async (req, res) => {
    try {
        const postId = req.params.id;

        // Find and delete the blog post
        const post = await Blog.findByIdAndDelete(postId);

        if (!post) {
            return res.status(404).send({ message: 'Post not found' });
        }

        await Comment.deleteMany({ postId: postId });

        // Send success response
        res.status(200).send({ 
            message: 'Post and associated comments deleted successfully',
            deletedPostId: postId 
        });

    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send({ message: 'Failed to delete post' });
    }
});


//related blog
router.get('/related/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ message: 'Blog ID is required' });
        }

        // Find the blog by ID
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).send({ message: 'Blog post not found' });
        }

        // Create a regex to match similar terms in the title
        const titleRegex = new RegExp(blog.title.split(' ').join('|'), 'i');

        // Build the query to match by category and similar title
        const relatedQuery = {
            _id: { $ne: id }, // Exclude the current blog post
            category: blog.category, // Match the same category
            title: { $regex: titleRegex } // Match similar titles
        };

        // Find related posts and limit the results
        const relatedPosts = await Blog.find(relatedQuery)
            .limit(10) // Limit to 5 results
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).send(relatedPosts)
    } catch (error) {
        console.error('Error fetching related posts:', error);
        res.status(500).send({ message: 'Failed to fetch related posts' });
    }
});




// Export the router once
module.exports = router;
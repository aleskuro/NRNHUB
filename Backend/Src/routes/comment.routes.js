const express = require('express');
const app = express();
const mongoose = require('mongoose'); // Add this import
const Comment = require('../model/comment.model');
const router = express.Router();



// app.use(express.json());


//create comment
router.post('/post-comment', async (req, res) => {
    console.log(req.body)
    try {
        const newComment = new Comment(req.body);
        await newComment.save()        
    res.status(200).send({message: "Comment Created Successfully", Comment: newComment})
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).send({ message: 'Failed to post comment' });

        if (!mongoose.Types.ObjectId.isValid(req.body.postId)) {
            return res.status(400).send({ message: "Invalid postId" });
          }
    }

});


//get all the comment
router.get('/total-comments', async (req, res) => {
    try {
        const totalComments = await Comment.countDocuments({});
        res.status(200).send({message: "Total Comments are:- ", totalComments });
    } catch (error) {
        console.error('Error fetching total comments:', error);
        res.status(500).send({ message: 'Failed to fetch total comments' });
    }
});


module.exports = router;
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//  


const commentSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user: String,
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    createdAt: { type: Date, default: Date.now },
});





const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;







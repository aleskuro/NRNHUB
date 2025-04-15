import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { usePostCommentMutation } from '../../../Redux/features/comments/CommentAPI';
import { useParams, useNavigate } from 'react-router-dom';

const PostAComment = () => {
  const [comment, setComment] = useState('');
  const { user } = useSelector((state) => state.auth);
  const [postComment] = usePostCommentMutation(); // Renamed to camelCase
  const { id: postId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to comment on this post.");
      navigate("/login");
      return;
    }

    const newComment = {
      comment,
      user: user._id,
      postId,
    };

    try {
      const response = await postComment(newComment).unwrap();
      console.log("Comment posted:", response);
      setComment('');
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("An error occurred while posting your comment.");
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">Leave a Comment</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          name="text"
          id="text"
          rows="6"
          className="w-full p-4 bg-gray-100 rounded-md focus:ring focus:ring-indigo-200 focus:outline-none border border-gray-300"
          placeholder="Share your opinion about this post..."
        />
        <button
          type="submit"
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md shadow-md transition-colors duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default PostAComment;

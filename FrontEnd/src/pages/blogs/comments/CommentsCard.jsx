import React from 'react';
import commentorIcon from "../../../assets/commentor.png";
import PostAComment from './PostAComment';
import { formatDate } from '../../../../utilis/dateFormater';
import { useSelector } from 'react-redux';


const CommentsCard = ({ comments = [] }) => {
  const user = useSelector((state) => state.auth.user)
  return (
    <div className='my-6 bg-white p-8 rounded-md shadow-md'>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Comments</h2>

      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment, index) => (
            <div key={index} className="border-b pb-4 mb-4">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <img src={commentorIcon} alt="User Icon" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-lg font-medium capitalize text-blue-500 hover:underline hover:underline-offset-2 cursor-pointer">
                    {comment?.user?.username || "Anonymous"}
                  </p>
                  <p className="text-sm italic text-gray-600">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>

              {/* Comment Text */}
              <div className="text-gray-800 mt-3 border p-4 rounded-md bg-gray-100">
                <p>{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-lg font-medium text-center text-gray-700">Be the First to Comment!!!</div>
      )}

      {/* Post a Comment Form (Only One Instance) */}
      <div className="mt-6">
        <PostAComment />
      </div>
    </div>
  );
};

export default CommentsCard;
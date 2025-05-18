// commentApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL;

export const commentApi = createApi({
  reducerPath: 'commentApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${API_URL}/api/comments`, // Use template literal to append /api/comments
    credentials: 'include',
  }),
  tagTypes: ['Comments'], // Define the tag types   
  endpoints: (builder) => ({
    postComment: builder.mutation({
      query: (commentData) => ({
        url: '/post-comment',
        method: 'POST',
        body: commentData,
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Comments', id: postId }],
    }),
    getComments: builder.query({
      query: () => ({
        url: '/total-comments',
        method: "GET",
      })
    })
  }),
});

export const { usePostCommentMutation, useGetCommentsQuery } = commentApi;

export default commentApi;
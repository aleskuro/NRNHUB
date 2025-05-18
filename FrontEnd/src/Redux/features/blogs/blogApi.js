import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL;  // Using environment variable as in authApi.js

export const blogsApi = createApi({
  reducerPath: 'blogsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/`,  // Dynamically append to the base API URL
    credentials: 'include',  // Added for consistency with authApi.js to include cookies
    prepareHeaders: (headers, { getState, endpoint }) => {
      const token = getState().auth.token;
      if (token && ['postBlog', 'updateBlog', 'deleteBlog'].includes(endpoint)) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Blogs'],  // Retained and consistent with authApi.js structure
  endpoints: (builder) => ({
    fetchBlogs: builder.query({
      query: ({ search = '', category = '', location = '' }) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (location) params.append('location', location);
        console.log('Fetching blogs with params:', params.toString());
        return `blogs?${params.toString()}`;
      },
      providesTags: ['Blogs'],
    }),
    fetchBlogById: builder.query({
      query: (id) => `blogs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Blogs', id }],
    }),
    fetchRelatedBlogs: builder.query({
      query: (id) => `blogs/related/${id}`,
      providesTags: ['Blogs'],
    }),
    postBlog: builder.mutation({
      query: (newBlog) => ({
        url: '/blogs/create-post',
        method: 'POST',
        body: newBlog,
      }),
      invalidatesTags: ['Blogs'],
    }),
    updateBlog: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `blogs/update-post/${id}`,
        method: 'PATCH',
        body: rest,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blogs', id }],
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Blogs', id }],
    }),
    fetchBlogsByCategory: builder.query({
      query: (category) => {
        const url = `blogs/category/${encodeURIComponent(category)}`;
        console.log('Fetching blogs by category:', url);
        return url;
      },
      providesTags: ['Blogs'],
    }),
  }),
});

export const {
  useFetchBlogsQuery,
  useFetchBlogsByCategoryQuery,
  useFetchBlogByIdQuery,
  useFetchRelatedBlogsQuery,
  usePostBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogsApi;
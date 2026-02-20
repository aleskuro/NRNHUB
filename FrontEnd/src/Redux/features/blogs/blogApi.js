import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const blogsApi = createApi({
  reducerPath: 'blogsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    credentials: 'include',
    prepareHeaders: (headers, { getState, endpoint }) => {
      const token = getState().auth.token;
      if (token && ['postBlog', 'updateBlog', 'deleteBlog'].includes(endpoint)) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Blogs'],
  endpoints: (builder) => ({
    fetchBlogs: builder.query({
      query: ({ search = '', category = '', location = '' }) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (location) params.append('location', location);
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
        url: 'blogs/create-post',
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
      query: (category) => `blogs/category/${encodeURIComponent(category)}`,
      providesTags: (result, error, category) => [
        { type: 'Blogs', id: category },
        'Blogs',
      ],
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
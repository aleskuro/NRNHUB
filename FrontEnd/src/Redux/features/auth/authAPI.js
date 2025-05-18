import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL; // Using environment variable as in commentApi.js

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${API_URL}/api/auth`, // Dynamically append to the base API URL
    credentials: 'include', // Retains cookie inclusion for authentication
  }),
  tagTypes: ['Auth', 'User'], // Added tagTypes for caching and invalidation, similar to ['Comments'] in commentApi.js
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (newUser) => ({
        url: '/register',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['Auth'], // Invalidates 'Auth' tag upon successful registration, as it might affect auth state
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'User'], // Invalidates both tags, assuming login could refresh user data or auth tokens
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'], // Invalidates 'Auth' tag, as logout affects authentication state
    }),
    getUser: builder.query({
      query: () => ({
        url: '/users',
        method: 'GET',
      }),
      providesTags: ['User'], // Added providesTags for caching; this marks the query as providing 'User' data
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [{ type: 'User', id: userId }], // Made dynamic, similar to how postComment invalidates based on postId
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: (result, error, userId) => [{ type: 'User', id: userId }], // Dynamic invalidation based on userId
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetUserQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
} = authApi;

export default authApi;
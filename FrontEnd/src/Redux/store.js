import { configureStore } from '@reduxjs/toolkit';
import authApi from './features/auth/authAPI';
import authSlice from './features/auth/authSlice';
import adReducer from './features/ads/adSlice';
import { blogsApi } from './features/blogs/blogApi';
import commentApi from './features/comments/CommentAPI';

export const store = configureStore({
  reducer: {
    ads: adReducer,
    [blogsApi.reducerPath]: blogsApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      blogsApi.middleware,
      authApi.middleware,
      commentApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});
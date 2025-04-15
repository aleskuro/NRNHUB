import { createSlice } from '@reduxjs/toolkit';

const userData = localStorage.getItem('user');
const parsed = userData ? JSON.parse(userData) : { user: null, token: null };

const initialState = {
  user: parsed.user || null,
  token: parsed.token || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;

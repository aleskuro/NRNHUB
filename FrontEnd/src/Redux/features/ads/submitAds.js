import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../path/to/your/env/config';  // Adjust the import path as needed

export const submitAds = createAsyncThunk(
  'ads/submitAds',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().ads;
      
      // Extract visibility settings from individual boolean flags
      const visibility = {};
      const adTypes = [
        'mobile', 'right1', 'right2', 'right3', 'right4', 'right5',
        'left1', 'left2', 'left3', 'left4', 'left5',
        'bottom', 'navbar', 'hero', 'blogsFirst', 'blogsSecond', 'blogsThird'
      ];
      
      adTypes.forEach(adType => {
        visibility[adType] = state[`${adType}AdVisible`];
      });
      
      // Create the payload to send to server
      const payload = {
        adImages: state.adImages,
        adLinks: state.adLinks,
        visibility
      };
      
      const response = await fetch(`${API_URL}/api/ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // Added for consistency with authApi.js to include cookies if authentication is required
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to submit ads');
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred while submitting ads');
    }
  }
);
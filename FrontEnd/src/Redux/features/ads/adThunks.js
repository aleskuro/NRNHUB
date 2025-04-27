import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper to get API URL
const getApiUrl = () => {
  return window.location.origin;
};

// Configure axios with base URL
const api = axios.create({
  baseURL: getApiUrl(),
});

export const fetchAdsFromServer = createAsyncThunk(
  'ads/fetchAds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/ads');
      console.log('Server response data:', JSON.stringify(response.data, null, 2));
      
      const visibility = response.data.visibility || {};
      const validAdTypes = [
        'mobile', 'right1', 'right2', 'right3', 'right4', 'right5',
        'left1', 'left2', 'left3', 'left4', 'left5', 'bottom',
        'navbar', 'hero', 'blogsFirst', 'blogsSecond', 'blogsThird',
        'blogsFourth', 'blogsFifth', 'blogsHome1', 'blogsHome2', 'blogsHome3'
      ];

      // Sanitize visibility
      Object.keys(visibility).forEach(key => {
        if (!validAdTypes.includes(key)) {
          delete visibility[key];
        }
      });

      Object.keys(response.data).forEach(key => {
        if (key.endsWith('AdVisible')) {
          const adType = key.replace('AdVisible', '');
          if (validAdTypes.includes(adType)) {
            visibility[adType] = response.data[key];
          }
        }
      });

      // Sanitize adImages and adLinks
      const adImages = response.data.adImages || {};
      const adLinks = response.data.adLinks || {};
      Object.keys(adImages).forEach(key => {
        if (!validAdTypes.includes(key)) {
          delete adImages[key];
        }
      });
      Object.keys(adLinks).forEach(key => {
        if (!validAdTypes.includes(key)) {
          delete adLinks[key];
        }
      });

      return {
        adImages,
        adLinks,
        visibility,
      };
    } catch (error) {
      console.error('Error fetching ads:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ads');
    }
  }
);

export const submitAds = createAsyncThunk(
  'ads/submitAds',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState();
      const { adImages, adLinks, loading, submitting, error, submitSuccess, ...visibilityFlags } = state.ads;

      const validAdTypes = [
        'mobile', 'right1', 'right2', 'right3', 'right4', 'right5',
        'left1', 'left2', 'left3', 'left4', 'left5', 'bottom',
        'navbar', 'hero', 'blogsFirst', 'blogsSecond', 'blogsThird',
        'blogsFourth', 'blogsFifth', 'blogsHome1', 'blogsHome2', 'blogsHome3'
      ];

      const visibility = {};
      Object.keys(visibilityFlags).forEach((key) => {
        if (key.endsWith('AdVisible')) {
          const adType = key.replace('AdVisible', '');
          if (validAdTypes.includes(adType)) {
            visibility[adType] = visibilityFlags[key];
          }
        }
      });
      validAdTypes.forEach(adType => {
        if (!(adType in visibility)) {
          visibility[adType] = visibilityFlags[`${adType}AdVisible`] ?? false;
        }
      });

      // Sanitize adImages and adLinks
      const cleanedAdImages = {};
      const cleanedAdLinks = {};
      validAdTypes.forEach(adType => {
        if (adImages[adType]?.trim()) cleanedAdImages[adType] = adImages[adType];
        if (adLinks[adType]?.trim()) cleanedAdLinks[adType] = adImages[adType];
      });

      const adData = {
        adImages: cleanedAdImages,
        adLinks: cleanedAdLinks,
        visibility,
      };

      console.log('Submitting ad data:', JSON.stringify(adData, null, 2));
      if (Object.keys(adImages).length > validAdTypes.length) {
        console.warn('Too many ad images:', Object.keys(adImages));
      }
      if (Object.keys(adLinks).length > validAdTypes.length) {
        console.warn('Too many ad links:', Object.keys(adLinks));
      }

      const response = await api.post('/api/ads', adData);
      console.log('Submit response:', JSON.stringify(response.data, null, 2));

      await new Promise(resolve => setTimeout(resolve, 1000));
      await dispatch(fetchAdsFromServer());

      const responseData = response.data.ad || response.data;
      const responseVisibility = responseData.visibility || {};
      Object.keys(responseData).forEach(key => {
        if (key.endsWith('AdVisible')) {
          const adType = key.replace('AdVisible', '');
          if (validAdTypes.includes(adType)) {
            responseVisibility[adType] = response.data[key];
          }
        }
      });

      // Sanitize response data
      const responseAdImages = responseData.adImages || {};
      const responseAdLinks = responseData.adLinks || {};
      Object.keys(responseAdImages).forEach(key => {
        if (!validAdTypes.includes(key)) {
          delete responseAdImages[key];
        }
      });
      Object.keys(responseAdLinks).forEach(key => {
        if (!validAdTypes.includes(key)) {
          delete responseAdLinks[key];
        }
      });

      return {
        adImages: responseAdImages,
        adLinks: responseAdLinks,
        visibility: responseVisibility,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit ads';
      console.error('Error submitting ads:', {
        message: errorMessage,
        response: error.response?.data,
        status: error.response?.status,
      });
      return rejectWithValue(errorMessage);
    }
  }
);
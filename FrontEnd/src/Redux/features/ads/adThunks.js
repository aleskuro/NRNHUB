import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '';

const validAdTypes = [
  'mobile', 'right1', 'right2', 'right3', 'right4', 'right5',
  'left1', 'left2', 'left3', 'left4', 'left5', 'bottom',
  'navbar', 'hero', 'blogsFirst', 'blogsSecond', 'blogsThird',
  'blogsFourth', 'blogsFifth', 'blogsHome1', 'blogsHome2', 'blogsHome3',
  'economyAds1', 'economyAds2', 'lifestyle1', 'lifestyle2'
];

export const fetchAdsFromServer = createAsyncThunk(
  'ads/fetchAdsFromServer',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching ads from server...');
      const response = await axios.get(`/api/ads`, { withCredentials: true });
      console.log('Fetch ads response:', response.data);

      const adImages = {};
      const adLinks = {};
      const visibility = {};

      validAdTypes.forEach((adType) => {
        if (response.data.adImages?.[adType]) {
          let imageUrl = response.data.adImages[adType];
          // Normalize to always be a clean relative or absolute URL
          if (!imageUrl.startsWith('http')) {
            imageUrl = imageUrl.replace(/^\/+/, '');
            imageUrl = `/${imageUrl}`;
          }
          imageUrl = imageUrl.replace(/(\/Uploads\/)+/g, '/Uploads/');
          imageUrl = imageUrl.replace(/(\/ads\/)+/g, '/ads/');
          imageUrl = imageUrl.replace(/\/undefined\//g, '/');
          adImages[adType] = imageUrl;
        }
        if (response.data.adLinks?.[adType]) {
          adLinks[adType] = response.data.adLinks[adType];
        }
        if (response.data.visibility?.[adType] !== undefined) {
          visibility[adType] = response.data.visibility[adType];
        }
      });

      return { adImages, adLinks, visibility };
    } catch (err) {
      console.error('Fetch ads error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch ads');
    }
  }
);

export const submitAds = createAsyncThunk(
  'ads/submitAds',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { ads } = getState();
      const { adImages, adLinks, visibility } = ads;

      const cleanedAdImages = {};
      const cleanedAdLinks = {};
      const cleanedVisibility = {};

      validAdTypes.forEach((adType) => {
        if (adImages?.[adType]?.trim()) {
          cleanedAdImages[adType] = adImages[adType];
        }
        if (adLinks?.[adType]?.trim()) {
          cleanedAdLinks[adType] = adLinks[adType];
        }
        if (visibility?.[adType] !== undefined) {
          cleanedVisibility[adType] = visibility[adType];
        }
      });

      const payload = {
        adImages: cleanedAdImages,
        adLinks: cleanedAdLinks,
        visibility: cleanedVisibility,
      };

      console.log('Submitting ads payload:', payload);
      const response = await axios.post(`/api/ads`, payload, { withCredentials: true });
      console.log('Submit ads response:', response.data);

      return response.data;
    } catch (err) {
      console.error('Submit ads error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to submit ads');
    }
  }
);
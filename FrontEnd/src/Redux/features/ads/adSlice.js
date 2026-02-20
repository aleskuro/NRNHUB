// src/features/ads/adSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchAdsFromServer, submitAds } from './adThunks';

const validAdTypes = [
  'mobile','right1','right2','right3','right4','right5',
  'left1','left2','left3','left4','left5','bottom','navbar','hero',
  'blogsFirst','blogsSecond','blogsThird','blogsFourth','blogsFifth',
  'blogsHome1','blogsHome2','blogsHome3','economyAds1','economyAds2',
  'lifestyle1','lifestyle2'
];

const initialState = {
  adImages: {},
  adLinks: {},
  visibility: {},
  visibilityLoaded: false,
  loading: true,
  submitting: false,
  error: null,
  submitSuccess: false,
};

const adSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    setAdImage: (state, action) => {
      const { ad, imagePath } = action.payload;
      state.adImages[ad] = imagePath;
    },
    setAdLink: (state, action) => {
      const { ad, link } = action.payload;
      state.adLinks[ad] = link;
    },
    toggleAd: (state, action) => {
      const { ad } = action.payload;
      state.visibility[ad] = !(state.visibility[ad] ?? false);
    },
    toggleEconomyAds: (state, action) => {
      const enable = action.payload;
      ['economyAds1', 'economyAds2'].forEach(ad => {
        state.visibility[ad] = enable;
      });
    },
    toggleLifestyleAds: (state, action) => {
      const enable = action.payload;
      ['lifestyle1', 'lifestyle2'].forEach(ad => {
        state.visibility[ad] = enable;
      });
    },
    clearAd: (state, action) => {
      const { ad } = action.payload;
      delete state.adImages[ad];
      delete state.adLinks[ad];
      delete state.visibility[ad];
    },
    resetSubmitStatus: (state) => {
      state.submitSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdsFromServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdsFromServer.fulfilled, (state, action) => {
        const { adImages, adLinks, visibility } = action.payload;
        state.adImages = adImages;
        state.adLinks = adLinks;
        state.visibility = visibility;
        state.visibilityLoaded = true;
        state.loading = false;
      })
      .addCase(fetchAdsFromServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitAds.pending, (state) => {
        state.submitting = true;
        state.submitSuccess = false;
        state.error = null;
      })
      .addCase(submitAds.fulfilled, (state, action) => {
        const { adImages, adLinks, visibility } = action.payload;
        state.adImages = adImages;
        state.adLinks = adLinks;
        state.visibility = visibility;
        state.submitting = false;
        state.submitSuccess = true;
      })
      .addCase(submitAds.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const {
  setAdImage,
  setAdLink,
  toggleAd,
  toggleEconomyAds,
  toggleLifestyleAds,
  clearAd,
  resetSubmitStatus,
} = adSlice.actions;

export default adSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';
import { fetchAdsFromServer, submitAds } from './adThunks';

const validAdTypes = [
  'mobile', 'right1', 'right2', 'right3', 'right4', 'right5',
  'left1', 'left2', 'left3', 'left4', 'left5', 'bottom',
  'navbar', 'hero', 'blogsFirst', 'blogsSecond', 'blogsThird',
  'blogsFourth', 'blogsFifth', 'blogsHome1', 'blogsHome2', 'blogsHome3',
  'economyAds1', 'economyAds2', 'lifestyle1', 'lifestyle2'
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
    toggleAd: (state, action) => {
      const { ad } = action.payload;
      const newVisibility = !state.visibility[ad] ?? true;
      state.visibility = {
        ...state.visibility,
        [ad]: newVisibility,
      };
      state[`${ad}AdVisible`] = newVisibility;
    },
    toggleEconomyAds: (state, action) => {
      const enable = action.payload;
      state.visibility = {
        ...state.visibility,
        economyAds1: enable,
        economyAds2: enable,
      };
      state.economyAds1AdVisible = enable;
      state.economyAds2AdVisible = enable;
    },
    toggleLifestyleAds: (state, action) => {
      const enable = action.payload;
      state.visibility = {
        ...state.visibility,
        lifestyle1: enable,
        lifestyle2: enable,
      };
      state.lifestyle1AdVisible = enable;
      state.lifestyle2AdVisible = enable;
    },
    setAdImage: (state, action) => {
      const { ad, imagePath } = action.payload;
      console.log(`Setting image for ${ad}: ${imagePath}`);
      state.adImages[ad] = imagePath;
    },
    setAdLink: (state, action) => {
      const { ad, link } = action.payload;
      console.log(`Set ad link for ${ad}: ${link}`);
      state.adLinks = state.adLinks || {};
      state.adLinks[ad] = link;
    },
    clearAd: (state, action) => {
      const { ad } = action.payload;
      console.log(`Clearing ad ${ad}`);
      delete state.adImages[ad];
      delete state.adLinks[ad];
      delete state.visibility[ad];
      delete state[`${ad}AdVisible`];
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
        const payload = action.payload || {};
        const adImages = {};
        const adLinks = {};
        const visibility = {};

        Object.keys(payload.adImages || {}).forEach(key => {
          if (validAdTypes.includes(key)) {
            adImages[key] = payload.adImages[key];
          }
        });
        Object.keys(payload.adLinks || {}).forEach(key => {
          if (validAdTypes.includes(key)) {
            adLinks[key] = payload.adLinks[key];
          }
        });
        Object.keys(payload.visibility || {}).forEach(key => {
          if (validAdTypes.includes(key)) {
            visibility[key] = payload.visibility[key];
          }
        });

        state.adImages = adImages;
        state.adLinks = adLinks;
        state.visibility = visibility;
        
        Object.keys(state.visibility).forEach(adType => {
          state[`${adType}AdVisible`] = state.visibility[adType];
        });
        
        state.visibilityLoaded = true;
        state.loading = false;
      })
      .addCase(fetchAdsFromServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while fetching ads';
        state.visibilityLoaded = false;
      })
      .addCase(submitAds.pending, (state) => {
        state.submitting = true;
        state.submitSuccess = false;
        state.error = null;
      })
      .addCase(submitAds.fulfilled, (state, action) => {
        const payload = action.payload || {};
        const adImages = {};
        const adLinks = {};
        const visibility = {};

        Object.keys(payload.adImages || {}).forEach(key => {
          if (validAdTypes.includes(key)) {
            adImages[key] = payload.adImages[key];
          }
        });
        Object.keys(payload.adLinks || {}).forEach(key => {
          if (validAdTypes.includes(key)) {
            adLinks[key] = payload.adLinks[key];
          }
        });
        Object.keys(payload.visibility || {}).forEach(key => {
          if (validAdTypes.includes(key)) {
            visibility[key] = payload.visibility[key];
          }
        });

        state.adImages = adImages;
        state.adLinks = adLinks;
        state.visibility = visibility;
        
        Object.keys(state.visibility).forEach(adType => {
          state[`${adType}AdVisible`] = state.visibility[adType];
        });
        
        state.visibilityLoaded = true;
        state.submitting = false;
        state.submitSuccess = true;
      })
      .addCase(submitAds.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'An error occurred while submitting ads';
        state.visibilityLoaded = false;
      });
  },
});

export const { toggleAd, toggleEconomyAds, toggleLifestyleAds, setAdImage, setAdLink, clearAd, resetSubmitStatus } = adSlice.actions;
export default adSlice.reducer;
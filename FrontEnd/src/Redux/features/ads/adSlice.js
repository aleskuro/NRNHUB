import { createSlice } from '@reduxjs/toolkit';

// Load from localStorage
const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('adsState');
    if (serializedState === null) return undefined;
    const state = JSON.parse(serializedState);
    // Ensure adLinks exists
    if (!state.adLinks) {
      state.adLinks = { mobile: '', right: '', left: '', bottom: '', hero: '' };
    }
    return state;
  } catch (err) {
    console.error('Failed to load ads state:', err);
    return undefined;
  }
};

const defaultState = {
  mobileAdVisible: false,
  rightAdVisible: false,
  leftAdVisible: false,
  bottomAdVisible: false,
  heroAdVisible: false,
  adImages: {
    mobile: null,
    right: null,
    left: null,
    bottom: null,
    hero: null,
  },
  adLinks: {
    mobile: '',
    right: '',
    left: '',
    bottom: '',
    hero: '',
  },
};

const initialState = loadFromLocalStorage() || defaultState;

const saveToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('adsState', serializedState);
  } catch (err) {
    console.error('Failed to save ads state:', err);
  }
};

const adSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    toggleAd: (state, action) => {
      const { ad } = action.payload;
      state[`${ad}AdVisible`] = !state[`${ad}AdVisible`];
      saveToLocalStorage(state);
    },
    setAdImage: (state, action) => {
      const { ad, imagePath } = action.payload;
      state.adImages[ad] = imagePath;
      saveToLocalStorage(state);
    },
    setAdLink: (state, action) => {
      const { ad, link } = action.payload;
      state.adLinks = state.adLinks || {};
      state.adLinks[ad] = link;
      saveToLocalStorage(state);
    },
  },
});

export const { toggleAd, setAdImage, setAdLink } = adSlice.actions;
export default adSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'rooms',
  selectedCategory: 'All',
  selectedStay: null,
  selectedProviders: [],
  tiffinList: [],
  cleaningList: [],
  loading: false,
};

export const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSelectedStay: (state, action) => {
      state.selectedStay = action.payload;
    },
    toggleSelectedProvider: (state, action) => {
      const provider = action.payload;
      const id = (provider._id || provider.id)?.toString();
      const exists = state.selectedProviders.some(
        (p) => (p._id || p.id)?.toString() === id
      );
      if (exists) {
        state.selectedProviders = state.selectedProviders.filter(
          (p) => (p._id || p.id)?.toString() !== id
        );
      } else {
        state.selectedProviders.push(provider);
      }
    },
    clearSelectedProviders: (state) => {
      state.selectedProviders = [];
    },
    setTiffinList: (state, action) => {
      state.tiffinList = action.payload;
    },
    setCleaningList: (state, action) => {
      state.cleaningList = action.payload;
    },
    setServicesLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setActiveTab,
  setSelectedCategory,
  setSelectedStay,
  toggleSelectedProvider,
  clearSelectedProviders,
  setTiffinList,
  setCleaningList,
  setServicesLoading,
} = servicesSlice.actions;

export default servicesSlice.reducer;

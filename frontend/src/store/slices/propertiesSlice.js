import { createSlice } from '@reduxjs/toolkit';

const loadShortlistFromStorage = () => {
  try {
    const raw = localStorage.getItem('staysync_shortlist');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const initialState = {
  searchParams: {
    location: 'All Cities',
    propertyType: 'All Types',
    budget: 'All Budgets',
    moveInDate: '',
  },
  filters: {
    city: 'All',
    areaSearch: '',
    propertyType: '',
    hostelCategory: '',
    maxBudget: '',
    roomType: '',
    foodOnly: false,
  },
  shortlisted: loadShortlistFromStorage(),
  selectedProperty: null,
  propertiesList: [],
  loading: false,
  error: null,
};

export const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setSearchParam: (state, action) => {
      const { key, value } = action.payload;
      state.searchParams[key] = value;
    },
    setAllSearchParams: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    resetFilters: (state) => {
      state.filters = {
        city: 'Indore',
        areaSearch: '',
        propertyType: '',
        hostelCategory: '',
        maxBudget: '',
        roomType: '',
        foodOnly: false,
      };
    },
    toggleShortlist: (state, action) => {
      const propertyId = action.payload;
      if (state.shortlisted[propertyId]) {
        delete state.shortlisted[propertyId];
      } else {
        state.shortlisted[propertyId] = true;
      }
      try {
        localStorage.setItem('staysync_shortlist', JSON.stringify(state.shortlisted));
      } catch (e) {
        console.error('Failed to save shortlist to storage:', e);
      }
    },
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload;
    },
    setPropertiesList: (state, action) => {
      state.propertiesList = action.payload;
      state.loading = false;
    },
    setPropertiesLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPropertiesError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setSearchParam,
  setAllSearchParams,
  setFilter,
  resetFilters,
  toggleShortlist,
  setSelectedProperty,
  setPropertiesList,
  setPropertiesLoading,
  setPropertiesError,
} = propertiesSlice.actions;

export default propertiesSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mobileMenuOpen: false,
  filterDrawerOpen: false,
  calculatorModalOpen: false,
  stayDetailsModalOpen: false,
  notificationsCount: 0,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setFilterDrawerOpen: (state, action) => {
      state.filterDrawerOpen = action.payload;
    },
    toggleFilterDrawer: (state) => {
      state.filterDrawerOpen = !state.filterDrawerOpen;
    },
    setCalculatorModalOpen: (state, action) => {
      state.calculatorModalOpen = action.payload;
    },
    setStayDetailsModalOpen: (state, action) => {
      state.stayDetailsModalOpen = action.payload;
    },
    setNotificationsCount: (state, action) => {
      state.notificationsCount = action.payload;
    },
  },
});

export const {
  setMobileMenuOpen,
  toggleMobileMenu,
  setFilterDrawerOpen,
  toggleFilterDrawer,
  setCalculatorModalOpen,
  setStayDetailsModalOpen,
  setNotificationsCount,
} = uiSlice.actions;

export default uiSlice.reducer;

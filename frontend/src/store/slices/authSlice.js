import { createSlice } from '@reduxjs/toolkit';

const token = typeof window !== 'undefined' ? localStorage.getItem('staysync_token') : null;

const initialState = {
  user: null,
  token: token,
  roommateProfile: null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, token, roommateProfile } = action.payload;
      state.user = user || state.user;
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
        localStorage.setItem('staysync_token', token);
      }
      if (roommateProfile !== undefined) {
        state.roommateProfile = roommateProfile;
      }
      state.loading = false;
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setRoommateProfile: (state, action) => {
      state.roommateProfile = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.roommateProfile = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('staysync_token');
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setCredentials,
  setUser,
  setRoommateProfile,
  logout,
} = authSlice.actions;

export default authSlice.reducer;

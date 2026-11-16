import React, { createContext, useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { authAPI } from '../services/api';
import {
  setCredentials,
  logout as reduxLogout,
  setUser as reduxSetUser,
  setRoommateProfile as reduxSetRoommateProfile,
  setError as reduxSetError,
  setLoading as reduxSetLoading
} from '../store/slices/authSlice';

const AuthContext = createContext(null);

const normalizeUser = (u) => {
  if (!u) return null;
  const idStr = (u.id || u._id)?.toString();
  return { ...u, id: idStr, _id: idStr };
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [roommateProfile, setRoommateProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('staysync_token');
      if (token) {
        try {
          dispatch(reduxSetLoading(true));
          const res = await authAPI.getProfile();
          if (res.success) {
            const normUser = normalizeUser(res.user);
            setUser(normUser);
            setRoommateProfile(res.roommateProfile);
            dispatch(setCredentials({
              user: normUser,
              token,
              roommateProfile: res.roommateProfile
            }));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          logout();
        }
      }
      setLoading(false);
      dispatch(reduxSetLoading(false));
    };

    fetchProfile();
  }, [dispatch]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    dispatch(reduxSetLoading(true));
    try {
      const res = await authAPI.login({ email, password });
      if (res.success) {
        localStorage.setItem('staysync_token', res.token);
        
        // Fetch detailed profile
        const profileRes = await authAPI.getProfile();
        const normUser = normalizeUser(profileRes.user);
        setUser(normUser);
        setRoommateProfile(profileRes.roommateProfile);
        setLoading(false);
        dispatch(setCredentials({
          user: normUser,
          token: res.token,
          roommateProfile: profileRes.roommateProfile
        }));
        return normUser;
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      dispatch(reduxSetError(msg));
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async (credential) => {
    setLoading(true);
    setError(null);
    dispatch(reduxSetLoading(true));
    try {
      const res = await authAPI.googleAuth(credential);
      if (res.success) {
        localStorage.setItem('staysync_token', res.token);
        
        // Fetch detailed profile
        const profileRes = await authAPI.getProfile();
        const normUser = normalizeUser(profileRes.user);
        setUser(normUser);
        setRoommateProfile(profileRes.roommateProfile);
        setLoading(false);
        dispatch(setCredentials({
          user: normUser,
          token: res.token,
          roommateProfile: profileRes.roommateProfile
        }));
        return normUser;
      } else {
        throw new Error(res.message || 'Google authentication failed');
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Google login failed';
      setError(msg);
      dispatch(reduxSetError(msg));
      throw new Error(msg);
    }
  };

  const register = async (nameOrData, email, password, phone, role) => {
    setLoading(true);
    setError(null);
    dispatch(reduxSetLoading(true));
    try {
      const payload = typeof nameOrData === 'object'
        ? nameOrData
        : { name: nameOrData, email, password, phone, role };
      const res = await authAPI.register(payload);
      if (res.success) {
        localStorage.setItem('staysync_token', res.token);
        
        // Fetch detailed profile
        const profileRes = await authAPI.getProfile();
        const normUser = normalizeUser(profileRes.user);
        setUser(normUser);
        setRoommateProfile(profileRes.roommateProfile);
        setLoading(false);
        dispatch(setCredentials({
          user: normUser,
          token: res.token,
          roommateProfile: profileRes.roommateProfile
        }));
        return normUser;
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed.';
      setError(msg);
      dispatch(reduxSetError(msg));
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('staysync_token');
    setUser(null);
    setRoommateProfile(null);
    setLoading(false);
    dispatch(reduxLogout());
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await authAPI.updateProfile(profileData);
      if (res.success) {
        const normUser = normalizeUser(res.user);
        setUser(normUser);
        setRoommateProfile(res.roommateProfile);
        dispatch(reduxSetUser(normUser));
        dispatch(reduxSetRoommateProfile(res.roommateProfile));
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setError(msg);
      dispatch(reduxSetError(msg));
      throw new Error(msg);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      if (res.success) {
        const normUser = normalizeUser(res.user);
        setUser(normUser);
        setRoommateProfile(res.roommateProfile);
        dispatch(reduxSetUser(normUser));
        dispatch(reduxSetRoommateProfile(res.roommateProfile));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const value = {
    user,
    roommateProfile,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

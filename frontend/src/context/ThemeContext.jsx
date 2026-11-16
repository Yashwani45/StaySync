import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'sunset',
    name: 'Sunset Amber',
    tagline: 'Warm, Energetic Coral & Amber',
    primaryHex: '#ea580c',
    accentHex: '#f97316',
    lightBg: '#fff7ed',
    colorClasses: 'from-amber-500 to-orange-600',
  },
  {
    id: 'emerald',
    name: 'Emerald Oasis',
    tagline: 'Fresh, Natural & Modern Living',
    primaryHex: '#059669',
    accentHex: '#10b981',
    lightBg: '#ecfdf5',
    colorClasses: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    tagline: 'Deep, Sleek & Premium Tech',
    primaryHex: '#4f46e5',
    accentHex: '#6366f1',
    lightBg: '#eef2ff',
    colorClasses: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'ocean',
    name: 'Ocean Azure',
    tagline: 'Refreshing Sky Blue & Cyan',
    primaryHex: '#0284c7',
    accentHex: '#0ea5e9',
    lightBg: '#f0f9ff',
    colorClasses: 'from-sky-500 to-blue-600',
  },
  {
    id: 'violet',
    name: 'Cyber Violet',
    tagline: 'Creative & Electric Purple',
    primaryHex: '#7c3aed',
    accentHex: '#a855f7',
    lightBg: '#faf5ff',
    colorClasses: 'from-purple-500 to-violet-600',
  },
  {
    id: 'rose',
    name: 'Rose Crimson',
    tagline: 'Bold, Stylish & Radiant Pink',
    primaryHex: '#e11d48',
    accentHex: '#f43f5e',
    lightBg: '#fff1f2',
    colorClasses: 'from-rose-500 to-pink-600',
  },
];

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme] = useState('indigo');

  const setTheme = () => {
    localStorage.setItem('staysync_theme', 'indigo');
    document.documentElement.setAttribute('data-theme', 'indigo');
  };

  useEffect(() => {
    localStorage.setItem('staysync_theme', 'indigo');
    document.documentElement.setAttribute('data-theme', 'indigo');
  }, []);

  const currentThemeConfig = THEMES.find((t) => t.id === 'indigo') || THEMES[2];

  return (
    <ThemeContext.Provider value={{ theme: 'indigo', setTheme, THEMES, currentThemeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

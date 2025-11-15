// src/context/ThemeContext.js
import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('CCtheme', {
    colors: {
      primaryGradient: 'linear-gradient(90deg, #b7a871, #d1c498)',
      activeButtonBg: 'rgba(183, 168, 113, 0.20)',
      hoverButtonBg: 'rgba(183, 168, 113, 0.12)',

      textDark: '#3e3a33',      // dark neutral
      textPrimary: '#5a554a',   // softer dark
      textSecondary: '#7a7466', // mid neutral
      textMuted: '#a79f8e',     // muted beige-gray

      background: '#fbf8f3',    // your main light color
      background2: '#f3efe7'    // slightly darker warm tone
    },

    shadows: {
      navbar: '0 4px 12px rgba(183, 168, 113, 0.20)',
      activeButton: '0 4px 12px rgba(183, 168, 113, 0.30)',
    },

    accent: {
      primary: '#b7a871',   // your main color
      info: '#4A7EBB',      // blue tone that fits warm palette
      error: '#B94C4C',     // warm red
      success: '#6f8f4f',   // earthy green
    }
  });
  

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

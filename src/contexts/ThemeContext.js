// src/context/ThemeContext.js
import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('CCtheme', {
    colors: {
      primaryGradient: 'linear-gradient(90deg, #f5e1c0, #d9a066)', // flour to baked crust
      activeButtonBg: 'rgba(217, 160, 102, 0.15)', // warm brown hint
      hoverButtonBg: 'rgba(217, 160, 102, 0.1)',
      textLight: '#5b4636', // cocoa brown for text
      textPrimary: '#333',
      textSecondary: '#666'
    },
    borderRadius: {
      navbar: '12px',
      button: '25px',
    },
    shadows: {
      navbar: '0 4px 12px rgba(139, 110, 75, 0.15)', // warm-toned shadow
      activeButton: '0 4px 12px rgba(139, 105, 20, 0.2)',
    },
    accent: {
      primary: '#d9a066',
      secondary: '#3B6FB3', // Darker blue
      info: '#186CB7',
      error: '#B33B3B',
      warning: '#ff9800',
      success: '#769358',
      disabled: "rgba(0, 0, 0, 0.38)",
    }
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

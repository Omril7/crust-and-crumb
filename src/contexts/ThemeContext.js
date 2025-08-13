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
    },
    borderRadius: {
      navbar: '12px',
      button: '25px',
    },
    shadows: {
      navbar: '0 4px 12px rgba(139, 110, 75, 0.15)', // warm-toned shadow
      activeButton: '0 2px 6px rgba(139, 110, 75, 0.2)',
    }
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

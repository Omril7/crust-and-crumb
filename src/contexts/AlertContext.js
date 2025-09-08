import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTheme } from './ThemeContext';

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    onClose: null,
  });
  const { theme } = useTheme();

  const alert = useCallback((message) => {
    return new Promise((resolve) => {
      setAlertState({
        open: true,
        message,
        onClose: () => {
          setAlertState(s => ({ ...s, open: false }));
          resolve();
        },
      });
    });
  }, []);

  const styles = {
    container: {
      fontFamily: 'Arial',
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.18)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    backdrop: {
      background: theme.surface || '#fff',
      borderRadius: 12,
      boxShadow: theme.shadows.card || '0 2px 12px rgba(0,0,0,0.12)',
      padding: 32,
      minWidth: 300,
      maxWidth: 400,
      textAlign: 'center',
      color: theme.textPrimary || '#333',
      fontFamily: theme.fontFamily || 'inherit'
    },
    msg: {
      marginBottom: 24,
      fontSize: '1.1rem',
      fontWeight: 500,
      direction: 'rtl'
    },
    button: {
      background: 'transparent',
      color: theme.accent.primary || '#1976d2',
      border: `2px solid ${theme.accent.primary || '#1976d2'}`,
      borderRadius: 8,
      padding: '10px 24px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '1rem',
      boxShadow: theme.shadows.activeButton,
      transition: 'background 0.2s, color 0.2s',
    }
  }

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      {alertState.open && (
        <div style={styles.container}>
          <div style={styles.backdrop}>
            <div style={styles.msg}>
              {alertState.message}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={alertState.onClose} style={styles.button}>
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

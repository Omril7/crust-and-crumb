import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTheme } from './ThemeContext';

const ConfirmContext = createContext();

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    open: false,
    message: '',
    onConfirm: null,
    onCancel: null,
  });
  const { theme } = useTheme();

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        message,
        onConfirm: () => {
          setConfirmState(s => ({ ...s, open: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(s => ({ ...s, open: false }));
          resolve(false);
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
      background: theme.colors.background,
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      padding: 32,
      minWidth: 320,
      maxWidth: 400,
      textAlign: 'center',
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamily || 'inherit'
    },
    msg: {
      marginBottom: 24,
      fontSize: '1.1rem',
      fontWeight: 500,
      direction: 'rtl'
    },
    button: (color) => ({
      background: 'transparent',
      color: color,
      border: `2px solid ${color}`,
      borderRadius: 8,
      padding: '10px 24px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '1rem',
      boxShadow: theme.shadows.activeButton,
      transition: 'background 0.2s, color 0.2s',
    })
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState.open && (
        <div style={styles.container}>
          <div style={styles.backdrop}>
            <div style={styles.msg}>
              {confirmState.message}
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button onClick={confirmState.onConfirm} style={styles.button(theme.accent.error)}>
                כן
              </button>
              <button onClick={confirmState.onCancel} style={styles.button(theme.accent.success)}>
                לא
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
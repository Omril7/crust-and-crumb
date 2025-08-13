import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = ({ page, setPage }) => {
  const { theme } = useTheme();

  const styles = {
    navbar: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      padding: '12px 20px',
      background: theme.colors.primaryGradient,
      borderRadius: theme.borderRadius.navbar,
      boxShadow: theme.shadows.navbar,
      margin: '10px auto',
      maxWidth: 'fit-content',
    },
    button: {
      padding: '10px 18px',
      color: theme.colors.textLight,
      border: 'none',
      borderRadius: theme.borderRadius.button,
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '15px',
      backgroundColor: 'transparent',
      transition: 'all 0.3s ease',
    },
    activeButton: {
      backgroundColor: theme.colors.activeButtonBg,
      boxShadow: theme.shadows.activeButton,
      transform: 'translateY(-2px)',
    },
    hoverEffect: {
      backgroundColor: theme.colors.hoverButtonBg,
    }
  };

  const navItems = [
    { id: 'recipes', label: 'מתכונים' },
    { id: 'clients', label: 'לקוחות' },
    { id: 'orders', label: 'הזמנות' },
    { id: 'bakePlanning', label: 'תכנון אפייה' },
    { id: 'inventory', label: 'מלאי' }
  ];

  return (
    <nav style={styles.navbar}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setPage(item.id)}
          style={{
            ...styles.button,
            ...(page === item.id ? styles.activeButton : {}),
          }}
          onMouseEnter={(e) => {
            if (page !== item.id) {
              e.target.style.backgroundColor = styles.hoverEffect.backgroundColor;
            }
          }}
          onMouseLeave={(e) => {
            if (page !== item.id) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize'; // or useBreakpoints

const Navbar = ({ page, setPage }) => {
  const { theme } = useTheme();
  const { isMobile, isTablet, isDesktop } = useScreenSize();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu when switching to larger screens
  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  const styles = {
    navbar: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: isMobile ? '0' : '12px',
      padding: isMobile ? '8px 16px' : '12px 20px',
      background: theme.colors.primaryGradient,
      borderRadius: theme.borderRadius.navbar,
      boxShadow: theme.shadows.navbar,
      margin: '10px auto',
      maxWidth: isMobile ? '95%' : 'fit-content',
      minWidth: isMobile ? '320px' : 'auto',
    },
    button: {
      padding: isMobile ? '8px 12px' : isTablet ? '9px 15px' : '10px 18px',
      color: theme.colors.textLight,
      border: 'none',
      borderRadius: theme.borderRadius.button,
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: isMobile ? '13px' : isTablet ? '14px' : '15px',
      backgroundColor: 'transparent',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      flex: isMobile ? '1' : 'none',
      textAlign: 'center',
    },
    activeButton: {
      backgroundColor: theme.colors.activeButtonBg,
      boxShadow: theme.shadows.activeButton,
      transform: isMobile ? 'none' : 'translateY(-2px)',
    },
    hoverEffect: {
      backgroundColor: theme.colors.hoverButtonBg,
    },
    mobileNavContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
    mobileNavHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: isMenuOpen ? '8px' : '0',
    },
    mobileMenuToggle: {
      background: 'none',
      border: 'none',
      color: theme.colors.textLight,
      fontSize: '18px',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'background-color 0.2s ease',
    },
    currentPageIndicator: {
      color: theme.colors.textLight,
      fontWeight: '600',
      fontSize: '14px',
    },
    mobileMenu: {
      display: isMenuOpen ? 'grid' : 'none',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '6px',
      width: '100%',
      marginTop: '4px',
    },
    desktopNav: {
      display: 'flex',
      gap: isTablet ? '8px' : '12px',
      flexWrap: isTablet ? 'wrap' : 'nowrap',
      justifyContent: 'center',
    }
  };

  const navItems = [
    { id: 'recipes', label: 'מתכונים' },
    { id: 'clients', label: 'לקוחות' },
    { id: 'orders', label: 'הזמנות' },
    { id: 'bakePlanning', label: 'תכנון אפייה' },
    { id: 'inventory', label: 'מלאי' }
  ];

  const currentPageLabel = navItems.find(item => item.id === page)?.label || '';

  const handleButtonClick = (itemId) => {
    setPage(itemId);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  if (isMobile) {
    return (
      <nav style={styles.navbar}>
        <div style={styles.mobileNavContainer}>
          <div style={styles.mobileNavHeader}>
            <span style={styles.currentPageIndicator}>{currentPageLabel}</span>
            <button
              style={styles.mobileMenuToggle}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
          <div style={styles.mobileMenu}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleButtonClick(item.id)}
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
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.desktopNav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleButtonClick(item.id)}
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
      </div>
    </nav>
  );
};

export default Navbar;
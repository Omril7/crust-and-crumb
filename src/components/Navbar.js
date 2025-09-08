import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize'; // or useBreakpoints
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useConfirm } from '../contexts/ConfirmContext';

const NAV_ITEMS = [
  { id: '', label: 'בית' },
  { id: 'recipes', label: 'מתכונים' },
  // { id: 'clients', label: 'לקוחות' },
  // { id: 'orders', label: 'הזמנות' },
  { id: 'bakePlanning', label: 'תכנון אפייה' },
  { id: 'inventory', label: 'מלאי' }
];

const Navbar = ({ onLogout }) => {
  const { theme } = useTheme();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.replace("/", "");
  const currentPageId = NAV_ITEMS.find(item => item.id === currentPath)?.id;
  const currentPageLabel = NAV_ITEMS.find(item => item.id === currentPath)?.label || "";

  const { isMobile, isTablet } = useScreenSize();

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

  const handleButtonClick = (itemId) => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
    navigate(itemId);
  };

  const handleLogout = async () => {
    const ok = await confirm(
      "אתה בטוח שאתה רוצה להתנתק?"
    );

    if (!ok) return;

    const ok2 = await confirm(
      "בטוח י'מניאק?"
    );

    if (!ok2) return;

    let { error } = await supabase.auth.signOut();
    onLogout();
  }

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
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleButtonClick(item.id)}
                style={{
                  ...styles.button,
                  ...(currentPageId === item.id ? styles.activeButton : {}),
                }}
                onMouseEnter={(e) => {
                  if (currentPageId !== item.id) {
                    e.target.style.backgroundColor = styles.hoverEffect.backgroundColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPageId !== item.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              style={{ ...styles.button, color: theme.accent.error }}
              onMouseEnter={(e) => e.target.style.backgroundColor = styles.hoverEffect.backgroundColor}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              התנתק
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.desktopNav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleButtonClick(item.id)}
            style={{
              ...styles.button,
              ...(currentPageId === item.id ? styles.activeButton : {}),
            }}
            onMouseEnter={(e) => {
              if (currentPageId !== item.id) {
                e.target.style.backgroundColor = styles.hoverEffect.backgroundColor;
              }
            }}
            onMouseLeave={(e) => {
              if (currentPageId !== item.id) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item.label}
          </button>
        ))}
        {currentPath !== 'login' && (
          <button
            onClick={handleLogout}
            style={{ ...styles.button, color: theme.accent.error }}
            onMouseEnter={(e) => e.target.style.backgroundColor = styles.hoverEffect.backgroundColor}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            התנתק
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
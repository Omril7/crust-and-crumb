import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';

const RecipeCard = ({ recipe, idx, selectedRecipe, setSelectedRecipe }) => {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useScreenSize();

  const isSelected = selectedRecipe === recipe.id;

  const styles = {
    card: {
      position: 'relative',
      cursor: 'pointer',
      padding: isMobile ? '16px' : isTablet ? '18px' : '20px',
      borderRadius: theme.borderRadius?.navbar || '12px',
      background: '#fff',
      boxShadow: isSelected
        ? theme.shadows?.activeButton || '0 4px 12px rgba(0,0,0,0.2)'
        : isMobile ? '0 1px 4px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.1)',
      width: isMobile ? 'calc(50% - 8px)' : isTablet ? '200px' : '220px',
      minWidth: isMobile ? '140px' : isTablet ? '180px' : '200px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      border: isSelected
        ? `2px solid ${theme.colors?.textLight || '#fff'}`
        : '1px solid #ddd',
      backgroundImage: isSelected ? theme.colors?.primaryGradient : 'none',
      color: isSelected ? theme.colors?.textLight : '#333',
      // Mobile-specific optimizations
      ...(isMobile && {
        maxWidth: '160px',
        fontSize: '14px',
      })
    },
    statusCircle: {
      position: 'absolute',
      top: isMobile ? '8px' : '10px',
      left: isMobile ? '8px' : '10px',
      width: isMobile ? '10px' : '12px',
      height: isMobile ? '10px' : '12px',
      borderRadius: '50%',
      backgroundColor: recipe.active ? '#22c55e' : '#ef4444',
      border: '2px solid #fff',
      boxShadow: `0 1px 3px rgba(0,0,0,0.2), 0 0 ${isMobile ? '8px' : '10px'} ${recipe.active ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
      animation: 'shine 2s ease-in-out infinite',
    },
    title: {
      fontSize: isMobile ? '1rem' : isTablet ? '1.1rem' : '1.2rem',
      fontWeight: '700',
      marginBottom: isMobile ? '8px' : '10px',
      lineHeight: '1.3',
      // Prevent text overflow on mobile
      wordBreak: 'break-word',
      hyphens: 'auto',
    },
    info: {
      fontSize: isMobile ? '0.8rem' : isTablet ? '0.9rem' : '0.95rem',
      margin: isMobile ? '4px 0' : '6px 0',
      lineHeight: '1.2',
    }
  };

  const handleMouseEnter = (e) => {
    // Disable hover effects on mobile/touch devices
    if (isMobile) return;
    
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = theme.shadows?.activeButton || '0 4px 12px rgba(0,0,0,0.2)';
  };

  const handleMouseLeave = (e) => {
    // Disable hover effects on mobile/touch devices
    if (isMobile) return;
    
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = isSelected
      ? theme.shadows?.activeButton || '0 4px 12px rgba(0,0,0,0.2)'
      : '0 2px 6px rgba(0,0,0,0.1)';
  };

  return (
    <>
      <style>{`
        @keyframes shine {
          0%, 100% {
            box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 0 ${isMobile ? '8px' : '10px'} ${recipe.active ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
          }
          50% {
            box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 0 ${isMobile ? '16px' : '20px'} ${recipe.active ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'};
          }
        }
      `}</style>
      <div
        key={idx}
        style={styles.card}
        onClick={() => setSelectedRecipe(recipe.id)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div style={styles.statusCircle} />
        <h3 style={styles.title}>{recipe.name}</h3>
        <p style={styles.info}>מחיר: ₪{recipe.sellingprice || 'לא הוגדר'}</p>
        <p style={styles.info}>משקל בצק: {recipe.doughweight} גרם</p>
        <p style={styles.info}>מרכיבים: {recipe.recipe_ingredients?.length || 0}</p>
      </div>
    </>
  );
}

export default RecipeCard;

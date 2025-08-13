import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const RecipeCard = ({ recipe, idx, selectedRecipe, setSelectedRecipe }) => {
  const { theme } = useTheme();

  const isSelected = selectedRecipe === recipe.name;

  const styles = {
    card: {
      cursor: 'pointer',
      padding: '20px',
      borderRadius: theme.borderRadius?.navbar || '12px',
      background: '#fff',
      boxShadow: isSelected
        ? theme.shadows?.activeButton || '0 4px 12px rgba(0,0,0,0.2)'
        : '0 2px 6px rgba(0,0,0,0.1)',
      width: '220px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      border: isSelected
        ? `2px solid ${theme.colors?.textLight || '#fff'}`
        : '1px solid #ddd',
      backgroundImage: isSelected ? theme.colors?.primaryGradient : 'none',
      color: isSelected ? theme.colors?.textLight : '#333',
    },
    title: {
      fontSize: '1.2rem',
      fontWeight: '700',
      marginBottom: '10px',
    },
    info: {
      fontSize: '0.95rem',
      margin: '6px 0',
    }
  };

  return (
    <div
      key={idx}
      style={styles.card}
      onClick={() => setSelectedRecipe(recipe.name)}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = theme.shadows?.activeButton || '0 4px 12px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isSelected
          ? theme.shadows?.activeButton || '0 4px 12px rgba(0,0,0,0.2)'
          : '0 2px 6px rgba(0,0,0,0.1)';
      }}
    >
      <h3 style={styles.title}>{recipe.name}</h3>
      <p style={styles.info}>מחיר: ₪{recipe.sellingPrice || 'לא הוגדר'}</p>
      <p style={styles.info}>משקל בצק: {recipe.doughWeight} גרם</p>
      <p style={styles.info}>מרכיבים: {recipe.ingredients.length}</p>
    </div>
  );
}

export default RecipeCard;
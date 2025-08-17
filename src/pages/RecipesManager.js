import React, { useState, useEffect } from 'react';
import Container from '../components/Container';
import Header from '../components/Header';
import { CookingPot, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';
import RecipeCard from '../components/RecipeCard';
import { Button, Input, Table } from '../components/components';

export default function RecipesManager({ recipes, setRecipes }) {
  const { theme } = useTheme();
  const { isMobile, isTablet, isDesktop } = useScreenSize();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newIngredient, setNewIngredient] = useState({ ingredient: '', bakersPercent: '', weight: '' });
  const [editingBakersPercent, setEditingBakersPercent] = useState(null);

  const isAddDisabled = !(newIngredient.ingredient && newIngredient.bakersPercent && newIngredient.weight);

  const addNewRecipeName = () => {
    if (!newRecipeName) return;
    const newRecipe = {
      name: newRecipeName,
      sellingPrice: null,
      doughWeight: 750, // Default dough weight
      ingredients: []
    };
    setRecipes([...recipes, newRecipe]);
    setSelectedRecipe(newRecipeName);
    setNewRecipeName('');
  };

  const addIngredientToRecipe = () => {
    if (!selectedRecipe || !newIngredient.ingredient) return;

    const updatedRecipes = recipes.map(recipe => {
      if (recipe.name === selectedRecipe) {
        return {
          ...recipe,
          ingredients: [...recipe.ingredients, { ...newIngredient }]
        };
      }
      return recipe;
    });

    setRecipes(updatedRecipes);
    setNewIngredient({ ingredient: '', bakersPercent: '', weight: '', unit: '' });
  };

  const removeIngredient = (ingredientIndex) => {
    const updatedRecipes = recipes.map(recipe => {
      if (recipe.name === selectedRecipe) {
        return {
          ...recipe,
          ingredients: recipe.ingredients.filter((_, index) => index !== ingredientIndex)
        };
      }
      return recipe;
    });
    setRecipes(updatedRecipes);
  };

  const startEditBakersPercent = (index, value) => {
    setEditingBakersPercent({ index, value: value.toString() });
  };

  const saveEditBakersPercent = () => {
    if (!editingBakersPercent) return;
    const { index, value } = editingBakersPercent;

    const updatedRecipes = recipes.map(recipe => {
      if (recipe.name === selectedRecipe) {
        const updatedIngredients = [...recipe.ingredients];
        updatedIngredients[index] = {
          ...updatedIngredients[index],
          bakersPercent: value
        };
        return {
          ...recipe,
          ingredients: updatedIngredients
        };
      }
      return recipe;
    });

    setRecipes(updatedRecipes);
    setEditingBakersPercent(null);
  };

  const updateRecipeProperty = (propertyName, value) => {
    if (!selectedRecipe) return;

    const updatedRecipes = recipes.map(recipe => {
      if (recipe.name === selectedRecipe) {
        return {
          ...recipe,
          [propertyName]: value
        };
      }
      return recipe;
    });

    setRecipes(updatedRecipes);
  };

  const handleDoughWeightChange = (e) => {
    const val = e.target.value;
    if (!val || isNaN(val)) return;
    updateRecipeProperty('doughWeight', Number(val));
  };

  const handleSellingPriceChange = (e) => {
    updateRecipeProperty('sellingPrice', e.target.value);
  };

  const removeRecipe = () => {
    if (!selectedRecipe) return;
    const filtered = recipes.filter(r => r.name !== selectedRecipe);
    setRecipes(filtered);
    setSelectedRecipe(null);
  };

  // Get current recipe data
  const currentRecipe = recipes.find(r => r.name === selectedRecipe);
  const selectedRecipeItems = currentRecipe ? currentRecipe.ingredients : [];
  const doughWeight = currentRecipe ? currentRecipe.doughWeight : null;
  const sellingPrice = currentRecipe ? currentRecipe.sellingPrice || '' : '';

  const totalPercent = selectedRecipeItems.reduce((sum, ingredient) => sum + (Number(ingredient.bakersPercent) || 0), 0);
  const scaleFactor = (doughWeight && totalPercent > 0)
    ? doughWeight / (totalPercent / 100)
    : 0;

  const styles = {
    section: {
      background: '#f9f9f9',
      borderRadius: isMobile ? 6 : 8,
      padding: isMobile ? 12 : isTablet ? 13 : 15,
      boxShadow: isMobile ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 5px rgba(0,0,0,0.1)',
    },
    sectionHeader: {
      fontSize: isMobile ? '1rem' : isTablet ? '1.1rem' : '1.2rem',
      fontWeight: '600',
      marginBottom: isMobile ? 12 : isTablet ? 15 : 18,
      color: theme.colors.textLight || '#4caf50',
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? 6 : 8,
    },
    formRow: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? 8 : 10,
      marginBottom: isMobile ? 12 : 15,
      flexWrap: 'wrap',
      flexDirection: isMobile ? 'column' : 'row',
    },
    button: {
      padding: isMobile ? '10px 18px' : isTablet ? '11px 20px' : '12px 22px',
      backgroundColor: theme.primary || '#4caf50',
      color: theme.buttonText || '#fff',
      border: 'none',
      borderRadius: isMobile ? 8 : 10,
      fontSize: isMobile ? '1rem' : '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'background-color 0.3s',
      boxShadow: theme.boxShadow || '0 4px 12px rgba(0,0,0,0.15)',
      alignSelf: isMobile ? 'stretch' : 'flex-start',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
      gap: isMobile ? '8px' : '12px',
      marginTop: '10px',
    },
    recipeGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: isMobile ? '10px' : '15px',
      justifyContent: 'center',
      padding: isMobile ? '0 5px' : '0',
      maxHeight: isMobile ? '60vh' : 'none',
      overflowY: isMobile ? 'auto' : 'visible',
      paddingBottom: isMobile ? '20px' : '0',
    },
    modalBackdrop: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: isMobile ? 'flex-start' : 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease',
      padding: isMobile ? '10px' : '20px',
      overflowY: isMobile ? 'auto' : 'hidden',
      paddingTop: isMobile ? '20px' : '20px',
      paddingBottom: isMobile ? '20px' : '20px',
    },
    modal: {
      background: '#fff',
      borderRadius: theme.borderRadius?.navbar || '12px',
      boxShadow: theme.shadows?.navbar || '0 4px 12px rgba(0,0,0,0.2)',
      maxWidth: isMobile ? '100%' : isTablet ? '600px' : '700px',
      width: '100%',
      maxHeight: isMobile ? 'calc(100vh - 40px)' : '85%',
      minHeight: isMobile ? 'auto' : 'auto',
      overflowY: 'auto',
      padding: isMobile ? '16px' : isTablet ? '18px 20px' : '20px 24px',
      animation: 'slideUp 0.3s ease',
      margin: isMobile ? '0' : 'auto',
      position: 'relative',
      // Ensure proper scrolling on mobile
      WebkitOverflowScrolling: 'touch',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      borderBottom: `2px solid ${theme.colors?.activeButtonBg || '#eee'}`,
      paddingBottom: 10,
      flexWrap: isMobile ? 'wrap' : 'nowrap',
    },
    modalTitle: {
      margin: 0,
      fontSize: isMobile ? '1.2rem' : '1.4rem',
      wordBreak: 'break-word',
      flex: isMobile ? '1 1 100%' : 'none',
      marginBottom: isMobile ? '8px' : '0',
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      fontSize: isMobile ? '1.3rem' : '1.5rem',
      cursor: 'pointer',
      color: '#999',
      padding: isMobile ? '5px' : '0',
      minWidth: isMobile ? '30px' : 'auto',
      minHeight: isMobile ? '30px' : 'auto',
    }
  };

  return (
    <Container>
      <Header title={"ניהול מתכונים"} icon={<CookingPot size={isMobile ? 28 : 32} />} />

      <section style={styles.section} aria-label="הוספת מתכון חדש">
        <h3 style={styles.sectionHeader}>
          <Plus size={isMobile ? 18 : 20} />
          הוספת מתכון חדש
        </h3>

        <div style={styles.formRow}>
          <Input
            label="שם מתכון"
            type="text"
            value={newRecipeName}
            onChange={(e) => setNewRecipeName(e.target.value)}
          />
          <Button title={"הוסף"} onClick={addNewRecipeName} />
        </div>
      </section>

      <section style={{ 
        ...styles.section, 
        marginTop: isMobile ? '16px' : '20px',
        marginBottom: isMobile ? '20px' : '0'
      }} aria-label="רשימת מתכונים">
        <h3 style={styles.sectionHeader}>
          רשימת מתכונים ({recipes.length})
        </h3>
        <div style={styles.recipeGrid}>
          {recipes.map((recipe, idx) => (
            <RecipeCard
              key={recipe.name}
              recipe={recipe}
              idx={idx}
              selectedRecipe={selectedRecipe}
              setSelectedRecipe={setSelectedRecipe}
            />
          ))}
        </div>
      </section>

      {selectedRecipe && currentRecipe && (
        <div style={styles.modalBackdrop} onClick={() => setSelectedRecipe(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedRecipe}</h2>
              <button
                onClick={() => setSelectedRecipe(null)}
                style={styles.closeButton}
                title="סגור"
              >
                ×
              </button>
            </div>

            <div style={styles.formRow}>
              <Input
                label="משקל בצק (גרם)"
                type="number"
                value={doughWeight ?? ''}
                onChange={handleDoughWeightChange}
                min={1}
              />
              <Input
                label="מחיר מכירה"
                type="number"
                value={sellingPrice}
                onChange={handleSellingPriceChange}
                min={1}
              />
              <Button
                title={"מחק מתכון"}
                onClick={removeRecipe}
                isGood={false}
              />
            </div>

            {/* Add Ingredient */}
            <section style={{ ...styles.section, marginBottom: isMobile ? '16px' : '20px' }} aria-label="הוספת מרכיב">
              <h4 style={styles.sectionHeader}>
                <Plus size={isMobile ? 18 : 20} />
                הוספת מרכיב
              </h4>

              <div style={styles.grid}>
                <Input
                  label="מרכיב"
                  value={newIngredient.ingredient}
                  onChange={(e) => setNewIngredient({ ...newIngredient, ingredient: e.target.value })}
                />
                <Input
                  label="בייקר %"
                  type="number"
                  value={newIngredient.bakersPercent}
                  onChange={(e) => setNewIngredient({ ...newIngredient, bakersPercent: e.target.value })}
                />
                <Input
                  label="משקל (גרם)"
                  type="number"
                  value={newIngredient.weight}
                  onChange={(e) => setNewIngredient({ ...newIngredient, weight: e.target.value })}
                />
                <Button
                  title={isAddDisabled ? 'נא למלא את כל השדות הדרושים' : 'הוסף'}
                  onClick={addIngredientToRecipe}
                  disabled={isAddDisabled}
                />
              </div>
            </section>

            {/* Ingredients Table */}
            <Table
              title="טבלת רכיבים"
              headers={[
                { key: 'ingredient', label: 'מרכיב' },
                {
                  key: 'bakersPercent',
                  label: 'אחוזי בייקר',
                  render: (value, row, i) => (
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => startEditBakersPercent(i, row.bakersPercent)}
                    >
                      {editingBakersPercent?.index === i ? (
                        <input
                          type="number"
                          value={editingBakersPercent.value}
                          onChange={(e) =>
                            setEditingBakersPercent({ index: i, value: e.target.value })
                          }
                          onBlur={saveEditBakersPercent}
                          autoFocus
                          style={{ 
                            width: isMobile ? '50px' : '60px',
                            fontSize: isMobile ? '14px' : '16px'
                          }}
                        />
                      ) : (
                        value
                      )}
                    </div>
                  )
                },
                {
                  key: 'weight',
                  label: 'משקל (גרם)',
                  render: (_, row) =>
                    row.bakersPercent
                      ? ((Number(row.bakersPercent) / 100) * scaleFactor).toFixed(0)
                      : ''
                },
                {
                  key: 'remove',
                  label: 'מחק',
                  render: (_, __, i) => (
                    <div
                      style={{ 
                        cursor: 'pointer', 
                        color: 'red',
                        padding: isMobile ? '8px' : '4px',
                        display: 'flex',
                        justifyContent: 'center'
                      }}
                      onClick={() => removeIngredient(i)}
                      role="button"
                    >
                      <Trash2 size={isMobile ? 18 : 20} />
                    </div>
                  )
                }
              ]}
              data={selectedRecipeItems}
            />

          </div>
        </div>
      )}
    </Container>
  );
}
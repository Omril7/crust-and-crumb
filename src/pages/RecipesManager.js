import React, { useState, useEffect } from 'react';
import Container from '../components/Container';
import Header from '../components/Header';
import { CookingPot, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import RecipeCard from '../components/RecipeCard';
import { Button, Input, Table } from '../components/components';

export default function RecipesManager({ recipes, setRecipes }) {
  const { theme } = useTheme();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newIngredient, setNewIngredient] = useState({ ingredient: '', bakersPercent: '', weight: '', unit: '' });
  const [editingBakersPercent, setEditingBakersPercent] = useState(null);

  const isAddDisabled = !(newIngredient.ingredient && newIngredient.bakersPercent && newIngredient.weight && newIngredient.unit);

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
      borderRadius: 8,
      padding: 15,
      boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
    },
    sectionHeader: {
      fontSize: '1.2rem',
      fontWeight: '600',
      marginBottom: 18,
      color: theme.colors.textLight || '#4caf50',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    formRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 15,
      flexWrap: 'wrap',
    },
    button: {
      padding: '12px 22px',
      backgroundColor: theme.primary || '#4caf50',
      color: theme.buttonText || '#fff',
      border: 'none',
      borderRadius: 10,
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'background-color 0.3s',
      boxShadow: theme.boxShadow || '0 4px 12px rgba(0,0,0,0.15)',
      alignSelf: 'flex-start',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginTop: '10px',
    },
    modalBackdrop: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease'
    },
    modal: {
      background: '#fff',
      borderRadius: theme.borderRadius?.navbar || '12px',
      boxShadow: theme.shadows?.navbar || '0 4px 12px rgba(0,0,0,0.2)',
      maxWidth: '700px',
      width: '90%',
      maxHeight: '85%',
      overflowY: 'auto',
      padding: '20px 24px',
      animation: 'slideUp 0.3s ease'
    }
  };

  return (
    <Container>
      <Header title={"ניהול מתכונים"} icon={<CookingPot size={32} />} />

      <section style={styles.section} aria-label="הוספת מתכון חדש">
        <h3 style={styles.sectionHeader}>
          <Plus size={20} />
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

      <section style={{ ...styles.section, marginTop: '20px' }} aria-label="הוספת שם מתכון חדש">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
          {recipes.map((recipe, idx) => (
            <RecipeCard
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 15,
              borderBottom: `2px solid ${theme.colors?.activeButtonBg || '#eee'}`,
              paddingBottom: 10
            }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedRecipe}</h2>
              <button
                onClick={() => setSelectedRecipe(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#999'
                }}
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
            <section style={{ ...styles.section, marginBottom: '20px' }} aria-label="הוספת מרכיב">
              <h4 style={styles.sectionHeader}>
                <Plus size={20} />
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
                  value={newIngredient.ingredweightient}
                  onChange={(e) => setNewIngredient({ ...newIngredient, weight: e.target.value })}
                />
                <Input
                  label="יחידה"
                  value={newIngredient.unit}
                  onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
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
                          style={{ width: '60px' }}
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
                { key: 'unit', label: 'יחידה' },
                {
                  key: 'remove',
                  label: 'מחק',
                  render: (_, __, i) => (
                    <div
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() => removeIngredient(i)}
                      role="button"
                    >
                      <Trash2 size={20} />
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
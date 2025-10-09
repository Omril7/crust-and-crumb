import React, { useState, useEffect } from 'react';
import Container from '../components/Container';
import Header from '../components/Header';
import { CookingPot, Croissant, Percent, Plus, Trash2, Weight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';
import RecipeCard from '../components/RecipeCard';
import { Button, Input, Table } from '../components/components';
import { useConfirm } from '../contexts/ConfirmContext';
import { supabase } from '../supabaseClient';
import LinearLoader from '../components/LinearLoader';

const INIT_NEW_INGREDIENT = {
  ingredient: '',
  bakerspercent: ''
};

export default function RecipesManager({ user }) {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useScreenSize();
  const { confirm } = useConfirm();

  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newIngredient, setNewIngredient] = useState(INIT_NEW_INGREDIENT);
  const [editingBakersPercent, setEditingBakersPercent] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAddDisabled = !(newIngredient.ingredient && newIngredient.bakerspercent);

  // ---------------- Fetch data ----------------
  useEffect(() => {
    fetchRecipes();
    fetchInventory();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, sellingprice, doughweight, active, recipe_ingredients(id, ingredient_id, bakerspercent, inventory(ingredient))')
      .eq('user_id', user.id);

    if (error) console.error(error);
    else setRecipes(data || []);
    setLoading(false);
  };

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('id, ingredient')
      .eq('user_id', user.id);

    if (error) console.error(error);
    else setInventory(data || []);
    setLoading(false);
  };

  // ---------------- CRUD actions ----------------
  const addNewRecipeName = async () => {
    if (!newRecipeName) return;
    const { data, error } = await supabase
      .from('recipes')
      .insert([{ user_id: user.id, name: newRecipeName, doughweight: 750, sellingprice: 0, active: true }])
      .select()
      .single();

    if (error) return console.error(error);
    const newRecipe = { ...data, recipe_ingredients: [] };
    setRecipes([...recipes, newRecipe]);
    setSelectedRecipe(newRecipe);
    setNewRecipeName('');
  };

  const addIngredientToRecipe = async () => {
    if (!selectedRecipe || !newIngredient.ingredient) return;

    // find inventory row
    const inv = inventory.find(i => i.ingredient === newIngredient.ingredient);
    if (!inv) return;

    const { data, error } = await supabase
      .from('recipe_ingredients')
      .insert([{
        recipe_id: selectedRecipe.id,
        ingredient_id: inv.id,
        bakerspercent: Number(newIngredient.bakerspercent)
      }])
      .select('id, ingredient_id, bakerspercent, inventory(ingredient)')
      .single();

    if (error) return console.error(error);

    // Update the recipes array
    const updatedRecipes = recipes.map(r =>
      r.id === selectedRecipe.id
        ? { ...r, recipe_ingredients: [...r.recipe_ingredients, data] }
        : r
    );
    setRecipes(updatedRecipes);

    // Update selectedRecipe with the new ingredient
    setSelectedRecipe({
      ...selectedRecipe,
      recipe_ingredients: [...selectedRecipe.recipe_ingredients, data]
    });

    setNewIngredient(INIT_NEW_INGREDIENT);
  };

  const removeIngredient = async (id) => {
    const { error } = await supabase.from('recipe_ingredients').delete().eq('id', id);
    if (error) return console.error(error);

    // Update the recipes array
    const updatedRecipes = recipes.map(r =>
      r.id === selectedRecipe.id
        ? { ...r, recipe_ingredients: r.recipe_ingredients.filter(ing => ing.id !== id) }
        : r
    );
    setRecipes(updatedRecipes);

    // Update selectedRecipe
    setSelectedRecipe({
      ...selectedRecipe,
      recipe_ingredients: selectedRecipe.recipe_ingredients.filter(ing => ing.id !== id)
    });
  };

  const startEditBakersPercent = (id, value) => {
    setEditingBakersPercent({ id, value: value.toString() });
  };

  const saveEditBakersPercent = async () => {
    if (!editingBakersPercent) return;
    const { id, value } = editingBakersPercent;

    const { error } = await supabase
      .from('recipe_ingredients')
      .update({ bakerspercent: Number(value) })
      .eq('id', id);

    if (error) return console.error(error);

    // Update the specific ingredient in both recipes array and selectedRecipe
    const updatedRecipes = recipes.map(r =>
      r.id === selectedRecipe.id
        ? {
          ...r,
          recipe_ingredients: r.recipe_ingredients.map(ing =>
            ing.id === id ? { ...ing, bakerspercent: Number(value) } : ing
          )
        }
        : r
    );
    setRecipes(updatedRecipes);

    // Update selectedRecipe
    setSelectedRecipe({
      ...selectedRecipe,
      recipe_ingredients: selectedRecipe.recipe_ingredients.map(ing =>
        ing.id === id ? { ...ing, bakerspercent: Number(value) } : ing
      )
    });

    setEditingBakersPercent(null);
  };

  const updateRecipeField = async (field, value) => {
    try {
      const { error } = await supabase
        .from("recipes")
        .update({ [field]: value })
        .eq("id", selectedRecipe.id);

      if (error) throw error;

      // Update both recipes array and selectedRecipe
      const updatedRecipes = recipes.map(r =>
        r.id === selectedRecipe.id ? { ...r, [field]: value } : r
      );
      setRecipes(updatedRecipes);

      setSelectedRecipe({ ...selectedRecipe, [field]: value });
    } catch (err) {
      console.error("Error updating recipe:", err.message);
    }
  };

  const removeRecipe = async () => {
    if (!selectedRecipe) return;
    const ok = await confirm('האם אתה בטוח שברצונך למחוק מתכון זה?');
    if (!ok) return;

    const { error } = await supabase.from('recipes').delete().eq('id', selectedRecipe.id);
    if (error) return console.error(error);

    setRecipes(recipes.filter(r => r.id !== selectedRecipe.id));
    setSelectedRecipe(null);
  };

  const handleRecipeSelect = (recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId);
    setSelectedRecipe(recipe);
  };

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
        {loading ? (
          <LinearLoader />
        ) : (
          <div style={styles.recipeGrid}>
            {recipes.sort((a, b) => a.active === b.active ? 0 : a.active ? -1 : 1).map((recipe, idx) => (
              <RecipeCard
                key={recipe.name}
                recipe={recipe}
                idx={idx}
                selectedRecipe={selectedRecipe?.id || null}
                setSelectedRecipe={handleRecipeSelect}
              />
            ))}
          </div>
        )}
      </section>

      {selectedRecipe && (
        <div style={styles.modalBackdrop} onClick={() => setSelectedRecipe(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedRecipe.name}</h2>
              <button
                onClick={() => setSelectedRecipe(null)}
                style={styles.closeButton}
                title="סגור"
              >
                ×
              </button>
            </div>

            <div style={{ ...styles.grid, marginBottom: "20px" }}>
              <Input
                label="משקל בצק (גרם)"
                type="number"
                value={selectedRecipe.doughweight || ""}
                onChange={(e) =>
                  setSelectedRecipe({ ...selectedRecipe, doughweight: e.target.value })
                }
                onBlur={() => updateRecipeField("doughweight", selectedRecipe.doughweight)}
                min={1}
                icon={<Weight size={isMobile ? 20 : 18} />}
                style={{ width: "50%" }}
              />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: isMobile ? '10px' : '12px',
                alignSelf: isMobile ? 'stretch' : 'flex-start',
              }}>
                <input
                  type="checkbox"
                  id="recipe-active"
                  checked={selectedRecipe.active || false}
                  onChange={(e) => {
                    const newActive = e.target.checked;
                    setSelectedRecipe({ ...selectedRecipe, active: newActive });
                    updateRecipeField("active", newActive);
                  }}
                  style={{
                    width: isMobile ? '20px' : '22px',
                    height: isMobile ? '20px' : '22px',
                    cursor: 'pointer',
                    accentColor: theme.accent.primary || '#4caf50'
                  }}
                />
                <label
                  htmlFor="recipe-active"
                  style={{
                    fontSize: isMobile ? '0.95rem' : '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  מתכון פעיל
                </label>
              </div>
              <Input
                label="מחיר מכירה"
                type="number"
                value={selectedRecipe.sellingprice || ""}
                onChange={(e) =>
                  setSelectedRecipe({ ...selectedRecipe, sellingprice: e.target.value })
                }
                onBlur={() => updateRecipeField("sellingprice", selectedRecipe.sellingprice)}
                min={1}
                icon={<span style={{ fontWeight: 'bold', fontSize: isMobile ? '1.1rem' : '1.3rem' }}>₪</span>}
                style={{ width: "50%" }}
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
                  icon={<Croissant size={isMobile ? 20 : 18} />}
                  style={{ width: '100%' }}
                  list="ingredient-list"
                  dataList={inventory.map(client => client.ingredient)}
                />
                <Input
                  label="בייקר"
                  type="number"
                  value={newIngredient.bakerspercent}
                  onChange={(e) => setNewIngredient({ ...newIngredient, bakerspercent: e.target.value })}
                  icon={<Percent size={isMobile ? 20 : 18} />}
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
                  key: 'bakerspercent',
                  label: 'אחוזי בייקר',
                  render: (value, row, i) => (
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => startEditBakersPercent(row.id, row.bakerspercent)}
                    >
                      {editingBakersPercent?.id === row.id ? (
                        <input
                          type="number"
                          value={editingBakersPercent.value}
                          onChange={(e) =>
                            setEditingBakersPercent({ id: row.id, value: e.target.value })
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
                  render: (_, row) => {
                    const totalPercent = selectedRecipe.recipe_ingredients.reduce((sum, ing) => sum + (Number(ing.bakerspercent) || 0), 0);
                    return row.bakerspercent && totalPercent > 0
                      ? ((Number(row.bakerspercent) / 100) *
                        (selectedRecipe.doughweight / (totalPercent / 100))
                      ).toFixed(0)
                      : '';
                  }
                },
                {
                  key: 'remove',
                  label: 'מחק',
                  render: (_, row) => (
                    <div
                      style={{
                        cursor: 'pointer',
                        color: 'red',
                        padding: isMobile ? '8px' : '4px',
                        display: 'flex',
                        justifyContent: 'center'
                      }}
                      onClick={() => removeIngredient(row.id)}
                      role="button"
                    >
                      <Trash2 size={isMobile ? 18 : 20} />
                    </div>
                  )
                }
              ]}
              data={selectedRecipe.recipe_ingredients.map(ingredient => ({
                ...ingredient,
                ingredient: ingredient.inventory?.ingredient || 'Unknown'
              }))}
            />

          </div>
        </div>
      )}
    </Container>
  );
}
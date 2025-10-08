import React, { useEffect, useState } from 'react';
import { Package, Trash2, Plus, Hash, Ruler, IceCreamBowl, TriangleAlert, ShieldMinus, Infinity, AlertCircle, Edit, Edit2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select, SelectWithSearchBar, Table } from '../components/components';
import { formatNumber, parseDate } from '../utils/helper';
import { useConfirm } from '../contexts/ConfirmContext';
import { supabase } from '../supabaseClient';
import LinearLoader from '../components/LinearLoader';
import InventoryAlert from '../components/InventoryAlert';
import { useAlert } from '../contexts/AlertContext';

const INIT_NEW_INGREDIENT = {
  ingredient: "",
  qty: 1,
  unit: "קג",
  lowthreshold: "",
  price_per_unit: 0,
  type: "base", // "base" or "derived"
  recipe: [] // for derived: [{ ingredientId, ratio }]
};

const INIT_UPDATED_INGREDIENT = {
  qty: 1,
  id: null
};

export default function Inventory({ user }) {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useScreenSize();
  const { confirm } = useConfirm();
  const { alert } = useAlert();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newIngredient, setNewIngredient] = useState(INIT_NEW_INGREDIENT);
  const [updatedIngredient, setUpdatedIngredient] = useState(INIT_UPDATED_INGREDIENT);

  const [editingQty, setEditingQty] = useState(null);
  const [editingLowthreshold, setEditingLowthreshold] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);

  // Load inventory
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("inventory")
        .select(`
          *,
          inventory_recipe!inventory_recipe_derived_id_fkey(
            *,
            ingredient:inventory!inventory_recipe_ingredient_id_fkey(ingredient)
          )
        `)
        .order("lastupdate", { ascending: false });


      if (error) {
        console.error("Error fetching inventory:", error.message);
      } else {
        setInventory(data);
      }
      setLoading(false);
    };

    fetchInventory();
  }, []);

  // Add ingredient
  const addIngredient = async () => {
    const { ingredient, qty, unit, lowthreshold, price_per_unit, type, recipe } = newIngredient;
    if (!(ingredient && qty && unit && lowthreshold && price_per_unit)) {
      await alert("לא חסר לך משהו אהבל? אולי מרכיב? אולי כמות? אולי המינימום שלך?");
      return;
    }

    const { data: ingredientData, error } = await supabase
      .from("inventory")
      .insert([{
        user_id: user.id,
        ingredient,
        qty: parseFloat(qty),
        unit,
        lowthreshold: parseFloat(lowthreshold),
        price_per_unit: parseFloat(price_per_unit),
        type
      }])
      .select()
      .single();

    if (error) {
      console.error("Error adding ingredient:", error.message);
      return;
    }

    const ingredientId = ingredientData.id;

    if (type === "derived" && recipe.length > 0) {
      for (const r of recipe) {
        if (!r.ingredientId || !r.ratio) continue;

        // insert recipe row
        await supabase.from("inventory_recipe").insert([{
          user_id: user.id,
          derived_id: ingredientId,
          ingredient_id: r.ingredientId,
          ratio: r.ratio
        }]);

        // reduce base ingredient qty only if it is not unlimited
        const base = inventory.find(i => i.id === r.ingredientId);
        if (!base || base.qty === -1000) continue;

        const usedQty = (r.ratio / 100) * parseFloat(qty);

        await supabase
          .from("inventory")
          .update({ qty: base.qty - usedQty })
          .eq("id", r.ingredientId);
      }
    }

    setInventory([...inventory, ingredientData]);
    setNewIngredient(INIT_NEW_INGREDIENT);
  };


  // Update ingredient qty (same for base or derived)
  const updateIngredient = async () => {
    if (!(updatedIngredient.id && updatedIngredient.qty)) {
      await alert("לא חסר לך משהו אהבל? אולי מרכיב? אולי כמות?");
      return;
    };

    const ingredientRow = inventory.find(i => i.id === updatedIngredient.id);
    if (!ingredientRow) {
      console.error("Ingredient not found in state");
      return;
    }

    const newQty = parseFloat(ingredientRow.qty) + parseFloat(updatedIngredient.qty);

    const { data, error } = await supabase
      .from("inventory")
      .update({ qty: newQty })
      .eq("id", updatedIngredient.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating ingredient:", error.message);
      return;
    }

    // Update local state
    setInventory(inventory.map(i => i.id === updatedIngredient.id ? data : i));

    setUpdatedIngredient(INIT_UPDATED_INGREDIENT);
  };

  // Remove ingredient
  const removeIngredient = async (id) => {
    const ok = await confirm(
      "האם אתה בטוח שברצונך למחוק מרכיב זה? מחיקה שלו תסיר אותו מכל המתכונים בהם הוא מופיע, והמתכונים ישתנו בהתאם."
    );

    if (!ok) return;

    const { error } = await supabase.from("inventory").delete().eq("id", id);

    if (error) {
      console.error("Error removing ingredient:", error.message);
      return;
    }

    setInventory(inventory.filter((o) => o.id !== id));
  };

  // Editable fields helpers
  const startEditQty = (id, value) => setEditingQty({ id, value: value.toString() });
  const saveEditQty = async () => {
    if (!editingQty) return;
    const { id, value } = editingQty;
    const { data, error } = await supabase
      .from("inventory")
      .update({ qty: parseFloat(value) })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) setInventory(inventory.map(i => i.id === id ? data : i));
    setEditingQty(null);
  };

  const startEditLowthreshold = (id, value) => setEditingLowthreshold({ id, value: value.toString() });
  const saveEditLowthreshold = async () => {
    if (!editingLowthreshold) return;
    const { id, value } = editingLowthreshold;
    const { data, error } = await supabase
      .from("inventory")
      .update({ lowthreshold: parseFloat(value) })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) setInventory(inventory.map(i => i.id === id ? data : i));
    setEditingLowthreshold(null);
  };

  const startEditPrice = (id, value) => setEditingPrice({ id, value: value.toString() });
  const saveEditPrice = async () => {
    if (!editingPrice) return;
    const { id, value } = editingPrice;
    const { data, error } = await supabase
      .from("inventory")
      .update({ price_per_unit: parseFloat(value) })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) setInventory(inventory.map(i => i.id === id ? data : i));
    setEditingPrice(null);
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    // Unlimited items always last
    if (a.qty === -1000 && b.qty !== -1000) return 1;
    if (b.qty === -1000 && a.qty !== -1000) return -1;
    if (a.qty === -1000 && b.qty === -1000) return 0;

    // Normal low-stock sorting
    const aLow = parseFloat(a.qty || 0) < parseFloat(a.lowthreshold || 0);
    const bLow = parseFloat(b.qty || 0) < parseFloat(b.lowthreshold || 0);
    return aLow === bLow ? 0 : aLow ? -1 : 1;
  });


  const styles = {
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr',
      gap: isMobile ? 15 : 20,
      marginBottom: 25,
    },
    section: {
      background: '#f9f9f9',
      borderRadius: isMobile ? 6 : 8,
      padding: isMobile ? 12 : 15,
      boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
      marginBottom: '15px'
    },
    sectionHeader: {
      fontSize: isMobile ? '1.1rem' : '1.2rem',
      fontWeight: '600',
      marginBottom: isMobile ? 15 : 18,
      color: theme.colors.textLight || '#4caf50',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    formRow: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 15,
    },
    fileInput: {
      cursor: 'pointer',
      fontSize: isMobile ? '0.9rem' : '1rem',
      color: theme.textPrimary || '#333',
      border: `2px dashed ${theme.borderColor || '#ccc'}`,
      padding: isMobile ? 15 : 20,
      borderRadius: isMobile ? 8 : 10,
      backgroundColor: theme.surface || '#fafafa',
      transition: 'border-color 0.3s',
      textAlign: 'center',
    },
    fileInputWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      justifyContent: 'center',
    },
    buttonContainer: {
      gridColumn: isMobile ? '1' : 'span 2',
      display: 'flex',
      justifyContent: isMobile ? 'stretch' : 'flex-start',
      marginTop: isMobile ? 10 : 0
    },
    formGrid: (cols) => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 15
    }),
    editInput: {
      width: isMobile ? '60px' : '50px',
      padding: isMobile ? '6px' : '4px',
      fontSize: isMobile ? '16px' : '14px', // 16px prevents zoom on mobile
      border: '1px solid #ccc',
      borderRadius: '4px',
      textAlign: 'center'
    }
  };

  // Responsive table headers - hide less important columns on mobile
  const getTableHeaders = () => {
    const baseHeaders = [
      {
        key: "alert",
        label: "",
        render: (_, row) =>
          row.type === "derived" || parseFloat(row.qty || 0) >= parseFloat(row.lowthreshold || 0) ? null : <TriangleAlert size={isMobile ? 18 : 20} color="orange" />
      },
      { key: "ingredient", label: "מרכיב" },
      {
        key: "qty",
        label: "כמות",
        render: (value, row) => (
          <>
            {value === -1000 || row.type === "derived" ? (
              <Infinity />
            ) : (
              <div
                style={{ cursor: "pointer" }}
                onClick={() => startEditQty(row.id, row.qty)}
              >
                {editingQty?.id === row.id ? (
                  <input
                    type="number"
                    value={editingQty.value}
                    onChange={(e) =>
                      setEditingQty({ id: row.id, value: e.target.value })
                    }
                    onBlur={saveEditQty}
                    autoFocus
                    style={styles.editInput}
                  />
                ) : `${formatNumber(value)} ${row.unit}`
                }
              </div>
            )}
          </>

        )
      },
      { key: "type", label: "סוג", render: (_, row) => row.type === "base" ? "בסיסי" : "נגזר" },
      {
        key: "lowthreshold",
        label: "מינימום",
        render: (value, row) => (
          <>
            {value === -1000 || row.type === "derived" ? (
              <Infinity />
            ) : (
              <div
                style={{ cursor: "pointer" }}
                onClick={() => startEditLowthreshold(row.id, row.lowthreshold)}
              >
                {editingLowthreshold?.id === row.id ? (
                  <input
                    type="number"
                    value={editingLowthreshold.value}
                    onChange={(e) =>
                      setEditingLowthreshold({ id: row.id, value: e.target.value })
                    }
                    onBlur={saveEditLowthreshold}
                    autoFocus
                    style={styles.editInput}
                  />
                ) : `${formatNumber(value)} ${row.unit}`
                }
              </div>
            )}
          </>

        )
      },
    ];

    if (!isMobile) {
      baseHeaders.push(
        {
          key: "price_per_unit",
          label: "מחיר ליחידה",
          render: (value, row) => (
            <div
              style={{ cursor: "pointer" }}
              onClick={() => startEditPrice(row.id, row.price_per_unit)}
            >
              {editingPrice?.id === row.id ? (
                <input
                  type="number"
                  value={editingPrice.value}
                  onChange={(e) =>
                    setEditingPrice({ id: row.id, value: e.target.value })
                  }
                  onBlur={saveEditPrice}
                  autoFocus
                  style={styles.editInput}
                />
              ) : `₪${formatNumber(value)}`
              }
            </div>

          )
        },
        { key: "lastupdate", label: "עידכון אחרון", render: (value, row) => parseDate(value) }
      );
    }

    baseHeaders.push({
      key: "remove",
      label: "מחק",
      render: (_, row) => (
        <div
          style={{
            cursor: "pointer",
            color: "red",
            display: "flex",
            justifyContent: "center"
          }}
          onClick={() => removeIngredient(row.id)}
          title="מחק מרכיב"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && removeIngredient(row.id)}
        >
          <Trash2 size={isMobile ? 18 : 20} />
        </div>
      )
    });

    return baseHeaders;
  };

  return (
    <Container>
      <Header
        title={"ניהול מלאי"}
        icon={<Package size={isMobile ? 28 : 32} />}
      />

      <section style={styles.section} aria-label="הוספת מלאי">
        <InventoryAlert />
        <div style={styles.formGrid(isMobile ? '1' : '2')}>
          <div style={{ width: '90%' }}>
            <h3 style={styles.sectionHeader}>
              <Plus size={isMobile ? 18 : 20} />
              הוספת מלאי חדש
            </h3>
            <div style={styles.formGrid(isMobile || isTablet ? '1' : '2')}>
              <Input
                label="מרכיב"
                value={newIngredient.ingredient}
                onChange={e => setNewIngredient({ ...newIngredient, ingredient: e.target.value })}
                icon={<IceCreamBowl size={18} />}
                style={{ width: '100%', fontSize: '16px' }}
              />
              <Input
                label="כמות"
                type="number"
                value={newIngredient.qty}
                onChange={e => setNewIngredient({ ...newIngredient, qty: e.target.value })}
                icon={<Hash size={18} />}
                min={1}
                style={{ width: '100%', fontSize: '16px' }}
              />
              <Select
                label="סוג מרכיב"
                value={newIngredient.type}
                onChange={e => setNewIngredient({ ...newIngredient, type: e.target.value })}
                options={[{ name: 'בסיסי', value: "base" }, { name: "נגזר", value: "derived" }]}
              />

              <Select
                label="מידה"
                value={newIngredient.unit}
                onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                icon={<Ruler size={18} />}
                options={['קג', 'גרם']}
                style={{ width: '100%', fontSize: '16px' }}
              />
              <Input
                label="מינימום"
                type="number"
                value={newIngredient.lowthreshold}
                onChange={e => setNewIngredient({ ...newIngredient, lowthreshold: e.target.value })}
                icon={<ShieldMinus size={18} />}
                min={1}
                style={{ width: '100%', fontSize: '16px' }}
              />
              <Input
                label={`מחיר ל- ${newIngredient.unit === "קג" ? "1 קג" : "100 גרם"}`}
                type="number"
                value={newIngredient.price_per_unit}
                onChange={e => setNewIngredient({ ...newIngredient, price_per_unit: e.target.value })}
                icon={<span style={{ fontWeight: 'bold', fontSize: isMobile ? '1.1rem' : '1.3rem' }}>₪</span>}
                min={1}
                style={{ width: '100%', fontSize: '16px' }}
              />
              <Button
                title="הוסף מרכיב"
                onClick={addIngredient}
              />
            </div>
            {newIngredient.type === "derived" && (
              <div style={{ marginTop: 10 }}>
                <h4>מרכיבים במוצר נגזר</h4>
                {newIngredient.recipe.map((r, idx) => (
                  <div style={{ display: 'flex', gap: "16px", marginBottom: "10px" }}>
                    <div key={idx} style={styles.formGrid(isMobile || isTablet ? '1' : '2')}>
                      <SelectWithSearchBar
                        label="מרכיב"
                        value={r.ingredientId || ""}
                        onChange={e => {
                          const updatedRecipe = [...newIngredient.recipe];
                          updatedRecipe[idx].ingredientId = e.target.value;
                          setNewIngredient({ ...newIngredient, recipe: updatedRecipe });
                        }}
                        icon={<IceCreamBowl size={18} />}
                        options={inventory.filter(i => i.type === "base").map(i => ({ name: i.ingredient, value: i.id }))}
                        style={{ width: '100%', fontSize: '16px' }}
                      />
                      <Input
                        label="% מהכמות"
                        type="number"
                        value={r.ratio || 0}
                        onChange={e => {
                          const updatedRecipe = [...newIngredient.recipe];
                          updatedRecipe[idx].ratio = parseFloat(e.target.value);
                          setNewIngredient({ ...newIngredient, recipe: updatedRecipe });
                        }}
                        style={{ width: '100%', fontSize: '16px' }}
                      />
                    </div>
                    <Button
                      title="X"
                      onClick={() => {
                        const updatedRecipe = newIngredient.recipe.filter((_, i) => i !== idx);
                        setNewIngredient({ ...newIngredient, recipe: updatedRecipe });
                      }}
                    />
                  </div>
                ))}
                <Button
                  title="הוסף מרכיב"
                  onClick={() => setNewIngredient({
                    ...newIngredient,
                    recipe: [...newIngredient.recipe, { ingredientId: null, ratio: 50 }]
                  })}
                />
              </div>
            )}

          </div>

          <div style={{ width: '90%' }}>
            <h3 style={styles.sectionHeader}>
              <Edit2 size={isMobile ? 18 : 20} />
              עידכון מלאי
            </h3>
            <div style={styles.formGrid(isMobile || isTablet ? '1' : '2')}>
              <SelectWithSearchBar
                label="מרכיב"
                value={updatedIngredient.id}
                onChange={e => setUpdatedIngredient({ ...updatedIngredient, id: e.target.value })}
                icon={<IceCreamBowl size={18} />}
                options={inventory.map(inv => ({ name: inv.ingredient, value: inv.id }))}
                style={{ width: '100%', fontSize: '16px' }}
              />
              <Input
                label="כמות שהתווספה"
                type="number"
                value={updatedIngredient.qty}
                onChange={e => setUpdatedIngredient({ ...updatedIngredient, qty: e.target.value })}
                icon={<Hash size={18} />}
                min={1}
                style={{ width: '100%' }}
              />
              <Button
                title="עדכן מרכיב"
                onClick={updateIngredient}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Inventory Table */}
      {loading ? (
        <LinearLoader />
      ) : (
        <Table
          title="טבלת מלאי"
          sortable={true}
          headers={getTableHeaders()}
          data={sortedInventory}
        />
      )}

    </Container>
  );
}
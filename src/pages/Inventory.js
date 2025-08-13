import React, { useState } from 'react';
import { Package, Phone, MapPin, Calendar, FileUp, Edit2, Trash2, Plus, UserPlus, Hash, Ruler, IceCreamBowl, TriangleAlert } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select, Table } from '../components/components';
import { getTodayDate, uuidv4 } from '../utils/helper';

export default function Inventory({ inventory, setInventory }) {
  const { theme } = useTheme();

  const [newIngredient, setNewIngredient] = useState({
    ingredient: '',
    qty: 1,
    unit: 'קג',
    lowThreshold: '',
    lastUpdate: getTodayDate()
  });
  const [editingQty, setEditingQty] = useState(null);

  const addIngredient = () => {
    if (!(newIngredient.ingredient && newIngredient.qty && newIngredient.unit && newIngredient.lowThreshold)) return;

    const ingredientWithId = { ...newIngredient, ingredientId: uuidv4() };
    setInventory([...inventory, ingredientWithId]);
    setNewIngredient({
      ingredient: '',
      qty: 1,
      unit: 'קג',
      lowThreshold: '',
      lastUpdate: getTodayDate(),
      ingredientId: '',
    });
  };

  const removeIngredient = (ingredientIdToRemove) => {
    setInventory(inventory.filter(o => o.ingredientId !== ingredientIdToRemove));
  };

  const startEditQty = (ingredientId, value) => {
    setEditingQty({ ingredientId, value: value.toString() });
  };

  const saveEditQty = () => {
    if (!editingQty) return;
    const { ingredientId, value } = editingQty;

    const updatedInventory = inventory.map((ingredient) => {
      if (ingredient.ingredientId === ingredientId) {
        return { ...ingredient, qty: value }
      } else {
        return ingredient
      }
    })

    setInventory(updatedInventory)

    setEditingQty(null);
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    const aLow = parseFloat(a.qty || 0) < parseFloat(a.lowThreshold || 0);
    const bLow = parseFloat(b.qty || 0) < parseFloat(b.lowThreshold || 0);

    // Sort so that "low" items come first
    if (aLow === bLow) return 0; // same status → keep original order
    return aLow ? -1 : 1;        // if aLow is true, move it up
  });


  const styles = {
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20,
      marginBottom: 25,
    },
    section: {
      background: '#f9f9f9',
      borderRadius: 8,
      padding: 15,
      boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
      marginBottom: '15px'
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
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 15,
    },
    fileInput: {
      cursor: 'pointer',
      fontSize: '1rem',
      color: theme.textPrimary || '#333',
      border: `2px dashed ${theme.borderColor || '#ccc'}`,
      padding: 20,
      borderRadius: 10,
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
  };

  return (
    <Container>
      <Header title={"ניהול מלאי"} icon={<Package size={32} />} />

      <section style={styles.section} aria-label="הוספת מלאי">
        <h3 style={styles.sectionHeader}>
          <Plus size={20} />
          הוספת מלאי
        </h3>

        <div style={styles.gridContainer}>
          <Input
            label="מרכיב"
            value={newIngredient.ingredient}
            onChange={e => setNewIngredient({ ...newIngredient, ingredient: e.target.value })}
            icon={<IceCreamBowl size={18} />}
            style={{ width: '100%' }}
          />
          <Input
            label="כמות"
            type="number"
            value={newIngredient.qty}
            onChange={e => setNewIngredient({ ...newIngredient, qty: e.target.value })}
            icon={<Hash size={18} />}
            min={1}
            style={{ width: '100%' }}
          />
          <Select
            label="מידה"
            value={newIngredient.unit}
            onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}
            icon={<Ruler size={18} />}
            options={['קג', 'גרם']}
            style={{ width: '100%' }}
          />
          <Input
            label="חסם תחתון"
            type="number"
            value={newIngredient.lowThreshold}
            onChange={e => setNewIngredient({ ...newIngredient, lowThreshold: e.target.value })}
            icon={<UserPlus size={18} />}
            min={1}
            style={{ width: '100%' }}
          />

          <Button
            title="הוסף מרכיב"
            onClick={addIngredient}
          />
        </div>
      </section>

      {/* Inventory Table */}
      <Table
        title="טבלת לקוחות"
        sortable={true} // Enable sorting for the entire table
        headers={[
          {
            key: 'alert',
            label: '',
            sortable: false, // Disable sorting for this specific column
            render: (_, row) => (
              <>
                {(parseFloat(row.qty || 0) < parseFloat(row.lowThreshold || 0)) ? (
                  <TriangleAlert size={20} color="orange" />
                ) : (
                  <></>
                )}
              </>
            )
          },
          { key: 'ingredient', label: 'מרכיב' }, // Sortable by default
          {
            key: 'qty',
            label: 'כמות',
            render: (value, row, i) => (
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => startEditQty(row.ingredientId, row.qty)}
              >
                {editingQty?.ingredientId === row.ingredientId ? (
                  <input
                    type="number"
                    value={editingQty.value}
                    onChange={(e) =>
                      setEditingQty({ ingredientId: row.ingredientId, value: e.target.value })
                    }
                    onBlur={saveEditQty}
                    autoFocus
                    style={{ width: '50px' }}
                  />
                ) : (
                  value
                )}
              </div>
            )
          },
          { key: 'unit', label: 'מידה' }, // Sortable by default
          { key: 'lowThreshold', label: 'חסם תחתון' }, // Sortable by default
          { key: 'lastUpdate', label: 'עידכון אחרון' }, // Sortable by default
          {
            key: 'remove',
            label: 'מחק',
            sortable: false, // Disable sorting for action column
            render: (_, row) => (
              <div
                style={{ cursor: 'pointer', color: 'red' }}
                onClick={() => removeIngredient(row.ingredientId)}
                title="מחק הזמנה"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && removeIngredient(row.ingredientId)}
              >
                <Trash2 size={20} />
              </div>
            )
          }
        ]}
        data={sortedInventory} // Note: remove your custom sorting since table handles it now
      />

    </Container >
  );
}

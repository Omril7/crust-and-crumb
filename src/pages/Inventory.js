import React, { useState } from 'react';
import { Package, Phone, MapPin, Calendar, FileUp, Edit2, Trash2, Plus, UserPlus, Hash, Ruler, IceCreamBowl, TriangleAlert } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select, Table } from '../components/components';
import { getTodayDate, uuidv4 } from '../utils/helper';

export default function Inventory({ inventory, setInventory }) {
  const { theme } = useTheme();
  const { isMobile, isTablet, width } = useScreenSize();

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
    mobileFormGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 15
    },
    tabletFormGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20
    },
    desktopFormGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 20,
      alignItems: 'end'
    },
    editInput: {
      width: isMobile ? '60px' : '50px',
      padding: isMobile ? '6px' : '4px',
      fontSize: isMobile ? '16px' : '14px', // 16px prevents zoom on mobile
      border: '1px solid #ccc',
      borderRadius: '4px',
      textAlign: 'center'
    }
  };

  // Responsive form layout
  const renderFormInputs = () => {
    if (isMobile) {
      return (
        <>
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
            label="מידה"
            value={newIngredient.unit}
            onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}
            icon={<Ruler size={18} />}
            options={['קג', 'גרם']}
            style={{ width: '100%', fontSize: '16px' }}
          />
          <Input
            label="חסם תחתון"
            type="number"
            value={newIngredient.lowThreshold}
            onChange={e => setNewIngredient({ ...newIngredient, lowThreshold: e.target.value })}
            icon={<UserPlus size={18} />}
            min={1}
            style={{ width: '100%', fontSize: '16px' }}
          />
          <div style={styles.buttonContainer}>
            <Button
              title="הוסף מרכיב"
              onClick={addIngredient}
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
            />
          </div>
        </>
      );
    }

    if (isTablet) {
      return (
        <>
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
          <div style={styles.buttonContainer}>
            <Button
              title="הוסף מרכיב"
              onClick={addIngredient}
            />
          </div>
        </>
      );
    }

    // Desktop layout
    return (
      <>
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
      </>
    );
  };

  // Responsive table headers - hide less important columns on mobile
  const getTableHeaders = () => {
    const baseHeaders = [
      {
        key: 'alert',
        label: '',
        sortable: false,
        render: (_, row) => (
          <>
            {(parseFloat(row.qty || 0) < parseFloat(row.lowThreshold || 0)) ? (
              <TriangleAlert size={isMobile ? 18 : 20} color="orange" />
            ) : (
              <></>
            )}
          </>
        )
      },
      { key: 'ingredient', label: 'מרכיב' },
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
                style={styles.editInput}
              />
            ) : (
              value
            )}
          </div>
        )
      },
      { key: 'unit', label: 'מידה' },
    ];

    // Add additional columns for tablet and desktop
    if (!isMobile) {
      baseHeaders.push(
        { key: 'lowThreshold', label: 'חסם תחתון' },
        { key: 'lastUpdate', label: 'עידכון אחרון' }
      );
    }

    // Add remove action column
    baseHeaders.push({
      key: 'remove',
      label: 'מחק',
      sortable: false,
      render: (_, row) => (
        <div
          style={{
            cursor: 'pointer',
            color: 'red',
            padding: isMobile ? '8px' : '4px',
            display: 'flex',
            justifyContent: 'center'
          }}
          onClick={() => removeIngredient(row.ingredientId)}
          title="מחק מרכיב"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && removeIngredient(row.ingredientId)}
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
        <h3 style={styles.sectionHeader}>
          <Plus size={isMobile ? 18 : 20} />
          הוספת מלאי
        </h3>

        <div style={
          isMobile ? styles.mobileFormGrid :
            isTablet ? styles.tabletFormGrid :
              styles.desktopFormGrid
        }>
          {renderFormInputs()}
        </div>
      </section>

      {/* Inventory Table */}
      <Table
        title="טבלת מלאי"
        sortable={true}
        headers={getTableHeaders()}
        data={sortedInventory}
        responsive={true}
        mobileBreakpoint={768}
      />

    </Container>
  );
}
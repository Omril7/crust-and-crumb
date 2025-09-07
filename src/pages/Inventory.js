import React, { useEffect, useState } from 'react';
import { Package, Trash2, Plus, Hash, Ruler, IceCreamBowl, TriangleAlert, ShieldMinus, Infinity, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select, Table } from '../components/components';
import { formatNumber, parseDate } from '../utils/helper';
import { useConfirm } from '../contexts/ConfirmContext';
import { supabase } from '../supabaseClient';
import LinearLoader from '../components/LinearLoader';
import InventoryAlert from '../components/InventoryAlert';

const INIT_NEW_INGREDIENT = {
  ingredient: "",
  qty: 1,
  unit: "קג",
  lowthreshold: ""
};

export default function Inventory({ user }) {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useScreenSize();
  const { confirm } = useConfirm();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newIngredient, setNewIngredient] = useState(INIT_NEW_INGREDIENT);

  const [editingQty, setEditingQty] = useState(null);

  // Load inventory
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("inventory").select("*").order("lastupdate", { ascending: false });

      if (error) {
        console.error("Error fetching inventory:", error.message);
      } else {
        setInventory(data);
      }
      setLoading(false);
    };

    fetchInventory();
  }, []);

  const addIngredient = async () => {
    if (!(newIngredient.ingredient && newIngredient.qty && newIngredient.unit && newIngredient.lowthreshold)) return;

    const { data, error } = await supabase
      .from("inventory")
      .insert([
        {
          user_id: user.id,
          ingredient: newIngredient.ingredient,
          qty: parseFloat(newIngredient.qty),
          unit: newIngredient.unit,
          lowthreshold: parseFloat(newIngredient.lowthreshold)
        }
      ])
      .select();

    if (error) {
      console.error("Error adding ingredient:", error.message);
      return;
    }

    setInventory([...inventory, ...data]);
    setNewIngredient(INIT_NEW_INGREDIENT);
  };

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

  const startEditQty = (id, value) => {
    setEditingQty({ id, value: value.toString() });
  };

  const saveEditQty = async () => {
    if (!editingQty) return;
    const { id, value } = editingQty;

    const { data, error } = await supabase
      .from("inventory")
      .update({ qty: parseFloat(value) })
      .eq("id", id)
      .select("id, ingredient, qty, unit, lowthreshold, lastupdate")
      .single(); // ensures only one row


    if (error) {
      console.error("Error updating qty:", error.message);
      return;
    }

    if (!error && data) {
      setInventory(inventory.map(i => i.id === id ? data : i));
    }

    setEditingQty(null);
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    const aLow = parseFloat(a.qty || 0) < parseFloat(a.lowthreshold || 0);
    const bLow = parseFloat(b.qty || 0) < parseFloat(b.lowthreshold || 0);

    if (aLow === bLow) return 0;
    return aLow ? -1 : 1;
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
            label="מינימום"
            type="number"
            value={newIngredient.lowthreshold}
            onChange={e => setNewIngredient({ ...newIngredient, lowthreshold: e.target.value })}
            icon={<ShieldMinus size={18} />}
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
            label="מינימום"
            type="number"
            value={newIngredient.lowthreshold}
            onChange={e => setNewIngredient({ ...newIngredient, lowthreshold: e.target.value })}
            icon={<ShieldMinus size={18} />}
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
          label="מינימום"
          type="number"
          value={newIngredient.lowthreshold}
          onChange={e => setNewIngredient({ ...newIngredient, lowthreshold: e.target.value })}
          icon={<ShieldMinus size={18} />}
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
        key: "alert",
        label: "",
        render: (_, row) =>
          parseFloat(row.qty || 0) < parseFloat(row.lowthreshold || 0) ? (
            <TriangleAlert size={isMobile ? 18 : 20} color="orange" />
          ) : null
      },
      { key: "ingredient", label: "מרכיב" },
      {
        key: "qty",
        label: "כמות",
        render: (value, row) => (
          <>
            {value < 0 ? (
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
                ) : formatNumber(value)
                }
              </div>
            )}
          </>

        )
      },
      { key: "unit", label: "מידה" }
    ];

    if (!isMobile) {
      baseHeaders.push(
        { key: "lowthreshold", label: "מינימום", render: (value, _) => value < 0 ? <Infinity /> : value },
        {
          key: "lastupdate",
          label: "עידכון אחרון",
          render: (value, row) => parseDate(value)
        }
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
        <h3 style={styles.sectionHeader}>
          <Plus size={isMobile ? 18 : 20} />
          הוספת מלאי
        </h3>
        <InventoryAlert />

        <div style={
          isMobile ? styles.mobileFormGrid :
            isTablet ? styles.tabletFormGrid :
              styles.desktopFormGrid
        }>
          {renderFormInputs()}
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
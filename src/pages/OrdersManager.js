import React, { useState, useEffect } from 'react';
import { Calendar, Croissant, Edit2, Hash, MapPin, PackageCheck, PlusSquare, Trash2, UserPlus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select, Table } from '../components/components';
import { getTodayDate, uuidv4 } from '../utils/helper';

export default function OrdersManager({ orders, setOrders, clients, recipes }) {
  const { theme } = useTheme();

  const recipeNames = recipes.map(r => r.name).filter(Boolean);
  const pickupOptions = ['גדרה', 'הנשיא הראשון 40', 'רחובות', 'תל אביב', 'כפר ורדים'];

  const [newOrder, setNewOrder] = useState({
    clientName: '',
    orderDate: getTodayDate(),
    pickupDate: '',
    items: [],
    total: 0,
    status: 'Planned',
    notes: '',
  });

  const [newItem, setNewItem] = useState({ item: '', qty: '' });

  const getRecipeSellingPrice = (recipeName) => {
    const recipe = recipes.find(r => r.name === recipeName);
    return recipe && recipe.sellingPrice ? Number(recipe.sellingPrice) : 0;
  };

  const calculateTotal = (items) =>
    items.reduce(
      (total, item) => total + item.qty * getRecipeSellingPrice(item.item),
      0
    );

  const addOrder = () => {
    if (!newOrder.clientName) return;
    if (newOrder.items.length === 0) {
      alert('אנא הוסף לפחות פריט אחד להזמנה');
      return;
    }
    const orderWithId = { ...newOrder, orderId: uuidv4() };
    setOrders([...orders, orderWithId]);
    setNewOrder({
      clientName: '',
      orderDate: getTodayDate(),
      pickupDate: '',
      items: [],
      total: 0,
      status: 'Planned',
      notes: '',
    });
    setNewItem({ item: '', qty: '' });
  };

  const removeOrder = (orderIdToRemove) => {
    setOrders(orders.filter(o => o.orderId !== orderIdToRemove));
  };

  const getPickupLocation = (clientName) => {
    const client = clients.find(c => c.name === clientName);
    return client ? client.pickup : '-';
  };

  const addItemToOrder = () => {
    if (!newItem.item || !newItem.qty || isNaN(newItem.qty) || Number(newItem.qty) <= 0)
      return;
    if (!recipes.find(r => r.name === newItem.item)) {
      alert('מתכון לא נמצא. אנא בחר מתכון קיים מהרשימה.');
      return;
    }
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { item: newItem.item, qty: Number(newItem.qty) }],
    }));
    setNewItem({ item: '', qty: '' });
  };

  const removeItemFromOrder = (index) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    setNewOrder(prev => ({
      ...prev,
      total: calculateTotal(prev.items),
    }));
  }, [newOrder.items, recipes]);

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
      // flexWrap: 'wrap',
    },
    removeBtn: {
      color: '#ff4444',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: 20,
      userSelect: 'none',
    },
    itemsListStyle: {
      marginTop: 10,
      marginBottom: 10,
      maxHeight: 140,
      overflowY: 'auto',
      borderRadius: 6,
      border: '1px solid #ddd',
      padding: 8,
      background: '#fff',
      direction: 'rtl',
    }
  };

  return (
    <Container>
      <Header title={"ניהול הזמנות"} icon={<PackageCheck size={32} />} />

      <div style={styles.gridContainer}>
        {/* Right side: New Order Form */}
        <section style={styles.section} aria-label="הוסף הזמנה חדשה">
          <h3 style={styles.sectionHeader}>
            <Edit2 size={20} />
            הוספת הזמנה חדשה
          </h3>

          <div style={styles.formRow}>
            <Input
              label="שם לקוח"
              value={newOrder.clientName}
              onChange={e => setNewOrder({ ...newOrder, clientName: e.target.value })}
              icon={<UserPlus size={18} />}
              style={{ width: '100%' }}
              list="client-list"
              dataList={clients.map(client => client.name)}
            />
            <Select
              label="מיקום איסוף"
              value={newOrder.pickupLocation}
              onChange={(e) => setNewOrder({ ...newOrder, pickupLocation: e.target.value })}
              options={pickupOptions}
              icon={<MapPin size={18} />}
              style={{ width: '100%' }}
            />
            <Input
              label="תאריך הזמנה"
              type="date"
              value={newOrder.orderDate}
              onChange={e => setNewOrder({ ...newOrder, orderDate: e.target.value })}
              icon={<Calendar size={18} />}
              style={{ width: '100%' }}
            />
            <Input
              label="תאריך איסוף"
              type="date"
              value={newOrder.pickupDate}
              onChange={e => setNewOrder({ ...newOrder, pickupDate: e.target.value })}
              icon={<Calendar size={18} />}
              style={{ width: '100%' }}
            />
            <Input
              label="הערות"
              value={newOrder.notes}
              onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })}
              icon={<Edit2 size={18} />}
              style={{ width: '100%' }}
            />
            <div style={{ fontWeight: 'bold', marginTop: 10, fontSize: 18, color: '#444', marginBottom: 24 }}>
              סה"כ הזמנה: ₪{newOrder.total}
            </div>

            <Button
              title="הוסף הזמנה"
              onClick={addOrder}
            />
          </div>
        </section>

        {/* Left side: Add Item to Order */}
        <section style={styles.section} aria-label="הוסף פריט להזמנה">
          <h3 style={styles.sectionHeader}>
            <Edit2 size={20} />
            הוסף פריט להזמנה
          </h3>

          <div style={styles.formRow}>
            <Select
              label="שם פריט"
              value={newItem.item}
              onChange={e => setNewItem({ ...newItem, item: e.target.value })}
              options={recipeNames}
              icon={<Croissant size={18} />}
              style={{ width: '100%' }}
            />
            <Input
              label="כמות"
              type="number"
              value={newItem.qty}
              onChange={e => setNewItem({ ...newItem, qty: e.target.value })}
              icon={<Hash size={18} />}
            />

            <Button
              title="הוסף פריט"
              onClick={addItemToOrder}
              icon={<PlusSquare size={18} color={theme.buttonText || '#fff'} />}
            />
          </div>

          <div style={styles.itemsListStyle} aria-label="פריטים בהזמנה">
            {newOrder.items.length === 0 ? (
              <p style={{ color: '#999', margin: 0 }}>לא הוספו פריטים עדיין</p>
            ) : (
              newOrder.items.map((itm, i) => {
                const unitPrice = getRecipeSellingPrice(itm.item);
                const itemTotal = itm.qty * unitPrice;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                      padding: '4px 8px',
                      backgroundColor: '#eee',
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  >
                    <div>
                      {itm.item} - כמות: {itm.qty} (₪{unitPrice} × {itm.qty} = ₪{itemTotal})
                    </div>
                    <div
                      style={{ ...styles.removeBtn, fontSize: 18 }}
                      onClick={() => removeItemFromOrder(i)}
                      title="הסר פריט"
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && removeItemFromOrder(i)}
                    >
                      &times;
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section >
      </div>

      {/* Orders Table */}
      <Table
        title="טבלת הזמנות"
        headers={[
          { key: 'clientName', label: 'שם לקוח' },
          {
            key: 'pickupLocation',
            label: 'מקום איסוף',
            render: (_, row) => getPickupLocation(row.clientName)
          },
          { key: 'orderDate', label: 'תאריך הזמנה' },
          { key: 'pickupDate', label: 'תאריך איסוף' },
          {
            key: 'items',
            label: 'פריטים',
            render: (_, row) => (
              <>
                {row.items.map((itm, idx) => {
                  const unitPrice = getRecipeSellingPrice(itm.item);
                  const itemTotal = itm.qty * unitPrice;
                  return (
                    <div key={idx} style={{ marginBottom: 4, textAlign: 'right' }}>
                      {itm.item} - כמות: {itm.qty} (₪{unitPrice} × {itm.qty} = ₪{itemTotal})
                    </div>
                  );
                })}
              </>
            )
          },
          {
            key: 'total',
            label: 'סה"כ',
            render: (value) => <strong>₪{value}</strong>
          },
          { key: 'notes', label: 'הערות' },
          {
            key: 'remove',
            label: 'מחק',
            render: (_, row) => (
              <div
                style={{ cursor: 'pointer', color: 'red' }}
                onClick={() => removeOrder(row.orderId)}
                title="מחק הזמנה"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && removeOrder(row.orderId)}
              >
                <Trash2 size={20} />
              </div>
            )
          }
        ]}
        data={orders}
      />

    </Container >
  );
}

import React, { useState, useEffect } from 'react';
import { Calendar, Croissant, Edit2, Hash, MapPin, PackageCheck, PlusSquare, Trash2, UserPlus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select, Table } from '../components/components';
import { getTodayDate, uuidv4 } from '../utils/helper';

export default function OrdersManager({ orders, setOrders, clients, recipes }) {
  const { theme } = useTheme();
  const { isMobile, isTablet, isDesktop } = useScreenSize();

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
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? 16 : isTablet ? 18 : 20,
      marginBottom: isMobile ? 20 : 25,
    },
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
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: isMobile ? 8 : 10,
      marginBottom: isMobile ? 12 : 15,
    },
    inputGroup: {
      width: '100%',
      marginBottom: isMobile ? '8px' : '0',
    },
    removeBtn: {
      color: '#ff4444',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: isMobile ? 18 : 20,
      userSelect: 'none',
      padding: isMobile ? '8px' : '4px',
      minWidth: isMobile ? '32px' : 'auto',
      minHeight: isMobile ? '32px' : 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemsListStyle: {
      marginTop: 10,
      marginBottom: 10,
      maxHeight: isMobile ? 120 : 140,
      overflowY: 'auto',
      borderRadius: 6,
      border: '1px solid #ddd',
      padding: isMobile ? 6 : 8,
      background: '#fff',
      direction: 'rtl',
      WebkitOverflowScrolling: 'touch',
    },
    itemRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      marginBottom: 6,
      padding: isMobile ? '6px' : '4px 8px',
      backgroundColor: '#eee',
      borderRadius: 6,
      fontSize: isMobile ? '0.8rem' : '0.85rem',
      lineHeight: isMobile ? '1.3' : '1.4',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '4px' : '0',
    },
    itemContent: {
      flex: 1,
      wordBreak: 'break-word',
      textAlign: isMobile ? 'center' : 'right',
    },
    totalDisplay: {
      fontWeight: 'bold',
      marginTop: 10,
      fontSize: isMobile ? '1rem' : '1.1rem',
      color: '#444',
      marginBottom: isMobile ? 16 : 24,
      textAlign: isMobile ? 'center' : 'left',
      padding: isMobile ? '8px' : '0',
      backgroundColor: isMobile ? '#f0f8ff' : 'transparent',
      borderRadius: isMobile ? '6px' : '0',
      border: isMobile ? '1px solid #ddd' : 'none',
    },
    // Mobile-specific order sections
    mobileOrderSection: {
      ...(isMobile && {
        order: 1,
      })
    },
    mobileItemSection: {
      ...(isMobile && {
        order: 2,
      })
    }
  };

  // Mobile-optimized table headers
  const tableHeaders = isMobile ? [
    { key: 'clientName', label: 'לקוח' },
    {
      key: 'summary',
      label: 'פרטים',
      render: (_, row) => (
        <div style={{ textAlign: 'right', fontSize: '0.75rem', lineHeight: '1.3' }}>
          <div><strong>איסוף:</strong> {getPickupLocation(row.clientName)}</div>
          <div><strong>הזמנה:</strong> {row.orderDate}</div>
          <div><strong>איסוף:</strong> {row.pickupDate}</div>
          <div><strong>סה"כ:</strong> ₪{row.total}</div>
          {row.notes && <div><strong>הערות:</strong> {row.notes}</div>}
        </div>
      ),
      sortable: false
    },
    {
      key: 'items',
      label: 'פריטים',
      render: (_, row) => (
        <div style={{ textAlign: 'right', fontSize: '0.75rem', lineHeight: '1.3' }}>
          {row.items.map((itm, idx) => {
            const unitPrice = getRecipeSellingPrice(itm.item);
            const itemTotal = itm.qty * unitPrice;
            return (
              <div key={idx} style={{ marginBottom: 2 }}>
                {itm.item}<br />
                <small>כמות: {itm.qty} (₪{itemTotal})</small>
              </div>
            );
          })}
        </div>
      ),
      sortable: false
    },
    {
      key: 'remove',
      label: 'מחק',
      render: (_, row) => (
        <div
          style={{
            cursor: 'pointer',
            color: 'red',
            padding: '8px',
            display: 'flex',
            justifyContent: 'center'
          }}
          onClick={() => removeOrder(row.orderId)}
          title="מחק הזמנה"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && removeOrder(row.orderId)}
        >
          <Trash2 size={18} />
        </div>
      ),
      sortable: false
    }
  ] : [
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
      ),
      sortable: false
    },
    {
      key: 'total',
      label: 'סה"כ',
      render: (value) => <strong>₪{value}</strong>
    },
    { key: 'notes', label: 'הערות', sortable: false },
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
      ),
      sortable: false
    }
  ];

  return (
    <Container>
      <Header title={"ניהול הזמנות"} icon={<PackageCheck size={isMobile ? 28 : 32} />} />

      <div style={styles.gridContainer}>
        {/* Order Form Section */}
        <section
          style={{ ...styles.section, ...styles.mobileOrderSection }}
          aria-label="הוסף הזמנה חדשה"
        >
          <h3 style={styles.sectionHeader}>
            <Edit2 size={isMobile ? 18 : 20} />
            הוספת הזמנה חדשה
          </h3>

          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <Input
                label="שם לקוח"
                value={newOrder.clientName}
                onChange={e => setNewOrder({ ...newOrder, clientName: e.target.value })}
                icon={<UserPlus size={18} />}
                style={{ width: '100%' }}
                list="client-list"
                dataList={clients.map(client => client.name)}
              />
            </div>
            <div style={styles.inputGroup}>
              <Select
                label="מיקום איסוף"
                value={newOrder.pickupLocation}
                onChange={(e) => setNewOrder({ ...newOrder, pickupLocation: e.target.value })}
                options={pickupOptions}
                icon={<MapPin size={18} />}
                style={{ width: '100%' }}
              />
            </div>
            <div style={styles.inputGroup}>
              <Input
                label="תאריך הזמנה"
                type="date"
                value={newOrder.orderDate}
                onChange={e => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                icon={<Calendar size={18} />}
                style={{ width: '100%' }}
              />
            </div>
            <div style={styles.inputGroup}>
              <Input
                label="תאריך איסוף"
                type="date"
                value={newOrder.pickupDate}
                onChange={e => setNewOrder({ ...newOrder, pickupDate: e.target.value })}
                icon={<Calendar size={18} />}
                style={{ width: '100%' }}
              />
            </div>
            <div style={styles.inputGroup}>
              <Input
                label="הערות"
                value={newOrder.notes}
                onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })}
                icon={<Edit2 size={18} />}
                style={{ width: '100%' }}
              />
            </div>

            <div style={styles.totalDisplay}>
              סה"כ הזמנה: ₪{newOrder.total}
            </div>

            <Button
              title="הוסף הזמנה"
              onClick={addOrder}
              style={{
                width: isMobile ? '100%' : 'auto',
              }}
            />
          </div>
        </section>

        {/* Add Item Section */}
        <section
          style={{ ...styles.section, ...styles.mobileItemSection }}
          aria-label="הוסף פריט להזמנה"
        >
          <h3 style={styles.sectionHeader}>
            <Edit2 size={isMobile ? 18 : 20} />
            הוסף פריט להזמנה
          </h3>

          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <Select
                label="שם פריט"
                value={newItem.item}
                onChange={e => setNewItem({ ...newItem, item: e.target.value })}
                options={recipeNames}
                icon={<Croissant size={18} />}
                style={{ width: '100%' }}
              />
            </div>
            <div style={styles.inputGroup}>
              <Input
                label="כמות"
                type="number"
                value={newItem.qty}
                onChange={e => setNewItem({ ...newItem, qty: e.target.value })}
                icon={<Hash size={18} />}
                style={{ width: '100%' }}
                inputMode={isMobile ? 'numeric' : 'text'}
              />
            </div>

            <Button
              title="הוסף פריט"
              onClick={addItemToOrder}
              icon={<PlusSquare size={18} color={theme.buttonText || '#fff'} />}
              style={{
                width: isMobile ? '100%' : 'auto',
              }}
            />
          </div>

          <div style={styles.itemsListStyle} aria-label="פריטים בהזמנה">
            {newOrder.items.length === 0 ? (
              <p style={{
                color: '#999',
                margin: 0,
                textAlign: 'center',
                fontSize: isMobile ? '0.9rem' : '1rem',
                padding: isMobile ? '16px 8px' : '8px'
              }}>
                לא הוספו פריטים עדיין
              </p>
            ) : (
              newOrder.items.map((itm, i) => {
                const unitPrice = getRecipeSellingPrice(itm.item);
                const itemTotal = itm.qty * unitPrice;
                return (
                  <div key={i} style={styles.itemRow}>
                    <div style={styles.itemContent}>
                      {itm.item} - כמות: {itm.qty}<br />
                      <small>(₪{unitPrice} × {itm.qty} = ₪{itemTotal})</small>
                    </div>
                    <div
                      style={styles.removeBtn}
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
        </section>
      </div>

      {/* Orders Table */}
      <Table
        title={`טבלת הזמנות (${orders.length})`}
        sortable={!isMobile}
        headers={tableHeaders}
        data={orders}
      />

    </Container>
  );
}
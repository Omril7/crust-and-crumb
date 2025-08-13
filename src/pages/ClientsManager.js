import React, { useState } from 'react';
import { UserPlus, Phone, MapPin, Calendar, FileUp, Edit2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select, Table } from '../components/components';

export default function ClientsManager({ clients, setClients }) {
  const { theme } = useTheme();

  const [form, setForm] = useState({ name: '', phone: '', pickup: '', date: '', notes: '' });

  const pickupOptions = ['גדרה', 'הנשיא הראשון 40', 'רחובות', 'תל אביב', 'כפר ורדים'];

  const isAddDisabled = !(form.name && form.phone && form.pickup && form.date);

  const handleAddClient = () => {
    if (form.name && form.phone && form.pickup && form.date) {
      setClients([...clients, form]);
      setForm({ name: '', phone: '', pickup: '', date: '', notes: '' });
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').slice(1);
      const newClients = rows.map(row => {
        const [name, phone, pickup, date, notes] = row.split(',');
        return { name, phone, pickup, date, notes };
      }).filter(c => c.name);
      setClients([...clients, ...newClients]);
    };
    reader.readAsText(file);
  };

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
      <Header title={"ניהול לקוחות"} icon={<UserPlus size={32} />} />
      <div style={styles.gridContainer}>
        {/* Right side: Add New Client Section */}
        <section style={styles.section} aria-label="הוספת לקוח ידנית">
          <h3 style={styles.sectionHeader}>
            <Edit2 size={20} />
            הוספת לקוח ידנית
          </h3>
          <div style={styles.formRow}>
            <Input
              label="שם הלקוח"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              icon={<UserPlus size={18} />}
              style={{ width: '100%' }}
            />
            <Input
              label="טלפון"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              icon={<Phone size={18} />}
              style={{ width: '100%' }}
            />
            <Select
              label="מיקום איסוף"
              value={form.pickup}
              onChange={(e) => setForm({ ...form, pickup: e.target.value })}
              options={pickupOptions}
              icon={<MapPin size={18} />}
              style={{ width: '100%' }}
            />
            <Input
              label="תאריך הצטרפות"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              icon={<Calendar size={18} />}
              style={{ width: '100%' }}
            />
            <Input
              label="הערות"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              icon={<Edit2 size={18} />}
              style={{ width: '100%' }}
            />
            <Button
              title={isAddDisabled ? 'נא למלא את כל השדות הדרושים' : 'הוסף לקוח'}
              onClick={handleAddClient}
              disabled={isAddDisabled}
            />
          </div>
        </section>

        {/* Left side: CSV Upload Section */}
        <section style={styles.section} aria-label="העלאת קובץ CSV">
          <h3 style={styles.sectionHeader}>
            <FileUp size={20} />
            העלאת קובץ CSV
          </h3>
          <div style={styles.fileInputWrapper}>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              style={styles.fileInput}
              aria-label="העלאת קובץ CSV"
            />
            <small style={{ color: theme.textSecondary || '#666' }}>
              העלה קובץ CSV עם עמודות: שם, טלפון, מיקום איסוף, תאריך, הערות
            </small>
          </div>
        </section>
      </div>

      {/* Clients Table */}
      <Table
        title="טבלת לקוחות"
        headers={[
          { key: 'name', label: 'שם לקוח' },
          { key: 'phone', label: 'טלפון' },
          { key: 'pickup', label: 'מיקום איסוף' },
          { key: 'date', label: 'תאריך הצטרפות' },
          { key: 'notes', label: 'הערות' }
        ]}
        data={clients}
      />
    </Container >
  );
}

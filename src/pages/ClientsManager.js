import React, { useState } from 'react';
import { UserPlus, Phone, MapPin, Calendar, FileUp, Edit2, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';
import { useIndexedDB } from '../hooks/useIndexedDB';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select, Table } from '../components/components';
import { formatPhone } from '../utils/helper';
import { useConfirm } from '../contexts/ConfirmContext';

export default function ClientsManager() {
  const { theme } = useTheme();
  const { isMobile, isTablet, isDesktop } = useScreenSize();
  const { confirm } = useConfirm();
  const [clients, setClients] = useIndexedDB("clients", []);

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
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return {
          name: name?.trim(),
          phone: formatPhone(phone?.trim() || ''),
          pickup: pickup?.trim(),
          date: date?.trim() || today,
          notes: notes?.trim() || ''
        };
      }).filter(c => c.name);
      setClients([...clients, ...newClients]);
    };
    reader.readAsText(file);
  };

  const handleClientChange = (index, key, value) => {
    const updatedClients = [...clients];
    updatedClients[index][key] = value;
    setClients(updatedClients);
  };

  const handleRemoveClient = async (index) => {
    const ok = await confirm('האם אתה בטוח שברצונך למחוק לקוח זה?');
    if (!ok) return;
    const updatedClients = clients.filter((_, i) => i !== index);
    setClients(updatedClients);
  };

  // Mobile-optimized table headers
  const tableHeaders = isMobile ? [
    {
      key: 'summary',
      label: 'לקוח',
      render: (_, client) => (
        <div style={{ textAlign: 'right', fontSize: '0.75rem', lineHeight: '1.3' }}>
          <div><strong>שם:</strong> {client.name}</div>
          <div><strong>טלפון:</strong> {client.phone}</div>
          <div><strong>מיקום איסוף:</strong> {client.pickup}</div>
          <div><strong>תאריך הצטרפות:</strong> {client.date}</div>
          {client.notes && <div><strong>הערות:</strong> {client.notes}</div>}
        </div>
      ),
      sortable: false
    },
    {
      key: 'remove',
      label: 'מחק',
      render: (_, client, index) => (
        <div
          style={{
            cursor: 'pointer',
            color: 'red',
            padding: '8px',
            display: 'flex',
            justifyContent: 'center'
          }}
          onClick={() => handleRemoveClient(index)}
          title="הסר לקוח"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleRemoveClient(index)}
        >
          <Trash2 size={18} />
        </div>
      ),
      sortable: false
    }
  ] : [
    {
      key: 'name',
      label: 'שם לקוח',
      render: (value, _, index) => (
        <Input
          value={value}
          onChange={(e) => handleClientChange(index, 'name', e.target.value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      key: 'phone',
      label: 'טלפון',
      render: (value, _, index) => (
        <Input
          value={value}
          onChange={(e) => handleClientChange(index, 'phone', formatPhone(e.target.value))}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      key: 'pickup',
      label: 'מיקום איסוף',
      render: (value, _, index) => (
        <Select
          value={value}
          options={pickupOptions}
          onChange={(e) => handleClientChange(index, 'pickup', e.target.value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      key: 'date',
      label: 'תאריך הצטרפות',
      render: (value, _, index) => (
        <Input
          type="date"
          value={value}
          onChange={(e) => handleClientChange(index, 'date', e.target.value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      key: 'notes',
      label: 'הערות',
      render: (value, _, index) => (
        <Input
          value={value}
          onChange={(e) => handleClientChange(index, 'notes', e.target.value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      key: 'remove',
      label: '',
      render: (_, client, index) => (
        <div
          style={{
            cursor: 'pointer',
            color: 'red',
            padding: '8px',
            display: 'flex',
            justifyContent: 'center'
          }}
          onClick={() => handleRemoveClient(index)}
          title="הסר לקוח"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleRemoveClient(index)}
        >
          <Trash2 size={18} />
        </div>
      ),
      sortable: false
    }
  ];

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
      width: '100%',
      boxSizing: 'border-box',
      // Make it look more like a button on mobile
      ...(isMobile && {
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      })
    },
    fileInputWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: isMobile ? 8 : 10,
      justifyContent: 'center',
      width: '100%',
    },
    helpText: {
      color: theme.textSecondary || '#666',
      fontSize: isMobile ? '0.8rem' : '0.85rem',
      textAlign: 'center',
      lineHeight: '1.3',
      marginTop: isMobile ? '5px' : '0',
    },
    // Mobile-specific input styling
    inputGroup: {
      width: '100%',
      marginBottom: isMobile ? '8px' : '0',
    },
    // Table wrapper for horizontal scrolling on mobile
    tableWrapper: {
      marginTop: isMobile ? '20px' : '25px',
      // Add horizontal scroll for table on mobile
      ...(isMobile && {
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      })
    },
  };

  return (
    <Container>
      <Header title={"ניהול לקוחות"} icon={<UserPlus size={isMobile ? 28 : 32} />} />

      <div style={styles.gridContainer}>
        {/* Manual Add Section */}
        <section
          style={{ ...styles.section, ...styles.manualSection }}
          aria-label="הוספת לקוח ידנית"
        >
          <h3 style={styles.sectionHeader}>
            <Edit2 size={isMobile ? 18 : 20} />
            הוספת לקוח ידנית
          </h3>
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <Input
                label="שם הלקוח"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                icon={<UserPlus size={18} />}
                style={{ width: '100%' }}
              />
            </div>
            <div style={styles.inputGroup}>
              <Input
                label="טלפון"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                icon={<Phone size={18} />}
                style={{ width: '100%' }}
                type={isMobile ? 'tel' : 'text'}
              />

            </div>
            <div style={styles.inputGroup}>
              <Select
                label="מיקום איסוף"
                value={form.pickup}
                onChange={(e) => setForm({ ...form, pickup: e.target.value })}
                options={pickupOptions}
                icon={<MapPin size={18} />}
                style={{ width: '100%' }}
              />
            </div>
            <div style={styles.inputGroup}>
              <Input
                label="תאריך הצטרפות"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                icon={<Calendar size={18} />}
                style={{ width: '100%' }}
              />
            </div>
            <div style={styles.inputGroup}>
              <Input
                label="הערות"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                icon={<Edit2 size={18} />}
                style={{ width: '100%' }}
              />
            </div>
            <Button
              title={isAddDisabled ? 'נא למלא את כל השדות הדרושים' : 'הוסף לקוח'}
              onClick={handleAddClient}
              disabled={isAddDisabled}
              style={{
                width: isMobile ? '100%' : 'auto',
                marginTop: isMobile ? '8px' : '0'
              }}
            />
          </div>
        </section>

        {/* CSV Upload Section */}
        {!isMobile && (
          <section
            style={{ ...styles.section, ...styles.csvSection }}
            aria-label="העלאת קובץ CSV"
          >
            <h3 style={styles.sectionHeader}>
              <FileUp size={isMobile ? 18 : 20} />
              העלאת קובץ CSV
            </h3>
            <div style={styles.fileInputWrapper}>
              <label style={styles.fileInput}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  aria-label="העלאת קובץ CSV"
                />
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: isMobile ? '4px' : '6px'
                }}>
                  <FileUp size={isMobile ? 20 : 24} />
                  <span>{isMobile ? 'בחר קובץ CSV' : 'לחץ או גרור קובץ CSV כאן'}</span>
                </div>
              </label>
              <small style={styles.helpText}>
                {isMobile
                  ? 'עמודות: שם, טלפון, מיקום, תאריך, הערות'
                  : 'העלה קובץ CSV עם עמודות: שם, טלפון, מיקום איסוף, תאריך, הערות'
                }
              </small>
            </div>
          </section>
        )}
      </div>

      {/* Clients Table */}
      <div style={styles.tableWrapper}>
        <Table
          title={`טבלת לקוחות (${clients.length})`}
          sortable={!isMobile}
          headers={tableHeaders}
          data={clients}
        />
      </div>
    </Container>
  );
}
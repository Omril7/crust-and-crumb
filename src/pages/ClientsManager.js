import React, { useState } from 'react';
import { UserPlus, Phone, MapPin, Calendar, FileUp, Edit2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select, Table } from '../components/components';

export default function ClientsManager({ clients, setClients }) {
  const { theme } = useTheme();
  const { isMobile, isTablet, isDesktop } = useScreenSize();

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
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                icon={<Phone size={18} />}
                style={{ width: '100%' }}
                type={isMobile ? 'tel' : 'text'} // Use tel input on mobile
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
                    width: '100%',
                    height: '100%',
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
          sortable={!isMobile} // Disable sorting on mobile for simplicity
          headers={[
            { key: 'name', label: 'שם לקוח' },
            {
              key: 'phone',
              label: isMobile ? 'טלפון' : 'טלפון',
              sortable: false,
              // Make phone numbers clickable on mobile
              render: isMobile ? (value) => (
                <a href={`tel:${value}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {value}
                </a>
              ) : undefined
            },
            { key: 'pickup', label: isMobile ? 'איסוף' : 'מיקום איסוף' },
            { key: 'date', label: 'תאריך' },
            {
              key: 'notes',
              label: 'הערות',
              sortable: false,
              // Truncate notes on mobile
              render: isMobile ? (value) => (
                value && value.length > 20 ? `${value.substring(0, 20)}...` : value
              ) : undefined
            }
          ]}
          data={clients}
        />
      </div>
    </Container>
  );
}
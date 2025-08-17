import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Croissant, Hash, PlusSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select } from '../components/components';

export default function BakePlanningManager({ events, setEvents, recipes }) {
  const { theme } = useTheme();
  const { isMobile, isTablet, width } = useScreenSize();

  const [selectedDate, setSelectedDate] = useState(null);
  const [newEntry, setNewEntry] = useState({ recipe: '', qty: 1 });

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth(year, month);

  const openModal = (date) => {
    setSelectedDate(formatDate(date));
    setNewEntry({ recipe: '', qty: 1 });
  };

  const closeModal = () => setSelectedDate(null);

  const addEvent = () => {
    if (!newEntry.recipe || newEntry.qty <= 0) return;
    const dayEvents = events[selectedDate] ? [...events[selectedDate]] : [];
    dayEvents.push({ recipe: newEntry.recipe, qty: Number(newEntry.qty) });
    setEvents({ ...events, [selectedDate]: dayEvents });
    setNewEntry({ recipe: '', qty: 1 });
  };

  const removeEvent = (index) => {
    const dayEvents = [...(events[selectedDate] || [])];
    dayEvents.splice(index, 1);
    if (dayEvents.length === 0) {
      const newEvents = { ...events };
      delete newEvents[selectedDate];
      setEvents(newEvents);
    } else {
      setEvents({ ...events, [selectedDate]: dayEvents });
    }
  };

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  // Use theme colors from context, with fallbacks
  const primary = theme.colors.textLight;
  const primaryGradient = theme.colors.primaryGradient || 'linear-gradient(90deg, #4CAF50, #2E7D32)';
  const textPrimary = theme?.textPrimary || '#333';
  const textSecondary = theme?.textSecondary || '#666';
  const background = theme?.background || '#fff';
  const boxShadow = theme?.boxShadow || '0 2px 6px rgba(0,0,0,0.15)';

  const styles = {
    monthNav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isMobile ? 10 : 15,
      padding: isMobile ? '0 5px' : '0'
    },
    navBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '8px 12px' : '6px 10px',
      borderRadius: '8px',
      border: 'none',
      background: primaryGradient,
      color: 'white',
      cursor: 'pointer',
      transition: 'background 0.2s',
      boxShadow,
      fontSize: isMobile ? '16px' : '14px'
    },
    monthLabel: {
      color: textPrimary,
      fontSize: isMobile ? '1.1rem' : isTablet ? '1.15rem' : '1.2rem',
      fontWeight: 600,
      textAlign: 'center',
      margin: '0 10px'
    },
    weekdays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      textAlign: 'center',
      fontWeight: 'bold',
      borderBottom: `2px solid ${textSecondary}`,
      paddingBottom: isMobile ? 6 : 8,
      color: textSecondary,
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    daysGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: isMobile ? 4 : isTablet ? 6 : 8,
      marginTop: isMobile ? 6 : 8
    },
    dayCell: {
      padding: isMobile ? 6 : isTablet ? 8 : 10,
      borderRadius: isMobile ? 6 : 8,
      cursor: 'pointer',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      border: `1px solid ${textSecondary}`,
      minHeight: isMobile ? 45 : isTablet ? 55 : 60,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      backgroundColor: background,
    },
    dayHasEvents: {
      backgroundColor: '#f5e1c0'
    },
    dayToday: {
      border: `2px solid ${primary}`
    },
    dayNumber: {
      fontWeight: 'bold',
      color: textPrimary,
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    modalBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: isMobile ? 'flex-start' : 'center',
      zIndex: 9999,
      padding: isMobile ? '20px 10px' : '20px',
      overflowY: 'auto'
    },
    modal: {
      backgroundColor: background,
      padding: isMobile ? 16 : isTablet ? 18 : 20,
      borderRadius: isMobile ? 8 : 12,
      boxShadow,
      maxWidth: isMobile ? '100%' : isTablet ? 380 : 420,
      width: isMobile ? '100%' : '90%',
      maxHeight: isMobile ? '90vh' : '80%',
      overflowY: 'auto',
      marginTop: isMobile ? '10px' : '0'
    },
    label: {
      display: 'block',
      marginBottom: 5,
      fontWeight: 'bold',
      color: textSecondary,
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    input: {
      width: '100%',
      padding: isMobile ? '10px' : '8px',
      borderRadius: '6px',
      border: `1px solid ${textSecondary}`,
      backgroundColor: background,
      color: textPrimary,
      fontSize: isMobile ? '16px' : '14px' // 16px prevents zoom on mobile
    },
    primaryBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: primaryGradient,
      color: 'white',
      padding: isMobile ? '12px 16px' : '8px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      boxShadow,
      fontSize: isMobile ? '16px' : '14px',
      width: isMobile ? '100%' : 'auto',
      justifyContent: isMobile ? 'center' : 'flex-start'
    },
    secondaryBtn: {
      marginTop: 10,
      backgroundColor: '#2196F3',
      color: 'white',
      padding: isMobile ? '12px 16px' : '8px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      boxShadow,
      width: isMobile ? '100%' : 'auto',
      fontSize: isMobile ? '16px' : '14px'
    },
    removeBtn: {
      marginLeft: 10,
      color: 'red',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '8px' : '4px',
      borderRadius: '4px'
    },
    eventList: {
      paddingInlineStart: isMobile ? 15 : 20,
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    noEvents: {
      color: textSecondary,
      fontSize: isMobile ? '0.9rem' : '1rem',
      textAlign: 'center',
      padding: '10px'
    },
    eventItem: {
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: isMobile ? '5px' : '0'
    },
    eventText: {
      flex: 1,
      fontSize: isMobile ? '0.9rem' : '1rem',
      wordBreak: isMobile ? 'break-word' : 'normal'
    }
  };

  return (
    <Container>
      <Header
        title={"תכנון אפייה"}
        icon={<Calendar size={isMobile ? 28 : 32} />}
      />

      <div style={styles.monthNav}>
        <button
          style={styles.navBtn}
          onClick={prevMonth}
          aria-label="חודש הקודם"
          title="חודש הקודם"
        >
          <ChevronRight size={isMobile ? 20 : 18} />
        </button>

        <h3 style={styles.monthLabel}>
          {new Date(year, month).toLocaleString('he-IL', {
            month: 'long',
            year: 'numeric'
          })}
        </h3>

        <button
          style={styles.navBtn}
          onClick={nextMonth}
          aria-label="חודש הבא"
          title="חודש הבא"
        >
          <ChevronLeft size={isMobile ? 20 : 18} />
        </button>
      </div>

      <div style={styles.weekdays}>
        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div style={styles.daysGrid}>
        {Array(days[0].getDay()).fill(null).map((_, i) => (
          <div key={'empty-' + i} />
        ))}
        {days.map((day) => {
          const dayStr = formatDate(day);
          const hasEvents = events[dayStr]?.length > 0;
          const isToday = dayStr === formatDate(today);

          return (
            <div
              key={dayStr}
              onClick={() => openModal(day)}
              style={{
                ...styles.dayCell,
                ...(isToday ? styles.dayToday : {}),
                ...(hasEvents ? styles.dayHasEvents : {})
              }}
              onMouseEnter={(e) => !isMobile && (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => !isMobile && (e.currentTarget.style.transform = 'scale(1)')}
              title={hasEvents ? `יש אירועים בתאריך זה` : 'אין אירועים'}
            >
              {/* Day number */}
              <div style={styles.dayNumber}>{day.getDate()}</div>

              {/* Events list for this day */}
              {hasEvents && !isMobile && (
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '4px 0 0 0',
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  textAlign: 'center',
                  color: textSecondary,
                  width: '100%'
                }}>
                  {events[dayStr].map((ev, idx) => (
                    <li key={idx} style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: isMobile ? '1.2' : '1.3'
                    }}>
                      {ev.recipe} ({ev.qty})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div style={styles.modalBackdrop} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{
              marginBottom: 10,
              color: primary,
              fontSize: isMobile ? '1.2rem' : '1.3rem',
              textAlign: 'center'
            }}>
              {selectedDate}
            </h3>

            <div style={{ marginBottom: 15 }}>
              <Select
                label="בחר מתכון"
                value={newEntry.recipe}
                onChange={e => setNewEntry({ ...newEntry, recipe: e.target.value })}
                options={recipes.map(recipe => recipe.name)}
                icon={<Croissant size={isMobile ? 20 : 18} />}
                style={{
                  width: '100%',
                  fontSize: isMobile ? '16px' : '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <Input
                label="כמות"
                type="number"
                min={1}
                value={newEntry.qty}
                onChange={e => setNewEntry({ ...newEntry, qty: Number(e.target.value) })}
                icon={<Hash size={isMobile ? 20 : 18} />}
                style={{
                  fontSize: isMobile ? '16px' : '14px'
                }}
              />
            </div>

            <Button
              title="הוסף"
              onClick={addEvent}
              icon={<PlusSquare size={isMobile ? 20 : 18} color={theme.buttonText || '#fff'} />}
              disabled={!newEntry.recipe || newEntry.qty <= 0}
              style={styles.primaryBtn}
            />

            <h4 style={{
              marginTop: 20,
              marginBottom: 10,
              color: textPrimary,
              fontSize: isMobile ? '1.1rem' : '1.2rem'
            }}>
              אירועים לתאריך זה
            </h4>

            {events[selectedDate]?.length > 0 ? (
              <ul style={styles.eventList}>
                {events[selectedDate].map((ev, idx) => (
                  <li key={idx} style={styles.eventItem}>
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeEvent(idx)}
                      title="מחק אירוע"
                    >
                      <X size={isMobile ? 18 : 16} />
                    </button>
                    <span style={styles.eventText}>
                      {ev.recipe} - כמות: {ev.qty}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.noEvents}>אין אירועים לתאריך זה</p>
            )}

            <button style={styles.secondaryBtn} onClick={closeModal}>
              סגור
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}
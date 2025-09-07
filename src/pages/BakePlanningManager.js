import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar, Croissant, Hash, PlusSquare, TreePalm } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';
import { useIndexedDB } from '../hooks/useIndexedDB';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select } from '../components/components';
import { supabase } from '../supabaseClient';
import LinearLoader from '../components/LinearLoader';

export default function BakePlanningManager({ user }) {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useScreenSize();

  const [events, setEvents] = useState({}); // { "2025-09-07": [ { recipe: 'Cake', qty: 3 } ] }
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // ================= Fetch Recipes =================
  useEffect(() => {
    const fetchRecipes = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, name');

      if (error) console.error(error);
      else setRecipes(data || []);
    };

    fetchRecipes();
  }, []);

  // ================= Fetch Events + Recipes per Month =================
  useEffect(() => {
    const fetchHolidays = async (year, month) => {
      try {
        const res = await fetch(
          `https://www.hebcal.com/hebcal?v=1&cfg=json&year=${year}&month=${month + 1}&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&c=on&geo=none&lg=he`
        );
        const data = await res.json();

        return data.items
          .filter(item => item.category === "holiday" || item.category === "candles")
          .filter(item => item.subcat === 'major' || item.subcat === 'fast')
          .map(item => ({
            date: item.date.split("T")[0],
            name: item.hebrew,
          }));
      } catch (err) {
        console.error("Holiday fetch error:", err);
        return [];
      }
    };

    const fetchEvents = async () => {
      setLoading(true);

      const startDate = formatDate(new Date(year, month, 1));
      const endDate = formatDate(new Date(year, month + 1, 0));

      // --- fetch baking events ---
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
        id,
        event_date,
        event_recipes (
          id,
          qty,
          recipe_id,
          recipes ( name )
        )
      `)
        .gte('event_date', startDate)
        .lte('event_date', endDate);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const grouped = {};
      eventsData.forEach(ev => {
        const day = ev.event_date;
        grouped[day] = ev.event_recipes.map(er => ({
          id: er.id,
          recipeId: er.recipe_id,
          recipe: er.recipes?.name || 'מתכון לא ידוע',
          qty: er.qty,
          eventId: ev.id,
          isHoliday: false
        }));
      });

      // --- fetch holidays for this month ---
      const holidays = await fetchHolidays(year, month);
      holidays.forEach(h => {
        grouped[h.date] = [
          ...(grouped[h.date] || []),
          { recipe: h.name, qty: "", isHoliday: true }
        ];
      });

      setEvents(grouped);
      setLoading(false);
    };

    fetchEvents();
  }, [year, month]);

  const openModal = (date) => {
    setSelectedDate(formatDate(date));
    setNewEntry({ recipe: '', qty: 1 });
  };

  const closeModal = () => setSelectedDate(null);

  const addEvent = async () => {
    if (!newEntry.recipe || newEntry.qty <= 0) return;

    // check if event exists for this date
    let eventId;
    const { data: existingEvent, error: evErr } = await supabase
      .from('events')
      .select('id')
      .eq('event_date', selectedDate)
      .maybeSingle();

    if (evErr) {
      console.error(evErr);
      return;
    }

    if (existingEvent) {
      eventId = existingEvent.id;
    } else {
      const { data: newEvent, error: newErr } = await supabase
        .from('events')
        .insert([{ event_date: selectedDate, user_id: user.id }])
        .select()
        .single();

      if (newErr) {
        console.error(newErr);
        return;
      }
      eventId = newEvent.id;
    }

    // insert event_recipe
    const selectedRecipe = recipes.find(r => r.name === newEntry.recipe);

    const { error: erErr } = await supabase
      .from('event_recipes')
      .insert([{ event_id: eventId, recipe_id: selectedRecipe.id, qty: newEntry.qty }]);

    if (erErr) console.error(erErr);

    // refetch events
    const fetchEventsAgain = async () => {
      const { data } = await supabase
        .from('events')
        .select(`
      id,
      event_date,
      event_recipes (
        id,
        qty,
        recipe_id,
        recipes ( name )
      )
    `)
        .eq('event_date', selectedDate);

      if (data) {
        // baking events from Supabase
        const bakingEvents = data[0]?.event_recipes.map(er => ({
          id: er.id,
          recipeId: er.recipe_id,
          recipe: er.recipes?.name,
          qty: er.qty,
          eventId: data[0].id,
          isHoliday: false, // ensure explicit
        })) || [];

        // keep existing holiday events for this day
        const existingHolidayEvents = (events[selectedDate] || []).filter(ev => ev.isHoliday);

        setEvents({
          ...events,
          [selectedDate]: sortEvents([...existingHolidayEvents, ...bakingEvents]),
        });

      }
    };

    fetchEventsAgain();
  };

  const removeEvent = async (eventRecipeId) => {
    const { error } = await supabase
      .from('event_recipes')
      .delete()
      .eq('id', eventRecipeId);

    if (error) console.error(error);

    // update local state
    const newEvents = { ...events };
    newEvents[selectedDate] = newEvents[selectedDate].filter(ev => ev.id !== eventRecipeId);
    if (newEvents[selectedDate].length === 0) {
      delete newEvents[selectedDate];
    }
    setEvents(newEvents);
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

  const sortEvents = (arr) =>
    [...arr].sort((a, b) => {
      if (a.isHoliday && !b.isHoliday) return -1;
      if (!a.isHoliday && b.isHoliday) return 1;
      return 0; // keep relative order otherwise
    });

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
      background: theme.colors.primaryGradient,
      color: 'white',
      cursor: 'pointer',
      transition: 'background 0.2s',
      boxShadow: theme.shadows.activeButton,
      fontSize: isMobile ? '16px' : '14px'
    },
    monthLabel: {
      color: theme.colors.textPrimary,
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
      borderBottom: `2px solid ${theme.colors.textSecondary}`,
      paddingBottom: isMobile ? 6 : 8,
      color: theme.colors.textSecondary,
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
      border: `1px solid ${theme.colors.textSecondary}`,
      minHeight: isMobile ? 45 : isTablet ? 55 : 60,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      backgroundColor: 'white',
    },
    dayHasEvents: {
      background: theme.colors.primaryGradient
    },
    dayToday: {
      border: `2px solid ${theme.colors.textLight}`
    },
    dayNumber: {
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
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
      backgroundColor: 'white',
      padding: isMobile ? 16 : isTablet ? 18 : 20,
      borderRadius: isMobile ? 8 : 12,
      boxShadow: theme.shadows.activeButton,
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
      color: theme.colors.textSecondary,
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    input: {
      width: '100%',
      padding: isMobile ? '10px' : '8px',
      borderRadius: '6px',
      border: `1px solid ${theme.colors.textSecondary}`,
      backgroundColor: 'white',
      color: theme.colors.textPrimary,
      fontSize: isMobile ? '16px' : '14px' // 16px prevents zoom on mobile
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
      color: theme.colors.textSecondary,
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
    },
    dayHolidayOnly: {
      background: `linear-gradient(135deg, ${theme.accent.info}66, ${theme.accent.info}33)`,
      border: `1px solid ${theme.accent.info}`,
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

      {loading ? (
        <LinearLoader />
      ) : (
        <div style={styles.daysGrid}>
          {Array(days[0].getDay()).fill(null).map((_, i) => (
            <div key={'empty-' + i} />
          ))}
          {days.map((day) => {
            const dayStr = formatDate(day);
            const eventsForDay = events[dayStr] || [];
            const hasEvents = eventsForDay.length > 0;
            const isToday = dayStr === formatDate(today);

            const hasHoliday = eventsForDay.some(ev => ev.isHoliday);
            const hasBaking = eventsForDay.some(ev => !ev.isHoliday);
            const isHolidayOnly = hasHoliday && !hasBaking;

            return (
              <div
                key={dayStr}
                onClick={() => openModal(day)}
                style={{
                  ...styles.dayCell,
                  ...(isToday ? styles.dayToday : {}),
                  ...(isHolidayOnly
                    ? styles.dayHolidayOnly
                    : hasEvents
                      ? styles.dayHasEvents
                      : {})
                }}
                onMouseEnter={(e) => !isMobile && (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => !isMobile && (e.currentTarget.style.transform = 'scale(1)')}
                title={hasEvents ? `יש אירועים בתאריך זה` : 'אין אירועים'}
              >
                <div style={styles.dayNumber}>{day.getDate()}</div>

                {/* Events list */}
                {hasEvents && !isMobile && (
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '4px 0 0 0',
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    {eventsForDay.map((ev, idx) => (
                      <li
                        key={idx}
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: isMobile ? '1.2' : '1.3'
                        }}
                      >
                        {!ev.isHoliday && `${ev.recipe}${ev.qty ? ` (${ev.qty})` : ''}`}

                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

        </div>
      )}

      {selectedDate && (
        <div style={styles.modalBackdrop} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{
              marginBottom: 10,
              color: theme.colors.textLight,
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
            />

            <h4 style={{
              marginTop: 20,
              marginBottom: 10,
              color: theme.textPrimary,
              fontSize: isMobile ? '1.1rem' : '1.2rem'
            }}>
              אירועים לתאריך זה
            </h4>

            {events[selectedDate]?.length > 0 ? (
              <ul style={styles.eventList}>
                {sortEvents(events[selectedDate]).map((ev, idx) => (
                  <li key={idx} style={styles.eventItem}>
                    {ev.isHoliday ? (
                      <span style={{ ...styles.eventText, color: theme.accent.info, fontWeight: "bold" }}>
                        <TreePalm /> {ev.recipe}
                      </span>
                    ) : (
                      <>
                        <button
                          style={styles.removeBtn}
                          onClick={() => removeEvent(ev.id)}
                          title="מחק אירוע"
                        >
                          <X size={isMobile ? 18 : 16} />
                        </button>
                        <span style={styles.eventText}>
                          {ev.recipe} - כמות: {ev.qty}
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>

            ) : (
              <p style={styles.noEvents}>אין אירועים לתאריך זה</p>
            )}

            <Button
              title="סגור"
              onClick={closeModal}
              isGood={false}
            />
          </div>
        </div>
      )}
    </Container>
  );
}
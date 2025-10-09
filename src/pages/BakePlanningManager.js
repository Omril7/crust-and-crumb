import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar, Croissant, Hash, PlusSquare, TreePalm, NotebookPen, Repeat, Bus, Home, Trophy, CalendarDays, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';
import Container from '../components/Container';
import Header from '../components/Header';
import { Button, Input, Select } from '../components/components';
import { supabase } from '../supabaseClient';
import LinearLoader from '../components/LinearLoader';
import { useAlert } from '../contexts/AlertContext';

const TEAMS = {
  "Maccabi Netanya": "מכבי נתניה",
  "Ironi Tiberias": "עירוני טבריה",
  "H. Jerusalem": "הפועל ירושלים",
  "Bnei Sakhnin": "בני סכנין",
  "H. Petah Tikva": "הפועל פתח תקווה",
  "Hapoel Tel Aviv": "הפועל תל אביב",
  "Kiryat Shmona": "עירוני קריית שמונה",
  "M. Bnei Reineh": "מכבי בני ריינה",
  "B. Jerusalem": "ביתר ירושלים",
  "FC Ashdod": "מ.ס. אשדוד",
  "Hapoel Haifa": "הפועל חיפה",
  "H. Beer Sheva": "הפועל באר שבע",
  "M. Tel Aviv": "מכבי תל אביב",
  "Ligat ha'Al": "ליגת העל"
};

export default function BakePlanningManager({ user }) {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useScreenSize();
  const { alert } = useAlert();

  const [events, setEvents] = useState({}); // { "2025-09-07": [ { recipe: 'Cake', qty: 3 } ] }
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState({});

  const [selectedDate, setSelectedDate] = useState(null);
  const [newEntry, setNewEntry] = useState({ recipe: '', qty: 1, repeatWeekly: false, repeatWeeks: 4 });
  const [notes, setNotes] = useState('');

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

    const fetchGames = async () => {
      try {
        const res = await fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent("https://www.transfermarkt.com/ceapi/nextMatches/team/1064?limit=25"));
        const data = await res.json();

        // assuming your data is in variable `data`
        const matchesByDate = {};

        data.matches.forEach(m => {
          const { match, competition } = m;
          const teams = data.teams;

          // convert timestamp -> YYYY-MM-DD
          const date = new Date(match.time * 1000)
            .toISOString()
            .split('T')[0];

          // detect if Maccabi Haifa is home or away
          const isHome = match.home === 1064;
          const opponentId = isHome ? match.away : match.home;
          const opponent = teams[opponentId];

          // build match object
          matchesByDate[date] = {
            time: new Date(match.time * 1000).toLocaleString("he-IL", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            opponent: opponent.name,
            opponentImage: opponent.image1x,
            competition: competition.label,
            homeOrAway: isHome ? "בית" : "חוץ",
            link: "https://www.transfermarkt.com" + match.link,
          };
        });

        setGames(matchesByDate);
      } catch (err) {
        console.error("Failed to fetch games:", err);
        setGames({});
      };
    };

    fetchGames(year, month);
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
          notes,
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
          isHoliday: false,
          notes: ev.notes || null
        }));
        // If no recipes but event exists, add placeholder
        if (grouped[day].length === 0) {
          grouped[day].push({ recipe: '', qty: 0, eventId: ev.id, isHoliday: false, notes: ev.notes || '' });
        }
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

  // ================= Modal =================
  const openModal = (date) => {
    const dayStr = formatDate(date);
    setSelectedDate(dayStr);

    let dayEvents = events[dayStr] || [];

    // Check if there's a non-holiday event
    let eventForDay = dayEvents.find(ev => !ev.isHoliday);

    // If no recipes (non-holiday events), create placeholder
    if (!eventForDay) {
      const placeholder = { recipe: '', qty: 0, eventId: null, isHoliday: false, notes: '' };
      setEvents(prev => ({
        ...prev,
        [dayStr]: [placeholder, ...dayEvents] // keep holidays if any
      }));
      eventForDay = placeholder;
    }

    setNotes(eventForDay.notes || '');
    setNewEntry({ recipe: '', qty: 1, repeatWeekly: false, repeatWeeks: 4 });
  };

  const closeModal = () => setSelectedDate(null);

  // ================= Add Event with Weekly Repeat =================
  const addEvent = async () => {
    if (!newEntry.recipe || newEntry.qty <= 0) return;

    const selectedRecipe = recipes.find(r => r.name === newEntry.recipe);
    if (!selectedRecipe) return;

    // Calculate dates to add (including original date)
    const datesToAdd = [selectedDate];

    if (newEntry.repeatWeekly) {
      const startDate = new Date(selectedDate);
      const maxWeeks = Math.min(newEntry.repeatWeeks, 52); // Max 1 year

      for (let i = 1; i <= maxWeeks; i++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + (i * 7));
        datesToAdd.push(formatDate(nextDate));
      }
    }

    // Add events for all dates
    for (const dateStr of datesToAdd) {
      let eventId;
      const existingEvent = events[dateStr]?.find(ev => !ev.isHoliday);

      if (existingEvent && existingEvent.eventId) {
        eventId = existingEvent.eventId;
      } else {
        const { data: newEvent, error } = await supabase
          .from('events')
          .insert([{ event_date: dateStr, user_id: user.id }])
          .select()
          .single();

        if (error) {
          console.error(error);
          continue;
        }
        eventId = newEvent.id;
      }

      const { error: erErr } = await supabase
        .from('event_recipes')
        .insert([{ event_id: eventId, recipe_id: selectedRecipe.id, qty: newEntry.qty }]);

      if (erErr) console.error(erErr);
    }

    // Refresh the current month view
    const startDate = formatDate(new Date(year, month, 1));
    const endDate = formatDate(new Date(year, month + 1, 0));

    const { data: refreshedData } = await supabase
      .from('events')
      .select(`
        id,
        event_date,
        notes,
        event_recipes (
          id,
          qty,
          recipe_id,
          recipes ( name )
        )
      `)
      .gte('event_date', startDate)
      .lte('event_date', endDate);

    if (refreshedData) {
      const grouped = {};
      refreshedData.forEach(ev => {
        const day = ev.event_date;
        grouped[day] = ev.event_recipes.map(er => ({
          id: er.id,
          recipeId: er.recipe_id,
          recipe: er.recipes?.name || 'מתכון לא ידוע',
          qty: er.qty,
          eventId: ev.id,
          isHoliday: false,
          notes: ev.notes || null
        }));
      });

      // Preserve holidays
      Object.keys(events).forEach(date => {
        const holidays = events[date].filter(ev => ev.isHoliday);
        if (holidays.length > 0) {
          grouped[date] = [...(grouped[date] || []), ...holidays];
        }
      });

      setEvents(grouped);
    }

    // Reset form
    setNewEntry({ recipe: '', qty: 1, repeatWeekly: false, repeatWeeks: 4 });
  };

  // ================= Remove Event Recipe =================
  const removeEvent = async (eventRecipeId) => {
    const { error } = await supabase
      .from('event_recipes')
      .delete()
      .eq('id', eventRecipeId);
    if (error) console.error(error);

    setEvents(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter(ev => ev.id !== eventRecipeId)
    }));
  };

  const saveNotes = async () => {
    if (!selectedDate || (!notes && !events[selectedDate]?.find(ev => !!ev.notes))) return;

    // Find non-holiday event for this day
    let eventForDay = events[selectedDate]?.find(ev => !ev.isHoliday);

    // === If no event exists yet, create one ===
    if (!eventForDay || !eventForDay.eventId) {
      const { data: newEvent, error: createError } = await supabase
        .from('events')
        .insert([{ event_date: selectedDate, user_id: user.id, notes }])
        .select()
        .single();

      if (createError) {
        console.error("Error creating event for notes:", createError);
        return;
      }

      // Update local state
      setEvents(prev => ({
        ...prev,
        [selectedDate]: [
          { recipe: '', qty: 0, eventId: newEvent.id, isHoliday: false, notes },
          ...(prev[selectedDate] || [])
        ]
      }));

      return;
    }

    // === Otherwise, update existing event ===
    const { error: updateError } = await supabase
      .from('events')
      .update({ notes })
      .eq('id', eventForDay.eventId);

    if (updateError) {
      console.error("Error updating notes:", updateError);
      return;
    }

    // Update notes in state
    setEvents(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].map(ev =>
        ev.isHoliday ? ev : { ...ev, notes }
      )
    }));
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
      background: `linear-gradient(135deg, ${theme.accent.primary}66, ${theme.accent.primary}33)`,
      border: `1px solid ${theme.accent.primary}`,
      borderBottom: `5px solid ${theme.accent.primary}`,
    },
    dayHolidayOnly: {
      border: `1px solid ${theme.accent.info}`,
      borderBottom: `5px solid ${theme.accent.info}`,
    },
    notesOnly: {
      background: `linear-gradient(135deg, ${theme.accent.error}66, ${theme.accent.error}33)`,
      border: `1px solid ${theme.accent.error}`,
      borderBottom: `5px solid ${theme.accent.error}`,
    },
    hasGame: {
      background: `linear-gradient(135deg, ${theme.accent.success}66, ${theme.accent.success}33)`,
      border: `1px solid ${theme.accent.success}`,
      borderBottom: `5px solid ${theme.accent.success}`,
      position: 'relative',
    },
    gameFeature: {
      position: 'absolute',
      top: isMobile ? '5px' : '7px',
      left: isMobile ? '10px' : '5px',
    },
    dayToday: {
      border: `2px solid ${theme.colors.textLight}`,
      boxShadow: '0 4px 12px rgba(139, 105, 20, 0.7)'
    },
    dayNumber: (isToday) => ({
      fontWeight: 'bold',
      color: isToday ? "white" : "black",
      fontSize: isMobile ? '0.9rem' : '1rem',
      background: isToday ? "black" : "none",
      padding: "2px 5px",
      borderRadius: "5px"
    }),
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
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 10,
      marginBottom: 10,
      padding: '8px',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px'
    },
    checkbox: {
      width: isMobile ? 18 : 16,
      height: isMobile ? 18 : 16,
      cursor: 'pointer'
    },
    checkboxLabel: {
      cursor: 'pointer',
      fontSize: isMobile ? '0.95rem' : '0.9rem',
      color: theme.colors.textPrimary,
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  };

  const getGame = (game) => {
    const logoStyle = {
      width: 48,
      height: 48,
      borderRadius: "12px",
      background: "white",
      padding: 6,
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #006633, #00994d)",
          color: "white",
          borderRadius: 12,
          padding: "14px 16px",
          width: 260,
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          fontFamily: "'Assistant', sans-serif",
        }}
      >
        {/* Top section - team logos */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div style={logoStyle}>
            <img
              src={
                game.homeOrAway === "בית"
                  ? "https://tmssl.akamaized.net//images/wappen/homepageWappen70x70/1064.png?lm=1684233681"
                  : game.opponentImage
              }
              alt={game.homeOrAway === "בית" ? "מכבי חיפה" : game.opponent}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          <div
            style={{
              fontWeight: "bold",
              fontSize: 18,
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            VS
          </div>

          <div style={logoStyle}>
            <img
              src={
                game.homeOrAway !== "בית"
                  ? "https://tmssl.akamaized.net//images/wappen/homepageWappen70x70/1064.png?lm=1684233681"
                  : game.opponentImage
              }
              alt={game.homeOrAway !== "בית" ? "מכבי חיפה" : game.opponent}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Match details */}
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {game.homeOrAway === "בית" ? <Home size={18} /> : <Bus size={18} />}
          <span style={{ fontSize: 15 }}>
            {game.homeOrAway === "בית" ? "בבית" : "בחוץ"} נגד{" "}
            {TEAMS[game.opponent] || game.opponent}
          </span>
        </div>

        <div
          style={{
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <CalendarDays size={18} />
          <span style={{ fontSize: 15 }}>{game.time}</span>
        </div>

        <div
          style={{
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Trophy size={18} />
          <span style={{ fontSize: 15 }}>
            {TEAMS[game.competition] || game.competition}
          </span>
        </div>

        {/* Link button */}
        <button
          onClick={() => window.open(game.link, "_blank")}
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "white",
            color: "#006633",
            border: "none",
            borderRadius: 8,
            padding: "6px 12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.background = "#d9ffd9")}
          onMouseOut={(e) => (e.target.style.background = "white")}
        >
          לצפייה במשחק
          <ExternalLink size={16} />
        </button>
      </div>
    );
  };


  return (
    <Container>
      <Header
        title={"תכנון אפייה"}
        icon={<Calendar size={isMobile ? 28 : 32} />}
      />

      {/* Month Navigation */}
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

      {/* Weekdays */}
      <div style={styles.weekdays}>
        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => <div key={day}>{day}</div>)}
      </div>

      {loading ? <LinearLoader /> : (
        <div style={styles.daysGrid}>
          {Array(days[0].getDay()).fill(null).map((_, i) => <div key={'empty-' + i} />)}
          {days.map(day => {
            const dayStr = formatDate(day);
            const eventsForDay = events[dayStr] || [];
            const hasEvents = eventsForDay.filter(ev => !ev.isHoliday && ev.qty > 0).length > 0;
            const isToday = dayStr === formatDate(today);

            const hasHoliday = eventsForDay.some(ev => ev.isHoliday);
            const hasBaking = eventsForDay.some(ev => !ev.isHoliday && ev.qty > 0);
            const hasNotes = eventsForDay.some(ev => !!ev.notes);
            const hasGame = !!games[dayStr];
            const isHolidayOnly = hasHoliday && !hasBaking;

            return (
              <div
                key={dayStr}
                onClick={() => openModal(day)}
                style={{
                  ...styles.dayCell,
                  ...(hasGame ? styles.hasGame : {}),
                  ...(isToday ? styles.dayToday : {}),
                  ...(isHolidayOnly
                    ? styles.dayHolidayOnly
                    : hasEvents
                      ? styles.dayHasEvents
                      : hasNotes
                        ? styles.notesOnly
                        : {}
                  )
                }}
                onMouseEnter={(e) => !isMobile && (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => !isMobile && (e.currentTarget.style.transform = 'scale(1)')}
                title={hasEvents ? `יש אירועים בתאריך זה` : 'אין אירועים'}
              >
                {!isMobile && hasGame && (
                  <div style={styles.gameFeature}>
                    <img
                      src="https://tmssl.akamaized.net//images/wappen/homepageWappen70x70/1064.png?lm=1684233681"
                      style={{ width: 20, height: 20, cursor: "pointer" }}
                      onClick={async () => await alert(getGame(games[dayStr]))}
                    />
                  </div>)}
                <div style={styles.dayNumber(isToday)}>{day.getDate()}</div>

                {/* Events list */}
                {(hasEvents || hasNotes) && !isMobile && (
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '4px 0 0 0',
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    {hasEvents && eventsForDay.map((ev, idx) => (
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
                    {hasNotes && (
                      <li style={{ display: "flex", gap: 5, justifyContent: "center", alignItems: "center" }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', lineHeight: isMobile ? '1.2' : '1.3' }}>צפה בהערה</span>
                        <NotebookPen size={isMobile ? 16 : 14} />
                      </li>
                    )}
                  </ul>
                )}
              </div>
            );
          })}

        </div>
      )}

      {/* Modal */}
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

            <Select
              label="בחר מתכון"
              value={newEntry.recipe}
              onChange={e => setNewEntry({ ...newEntry, recipe: e.target.value })}
              options={recipes.map(recipe => recipe.name)}
              icon={<Croissant size={isMobile ? 20 : 18} />}
              style={{
                width: '100%',
                fontSize: isMobile ? '16px' : '14px',
                marginBottom: 15
              }}
            />

            <Input
              label="כמות"
              type="number"
              min={1}
              value={newEntry.qty}
              onChange={e => setNewEntry({ ...newEntry, qty: Number(e.target.value) })}
              icon={<Hash size={isMobile ? 20 : 18} />}
              style={{
                fontSize: isMobile ? '16px' : '14px',
                marginBottom: 15,
                width: "50%"
              }}
            />

            {/* Weekly Repeat Option */}
            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="repeatWeekly"
                checked={newEntry.repeatWeekly}
                onChange={e => setNewEntry({ ...newEntry, repeatWeekly: e.target.checked })}
                style={styles.checkbox}
              />
              <label htmlFor="repeatWeekly" style={styles.checkboxLabel}>
                <Repeat size={isMobile ? 18 : 16} />
                חזור כל שבוע
              </label>
            </div>

            {/* Number of Weeks to Repeat */}
            {newEntry.repeatWeekly && (
              <Input
                label="מספר שבועות (מקסימום 52)"
                type="number"
                min={1}
                max={52}
                value={newEntry.repeatWeeks}
                onChange={e => setNewEntry({ ...newEntry, repeatWeeks: Math.min(52, Math.max(1, Number(e.target.value))) })}
                icon={<Repeat size={isMobile ? 20 : 18} />}
                style={{
                  fontSize: isMobile ? '16px' : '14px',
                  marginBottom: 15
                }}
              />
            )}

            <Button
              title="הוסף"
              onClick={addEvent}
              icon={<PlusSquare size={isMobile ? 20 : 18} color={theme.buttonText || '#fff'} />}
              disabled={!newEntry.recipe || newEntry.qty <= 0}
            />

            <Input
              label="הערות"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={saveNotes}
              icon={<NotebookPen size={isMobile ? 20 : 18} />}
              rows={2}
              style={{
                width: '100%',
                fontSize: isMobile ? '16px' : '14px',
                marginTop: 15,
                marginBottom: 15
              }}
            />

            <h4 style={{
              marginTop: 20,
              marginBottom: 10,
              color: theme.textPrimary,
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
                        {ev.recipe && (
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
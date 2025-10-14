import React, { useEffect, useState } from 'react';

// Contexts
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// Components
import { Accordion, CircularLoader } from '../components/components';

// Icons
import {
  BookOpen,
  CalendarDays,
  Package,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getWeightText, retry } from '../utils/helper';

const Home = ({ user }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recipesCount, setRecipesCount] = useState(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [tomorrowEvent, setTomorrowEvent] = useState(null);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [openRecipes, setOpenRecipes] = useState({});
  const [checkedItems, setCheckedItems] = useState({});

  // ================= Fetch Stats =================
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);

      try {
        await Promise.allSettled([
          retry(fetchLowInventory),
          retry(fetchRecipesCount),
          retry(fetchUpcomingEvents),
          retry(fetchTomorrowEvent),
        ]);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const fetchLowInventory = async () => {
    const { data: inventory, error: invError } = await supabase.from("inventory").select("*").eq("user_id", user.id);

    if (!invError && inventory) {
      // Count low stock items
      setLowStockCount(inventory.filter(item => item.qty >= 0 && item.qty <= item.lowThreshold).length);
    }
  };

  const fetchRecipesCount = async () => {
    const { count: recipesCount, error: recError } = await supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", user.id);

    if (!recError) {
      setRecipesCount(recipesCount || 0);
    }
  };

  const fetchUpcomingEvents = async () => {
    const today = new Date();
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const { data: events, error: evError } = await supabase
      .from("events")
      .select(`id, event_recipes(id)`)
      .eq("user_id", user.id)
      .gte("event_date", today.toISOString())
      .lt("event_date", firstDayOfNextMonth.toISOString());

    if (!evError && events) {
      const countWithRecipes = events.filter(ev => ev.event_recipes.length > 0).length;
      setUpcomingEventsCount(countWithRecipes);
    }
  };

  const fetchTomorrowEvent = async () => {
    if (!user) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const pad = (n) => String(n).padStart(2, '0');

    const yyyy = tomorrow.getFullYear();
    const mm = pad(tomorrow.getMonth() + 1);
    const dd = pad(tomorrow.getDate());

    const tommorowString = `${yyyy}-${mm}-${dd}`;

    const { data, error } = await supabase
      .from("events")
      .select(`
          id,
          event_date,
          notes,
          event_recipes (
            id,
            qty,
            recipe_id,
            recipes (
              id,
              name,
              sellingprice,
              doughweight,
              recipe_ingredients (
                id,
                bakerspercent,
                inventory (
                  id,
                  ingredient,
                  unit,
                  qty,
                  lowthreshold,
                  price_per_unit
                )
              )
            )
          )
        `)
      .eq("user_id", user.id)
      .eq("event_date", tommorowString)
      .single();

    if (error) {
      console.error("Error fetching tomorrow’s event:", error);
      return;
    }

    if (data) {
      setTomorrowEvent(data);
    } else {
      setTomorrowEvent(null);
    }
  };

  const toggleCheck = (id) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleRecipeAccordion = (id) => {
    setOpenRecipes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleClickAccordion = (e) => {
    e.stopPropagation();
    setAccordionOpen(!accordionOpen);
  };

  const handleClickSubAccordion = (e, er) => {
    e.stopPropagation();
    toggleRecipeAccordion(er.id);
  };

  // ================= Cards =================
  const cards = [
    {
      title: "כמות מתכונים",
      value: recipesCount,
      href: "/recipes",
      Icon: BookOpen
    },
    {
      title: "ימי אפייה בחודש הקרוב",
      value: upcomingEventsCount,
      href: "/bakePlanning",
      Icon: CalendarDays
    },
    {
      title: "מוצרים במלאי נמוך",
      value: lowStockCount,
      href: "/inventory",
      Icon: Package
    }
  ];

  // ================= Styles =================
  const styles = {
    container: {
      direction: 'rtl',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    contentContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '16px'
    },
    pageTitle: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '32px',
      color: theme.colors.textLight,
      textAlign: 'center'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(8px)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(217, 160, 102, 0.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      cursor: "pointer"
    },
    statIcon: {
      width: '48px',
      height: '48px',
      margin: '0 auto 16px',
      color: theme.accent.primary
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: theme.accent.primary,
      marginBottom: '8px'
    },
    statLabel: {
      color: theme.colors.textLight,
      fontSize: '16px'
    },
    recipeItem: {
      marginTop: '12px',
      padding: '12px',
      borderRadius: '8px',
      background: 'rgba(255,255,255,0.7)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    },
    ingredientList: {
      marginTop: '8px',
      fontSize: '14px',
      paddingRight: '12px'
    },
    noEvent: {
      textAlign: 'center',
      color: theme.colors.textLight,
      marginTop: '12px'
    },
    checklistItem: (ingId) => ({
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 0",
      cursor: "pointer",
      transition: "all 0.2s ease",
      borderBottom: "1px solid rgba(0,0,0,0.05)",
      textDecoration: checkedItems[ingId] ? "line-through" : "none",
      color: checkedItems[ingId] ? "rgba(0,0,0,0.4)" : theme.colors.textLight,
    }),
    checklistInput: (ingId) => ({
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      border: "2px solid " + theme.accent.primary,
      accentColor: theme.accent.primary,
      cursor: "pointer",
      appearance: "none",
      display: "grid",
      placeItems: "center",
      backgroundColor: checkedItems[ingId] ? theme.accent.primary : "transparent",
      transition: "all 0.2s ease",
    })
  };

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <div style={styles.contentContainer}>
        <h1 style={styles.pageTitle}>Crust & Crumb</h1>

        {/* Tomorrow's Baking Accordion */}
        {tomorrowEvent && tomorrowEvent?.event_recipes.length > 0 ? (
          <Accordion open={accordionOpen} onClick={handleClickAccordion} title={`אפייה למחר - (${new Date(tomorrowEvent.event_date).toLocaleDateString('he-IL')})`}>
            {tomorrowEvent.notes && <p><strong>הערות:</strong> {tomorrowEvent.notes}</p>}

            {/* 🔹 Nested Accordions for Each Recipe */}
            {tomorrowEvent.event_recipes.map((er) => {
              const totalPercent = er?.recipes?.recipe_ingredients.reduce((sum, ing) => sum + (Number(ing.bakerspercent) || 0), 0);

              return (
                <div key={er.id} style={{ marginTop: "16px" }}>
                  <Accordion open={openRecipes[er.id]} onClick={(e) => handleClickSubAccordion(e, er)} title={`${er.recipes?.name || 'מתכון לא ידוע'} × ${er.qty}`}>
                    <div style={styles.accordionBody}>
                      <strong>מרכיבים:</strong>
                      <ul style={styles.ingredientList}>
                        {er.recipes?.recipe_ingredients?.map((ing) => {
                          const weight = (Number(ing.bakerspercent) / 100) * (er?.recipes?.doughweight / (totalPercent / 100)) * er.qty;

                          return (
                            <li key={ing.id} onClick={(e) => { e.stopPropagation(); toggleCheck(ing.id); }} style={styles.checklistItem(ing.id)}>
                              <input type="checkbox" checked={checkedItems[ing.id] || false} readOnly style={styles.checklistInput(ing.id)} />
                              <span> {ing.inventory?.ingredient} — {getWeightText(weight)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </Accordion>
                </div>
              );
            })}
          </Accordion>
        ) : (
          <Accordion title="אין אפייה מחר" />
        )}

        {/* Stats */}
        <div style={styles.statsGrid}>
          {cards.map((card, index) => (
            <div key={index} style={styles.statCard} onClick={() => navigate(card.href)}>
              <card.Icon style={styles.statIcon} />
              <div style={styles.statNumber}>
                {loading ? <CircularLoader /> : card.value}
              </div>
              <div style={styles.statLabel}>{card.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

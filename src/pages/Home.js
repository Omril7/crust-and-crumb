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
  Package
} from 'lucide-react';
import { formatDate, getWeightText, retry } from '../utils/helper';
import useDailyMarkReset from '../hooks/useDailyMarkReset';

const Home = ({ user }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const resetMarksIfNeeded = useDailyMarkReset(user);

  const [loading, setLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recipesCount, setRecipesCount] = useState(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [tomorrowEvent, setTomorrowEvent] = useState(null);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [openRecipes, setOpenRecipes] = useState({});

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
    await resetMarksIfNeeded();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tommorowString = formatDate(tomorrow);

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
                mark,
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

  const toggleCheck = async (e, er, ing) => {
    e.stopPropagation();

    const newMark = !ing.mark;

    // 1️⃣ Optimistically update the UI
    setTomorrowEvent((prev) => ({
      ...prev,
      event_recipes: prev.event_recipes.map((new_er) =>
        new_er.id !== er.id
          ? new_er
          : {
            ...new_er,
            recipes: {
              ...new_er.recipes,
              recipe_ingredients: new_er.recipes.recipe_ingredients.map((ri) =>
                ri.id === ing.id ? { ...ri, mark: newMark } : ri
              ),
            },
          }
      ),
    }));

    // 2️⃣ Send the update to Supabase in background
    const { error } = await supabase
      .from("recipe_ingredients")
      .update({ mark: newMark })
      .eq("id", ing.id);

    // 3️⃣ If it fails, revert the optimistic update
    if (error) {
      console.error("Error updating mark:", error);

      // Revert back to previous state
      setTomorrowEvent((prev) => ({
        ...prev,
        event_recipes: prev.event_recipes.map((new_er) =>
          new_er.id !== er.id
            ? new_er
            : {
              ...new_er,
              recipes: {
                ...new_er.recipes,
                recipe_ingredients: new_er.recipes.recipe_ingredients.map((ri) =>
                  ri.id === ing.id ? { ...ri, mark: !newMark } : ri
                ),
              },
            }
        ),
      }));
    }
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
      color: theme.colors.textDark,
      textAlign: 'center'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    statCard: {
      background: theme.colors.background,
      backdropFilter: 'blur(8px)',
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${theme.colors.textPrimary}33`,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      cursor: "pointer"
    },
    statIcon: {
      width: '48px',
      height: '48px',
      margin: '0 auto 16px',
      color: theme.colors.textSecondary,
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: '8px'
    },
    statLabel: {
      color: theme.colors.textPrimary,
      fontSize: '16px'
    },
    ingredientList: {
      marginTop: '8px',
      fontSize: '14px',
      paddingRight: '12px'
    },
    checklistItem: (mark) => ({
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 0",
      cursor: "pointer",
      transition: "all 0.2s ease",
      borderBottom: "1px solid rgba(0,0,0,0.05)",
      textDecoration: mark ? "line-through" : "none",
      color: mark ? "rgba(0,0,0,0.4)" : theme.colors.textPrimary,
    }),
    checklistInput: (mark) => ({
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      border: `2px solid ${mark ? theme.colors.textMuted : theme.colors.textPrimary}`,
      accentColor: theme.colors.textPrimary,
      cursor: "pointer",
      appearance: "none",
      display: "grid",
      placeItems: "center",
      backgroundColor: mark ? theme.colors.textPrimary : "transparent",
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
                          const specialId = `${er.id}-${ing.id}`;
                          const weight = (Number(ing.bakerspercent) / 100) * (er?.recipes?.doughweight / (totalPercent / 100)) * er.qty;

                          return (
                            <li key={specialId} onClick={(e) => toggleCheck(e, er, ing)} style={styles.checklistItem(ing.mark)}>
                              <input type="checkbox" checked={ing.mark} readOnly style={styles.checklistInput(ing.mark)} />
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

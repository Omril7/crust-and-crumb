import React, { useEffect, useState } from 'react';

// Contexts
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// Components
import { CircularLoader } from '../components/components';

// Icons
import {
  BookOpen,
  CalendarDays,
  Package
} from 'lucide-react';

const Home = ({ user }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recipesCount, setRecipesCount] = useState(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      setLoading(true);

      // 🔹 Inventory
      const { data: inventory, error: invError } = await supabase.from("inventory").select("*").eq("user_id", user.id);

      if (!invError && inventory) {
        // Count low stock items
        setLowStockCount(inventory.filter(item => item.qty >= 0 && item.qty <= item.lowThreshold).length);

        // Find derived ingredients
        const derivedItems = inventory.filter(item => item.type === "derived");
        if (derivedItems.length > 0) {
          for (const derived of derivedItems) {
            // Get recipe for this derived ingredient
            const { data: recipeRows, error: recipeError } = await supabase
              .from("inventory_recipe")
              .select("*")
              .eq("user_id", user.id)
              .eq("derived_id", derived.id);

            if (!recipeError && recipeRows) {
              for (const r of recipeRows) {
                // Find the base ingredient
                const base = inventory.find(i => i.id === r.ingredient_id);
                if (!base) continue;

                // Optional: recalculate remaining quantity if needed
                // For example, if you want to adjust inventory based on derived qty
                const usedQty = (r.ratio / 100) * derived.qty;
                // Update local state or optionally write back to Supabase
                base.remainingQty = base.qty - usedQty;
              }
            }
          }
        }
      }

      // 🔹 Recipes count
      const { count: recipesCount, error: recError } = await supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", user.id);

      if (!recError) {
        setRecipesCount(recipesCount || 0);
      }

      // 🔹 Events (upcoming this month)
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

      setLoading(false);
    };

    fetchStats();
  }, []);

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

  // Styles
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
    }
  };

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <div style={styles.contentContainer}>
        <h1 style={styles.pageTitle}>Crust & Crumb</h1>

        <div style={styles.statsGrid}>
          {cards.map((card, index) => (
            <div key={index} style={styles.statCard} onClick={() => navigate(card.href)}>
              <div style={styles.statIconWrapper}>
                <card.Icon style={styles.statIcon} />
              </div>
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
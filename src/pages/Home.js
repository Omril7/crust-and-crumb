import React, { useEffect, useState } from 'react';
import { CalendarDays, BookOpen, Package } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../supabaseClient';
import CircularLoader from '../components/CircularLoader';
import { Navigate } from 'react-router-dom';

const Home = ({ user }) => {
  const { theme } = useTheme();

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
        setLowStockCount(inventory.filter((item) => item.qty >= 0 && item.qty <= item.lowthreshold).length);
      }

      // 🔹 Recipes
      const { count: recipesCount, error: recError } = await supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", user.id);

      if (!recError) {
        setRecipesCount(recipesCount || 0);
      }

      // 🔹 Events (upcoming this month)
      const today = new Date();
      const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      const { data: events, error: evError } = await supabase
        .from("events")
        .select(`
          id,
          event_recipes(id)
        `)
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

  // Styles
  const styles = {
    container: {
      direction: 'rtl',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    mainContent: {
      padding: '32px 16px'
    },
    contentContainer: {
      maxWidth: '1280px',
      margin: '0 auto'
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
      textAlign: 'center'
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.contentContainer}>
          <h1 style={styles.pageTitle}>לוח בקרה - Crust & Crumb</h1>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <CalendarDays style={styles.statIcon} />
              </div>
              <div style={styles.statNumber}>
                {loading ? <CircularLoader /> : upcomingEventsCount}
              </div>
              <div style={styles.statLabel}>ימי אפייה בחודש הקרוב</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <BookOpen style={styles.statIcon} />
              </div>
              <div style={styles.statNumber}>
                {loading ? <CircularLoader /> : recipesCount}
              </div>
              <div style={styles.statLabel}>כמות מתכונים</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <Package style={styles.statIcon} />
              </div>
              <div style={styles.statNumber}>
                {loading ? <CircularLoader /> : lowStockCount}
              </div>
              <div style={styles.statLabel}>מוצרים במלאי נמוך</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
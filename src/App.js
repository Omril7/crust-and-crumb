import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import BakePlanningManager from './pages/BakePlanningManager';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import RecipesManager from './pages/RecipesManager';
// import ClientsManager from './pages/ClientsManager';
// import OrdersManager from './pages/OrdersManager';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useSupabaseSession } from './hooks/useSupabaseSession';
import { supabase } from './supabaseClient';

function App() {
  const { session, setSession } = useSupabaseSession();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const processEvents = async () => {
      setUpdating(true);

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      // 1. Fetch all past events with nested data
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          id,
          event_recipes(
            id,
            qty,
            recipe:recipe_id(
              id,
              doughweight,
              recipe_ingredients(
                id,
                bakerspercent,
                ingredient:ingredient_id(
                  id,
                  unit,
                  qty
                )
              )
            )
          )
        `)
        .lt('event_date', todayStr)
        .eq('calculations_done', false);

      if (error) {
        console.error('Error fetching events:', error);
        setUpdating(false);
        return;
      }

      if (!events || events.length === 0) {
        setUpdating(false);
        return;
      }

      // 2. Accumulate all inventory updates across all events
      const inventoryUpdatesMap = {}; // { ingredient_id: totalQtyToDeduct }

      events.forEach(event => {
        event.event_recipes.forEach(er => {
          const recipe = er.recipe;
          if (!recipe) return;

          const ingredients = recipe.recipe_ingredients || [];
          const totalPercent = ingredients.reduce((sum, ri) => sum + ri.bakerspercent, 0);
          const scaleFactor = recipe.doughweight / (totalPercent / 100);

          ingredients.forEach(ri => {
            if (ri.ingredient.qty !== -1000) { // unlimited ingredients
              const weightInGrams = (ri.bakerspercent / 100) * scaleFactor;
              const totalWeightInGrams = weightInGrams * er.qty;

              const ingredient = ri.ingredient;
              let totalWeight = totalWeightInGrams;

              // Convert to inventory unit
              if (ingredient.unit === 'קג') {
                totalWeight = totalWeightInGrams / 1000; // convert grams to kg
              }

              const ingredientId = ingredient.id;
              inventoryUpdatesMap[ingredientId] = (inventoryUpdatesMap[ingredientId] || 0) + totalWeight;
            }
          });

        });
      });

      // 3. Convert inventory updates to array for RPC
      const inventoryUpdatesArray = Object.entries(inventoryUpdatesMap).map(([id, qtyToDeduct]) => ({
        id: parseInt(id),
        qtyToDeduct
      }));

      // 4. Bulk update inventory using RPC
      if (inventoryUpdatesArray.length > 0) {
        const { error: rpcError } = await supabase.rpc('update_inventory_bulk', {
          updates: inventoryUpdatesArray
        });
        if (rpcError) console.error('Error updating inventory via RPC:', rpcError);
      }

      // 5. Mark each event as processed
      for (const event of events) {
        const { error: updateEventError } = await supabase
          .from('events')
          .update({ calculations_done: true })
          .eq('id', event.id);

        if (updateEventError) console.error(`Error marking event ${event.id} done:`, updateEventError);
      }

      setUpdating(false);
    };

    if (!!session) processEvents();
  }, []);

  const styles = {
    updating: {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#14281D',
      color: '#FFFCDC',
      padding: '12px 20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      fontWeight: 'bold',
      fontSize: '16px',
      zIndex: 1000,
      animation: 'fadein 0.3s ease'
    }
  }

  return (
    <div style={{ fontFamily: 'Arial', direction: 'rtl', }}>
      {updating ? (
        <div style={styles.updating}>
          מעדכן מלאי… תחכה שנייה
        </div>
      ) : (
        <Router>
          <Navbar onLogout={() => setSession(null)} />

          <Routes>
            <Route
              path="/"
              element={<ProtectedRoute session={session}><Home user={session?.user} /></ProtectedRoute>}
            />
            <Route
              path="/login"
              element={<Login onLogin={setSession} />}
            />
            <Route
              path="/recipes"
              element={<ProtectedRoute session={session}><RecipesManager user={session?.user} /></ProtectedRoute>}
            />
            <Route
              path="/bakePlanning"
              element={<ProtectedRoute session={session}><BakePlanningManager user={session?.user} /></ProtectedRoute>}
            />
            <Route
              path="/inventory"
              element={<ProtectedRoute session={session}><Inventory user={session?.user} /></ProtectedRoute>}
            />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;

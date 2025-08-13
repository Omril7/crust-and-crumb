import React, { useEffect } from 'react';
import ClientsManager from './pages/ClientsManager';
import RecipesManager from './pages/RecipesManager';
import OrdersManager from './pages/OrdersManager';
import BakePlanningManager from './pages/BakePlanningManager';
import { useLocalStorage } from './hooks/useLocalStorage';
import Navbar from './components/Navbar';
import './App.css';
import { useIndexedDB } from './hooks/useIndexedDB';
import Inventory from './pages/Inventory';

function App() {
  const [recipes, setRecipes] = useIndexedDB("recipes", []);
  const [clients, setClients] = useIndexedDB("clients", []);
  const [orders, setOrders] = useIndexedDB("orders", []);
  const [events, setEvents] = useIndexedDB("bakePlanningEvents", {});
  const [inventory, setInventory] = useIndexedDB("inventory", []);
  const [page, setPage] = useLocalStorage('page', 'recipes');

  return (
    <div style={{ fontFamily: 'Arial', direction: 'rtl' }}>
      <Navbar page={page} setPage={setPage} />

      <main>
        {page === 'recipes' && <RecipesManager recipes={recipes} setRecipes={setRecipes} />}
        {page === 'clients' && <ClientsManager clients={clients} setClients={setClients} />}
        {page === 'orders' && <OrdersManager orders={orders} setOrders={setOrders} clients={clients} recipes={recipes} />}
        {page === 'bakePlanning' && <BakePlanningManager events={events} setEvents={setEvents} recipes={recipes} />}
        {page === 'inventory' && <Inventory inventory={inventory} setInventory={setInventory} />}
      </main>
    </div>
  );
}

export default App;

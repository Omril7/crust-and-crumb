import { useState, useEffect, useCallback } from "react";
import { openDB } from "idb";

const DB_NAME = "myAppDB";
const STORE_NAME = "keyval";
const DB_VERSION = 1;

async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    }
  });
}

export const useIndexedDB = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);

  // Load value from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const db = await initDB();
        const value = await db.get(STORE_NAME, key);
        if (isMounted) {
          setStoredValue(value !== undefined ? value : initialValue);
        }
      } catch (error) {
        console.error(`Error reading IndexedDB key "${key}":`, error);
      }
    })();
    return () => { isMounted = false; };
  }, [key, initialValue]);

  // Setter function
  const setValue = useCallback(async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      const db = await initDB();
      await db.put(STORE_NAME, valueToStore, key);
    } catch (error) {
      console.error(`Error setting IndexedDB key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

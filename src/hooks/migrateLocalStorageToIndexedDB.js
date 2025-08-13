// migrateLocalStorageToIndexedDB.js
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

export async function migrateLocalStorageToIndexedDB(keys) {
  const db = await initDB();

  for (const key of keys) {
    const localValue = window.localStorage.getItem(key);
    if (localValue !== null) {
      try {
        const parsed = JSON.parse(localValue);
        await db.put(STORE_NAME, parsed, key);
        console.log(`✅ Migrated "${key}" to IndexedDB`);
      } catch (err) {
        console.error(`❌ Failed to migrate "${key}":`, err);
      }
    }
  }

  // Optional: clear localStorage after migration
  // keys.forEach((key) => localStorage.removeItem(key));

  console.log("🚀 Migration complete");
}

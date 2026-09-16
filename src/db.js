// src/db.js
import Dexie from 'dexie';
import './services/syncService'; // 👈 Active le service de synchronisation en arrière-plan

export const db = new Dexie('EsolaLocalDB');

db.version(1).stores({
  products: 'id, shop_id, category, name', // Table pour stocker les produits en local
  sales: 'id, shop_id, payment_type, created_at, synced', // Table pour stocker les ventes (avec l'index 'synced' nécessaire)
  offline_queue: '++id, action, table, data, created_at' // File d'attente pour synchroniser quand internet revient
});

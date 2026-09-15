import { supabase } from '../supabase';
import { db } from '../db';

export async function syncOfflineSales() {
  if (!navigator.onLine) return;

  try {
    // Récupérer toutes les ventes locales non synchronisées
    const unsyncedSales = await db.sales.where('synced').equals(0).toArray();
    if (!unsyncedSales || unsyncedSales.length === 0) return;

    for (const sale of unsyncedSales) {
      // Retirer le champ 'synced' avant l'envoi à Supabase
      const { synced, ...supabasePayload } = sale;

      const { error } = await supabase
        .from('sales')
        .insert([supabasePayload]);

      if (!error) {
        // Mettre à jour le statut dans Dexie pour marquer comme synchronisé (synced: 1)
        await db.sales.update(sale.id, { synced: 1 });
      }
    }
    console.log("🔄 Synchronisation des ventes hors-ligne réussie !");
  } catch (err) {
    console.error("Erreur lors de la synchronisation en arrière-plan :", err);
  }
}

// 🚀 Déclenchement automatique et écouteur réseau (sans toucher à App.jsx)
if (typeof window !== 'undefined') {
  // Tenter une synchro dès le chargement si on est en ligne
  syncOfflineSales();

  // Écouter le retour de la connexion internet
  window.addEventListener('online', () => {
    console.log("🌐 Connexion rétablie : Lancement de la synchronisation...");
    syncOfflineSales();
  });
}

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function AdminPanel({ onLogout }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [duration, setDuration] = useState('30');
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchLicenses = async () => {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLicenses(data);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let part1 = '';
    let part2 = '';
    for (let i = 0; i < 4; i++) {
      part1 += chars.charAt(Math.floor(Math.random() * chars.length));
      part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newKey = `ESOLA-${part1}-${part2}`;
    setLicenseKey(newKey);
    setMessage('');
  };

  const handleAddLicense = async (e) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setMessage('Veuillez d’abord générer une clé.');
      return;
    }

    setLoading(true);
    setMessage('');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(duration));

    const { error } = await supabase.from('licenses').insert([
      {
        key: licenseKey.trim(),
        is_active: false, // Corrigé ici : la licence est inactive (disponible) à la création
        shop_name: 'Non assigné',
        expires_at: expiresAt.toISOString(),
      },
    ]);

    setLoading(false);

    if (error) {
      console.error('Erreur insertion Supabase:', error);
      setMessage('Erreur: ' + error.message);
    } else {
      setMessage('Licence ajoutée avec succès !');
      setLicenseKey('');
      fetchLicenses();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* En-tête du panel */}
        <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-emerald-400">
              Panel Admin - ESOLA
            </h1>
            <p className="text-xs text-slate-400">Gestion et génération des licences</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-medium rounded-xl transition-all cursor-pointer"
          >
            Déconnexion
          </button>
        </div>

        {/* Formulaire de génération */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Générer une nouvelle licence
          </h2>

          <form onSubmit={handleAddLicense} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Durée de validité
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="7">1 Semaine (7 jours)</option>
                <option value="30">1 Mois (30 jours)</option>
                <option value="90">3 Mois (90 jours)</option>
                <option value="365">1 An (365 jours)</option>
                <option value="3650">Illimitée (10 ans)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Cliquez sur 'Générer'"
                readOnly
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={generateKey}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                Générer
              </button>
            </div>

            {message && (
              <p className={`text-xs font-medium ${message.includes('succès') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-slate-950 font-bold rounded-xl transition-all text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Ajouter à Supabase'}
            </button>
          </form>
        </div>

        {/* Liste des licences enregistrées */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Licences dans Supabase ({licenses.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">Clé</th>
                  <th className="py-2 px-3">Statut</th>
                  <th className="py-2 px-3">Création</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono">
                {licenses.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-slate-500 font-sans">
                      Aucune licence enregistrée pour le moment.
                    </td>
                  </tr>
                ) : (
                  licenses.map((lic) => (
                    <tr key={lic.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-emerald-400">{lic.key}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans ${lic.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {lic.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] font-sans">
                        {new Date(lic.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

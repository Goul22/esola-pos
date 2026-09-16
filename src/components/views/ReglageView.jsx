import { useState, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';
import { supabase } from '../../supabase';

const CURRENCIES = [
  { symbol: '€', name: 'Euro', code: 'EUR' },
  { symbol: '$', name: 'Américain', code: 'USD' },
  { symbol: 'Fr', name: 'CFA', code: 'FCFA' },
  { symbol: 'FC', name: 'Congolais', code: 'CDF' }, // Ajusté pour plus de clarté
];

export default function ReglageView() {
  const [selectedCurrency, setSelectedCurrency] = useState('CDF');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const getUserEmail = () => localStorage.getItem('user_email');

  // Charger la devise actuelle au démarrage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('shop_currency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // 1. Sauvegarde locale pour un accès immédiat partout
      localStorage.setItem('shop_currency', selectedCurrency);

      // 2. Optionnel : Sauvegarde en base de données (si lié à la boutique active)
      const currentEmail = getUserEmail();
      if (currentEmail) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', currentEmail)
          .single();

        if (userData) {
          await supabase
            .from('shops')
            .update({ currency: selectedCurrency })
            .eq('user_id', userData.id);
        }
      }

      // 3. Déclencher un événement global pour prévenir les autres composants (Stock, Ventes, etc.)
      window.dispatchEvent(new CustomEvent('currencyChange', { detail: selectedCurrency }));

      setSuccessMsg('Paramètres enregistrés avec succès !');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Erreur lors de la sauvegarde : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="text-blue-600" size={20} />
          <h2 className="font-bold text-slate-800 text-base">Paramètres de la Boutique</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">Configuration système et monnaie de référence</p>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-medium border border-emerald-100">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium border border-rose-100">
            {errorMsg}
          </div>
        )}

        <label className="text-xs font-bold text-slate-600 block mb-3">Sélectionner la Devise</label>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {CURRENCIES.map((cur) => {
            const isSelected = selectedCurrency === cur.code;
            return (
              <div
                key={cur.code}
                onClick={() => setSelectedCurrency(cur.code)}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all relative ${
                  isSelected 
                    ? 'border-2 border-blue-600 bg-blue-50/40 shadow-xs' 
                    : 'border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 text-blue-600">
                    <Check size={14} />
                  </span>
                )}
                <span className={`text-lg font-bold ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                  {cur.symbol}
                </span>
                <span className="text-xs font-bold text-slate-800">{cur.name}</span>
                <span className={`text-[10px] font-semibold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                  {cur.code}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer les Paramètres'}
        </button>
      </div>
    </div>
  );
}
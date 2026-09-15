import { useState } from 'react';

export default function LicenseScreen({ onSuccess, onOpenHelp }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = (e) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setError('Veuillez entrer une clé de licence valide.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onSuccess(licenseKey);
    }, 800);
  };

  return (
    <div className="h-screen w-screen bg-white md:bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Conteneur principal plein écran ajusté */}
      <div className="w-full max-w-sm h-full max-h-[600px] bg-white md:rounded-2xl md:shadow-lg md:border md:border-slate-200 flex flex-col justify-between py-6 px-4">
        
        {/* En-tête */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm tracking-widest shadow-xs">
              ES
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                ESOLA POS
              </h1>
              <p className="text-[11px] text-slate-500">Gestion & Encaissement</p>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              Activation du logiciel
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Entrez votre clé unique pour débloquer votre caisse.
            </p>
          </div>
        </div>

        {/* Formulaire au centre exact */}
        <form onSubmit={handleActivate} className="space-y-4 my-auto">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clé de licence
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Ex: ESOLA-XXXX-YYYY"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-mono"
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-medium rounded-xl transition-all text-sm shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Activer l’application'}
          </button>
        </form>

        {/* Pied de page fixe en bas */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <button 
            type="button"
            onClick={onOpenHelp}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            Besoin d'aide ou d'une licence ? Cliquez ici
          </button>
        </div>

      </div>
    </div>
  );
}

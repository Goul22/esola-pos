import { useState } from 'react';

export default function CurrencyScreen({ onSave }) {
  const [selectedCurrency, setSelectedCurrency] = useState({ code: 'USD', symbol: '$' });
  const [customCode, setCustomCode] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');

  const currencies = [
    { code: 'USD', symbol: '$', name: 'Dollar Américain' },
    { code: 'CDF', symbol: 'FC', name: 'Franc Congolais' },
    { code: 'CFA', symbol: 'CFA', name: 'Franc CFA' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    if (customCode.trim() && customSymbol.trim()) {
      onSave({ code: customCode.toUpperCase(), symbol: customSymbol });
    } else {
      onSave(selectedCurrency);
    }
  };

  return (
    <div className="h-screen w-screen bg-white md:bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-sm h-full max-h-[640px] bg-white md:rounded-2xl md:shadow-lg md:border md:border-slate-200 flex flex-col justify-between py-6 px-4">
        
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm tracking-widest">
              ES
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                ESOLA POS
              </h1>
              <p className="text-[11px] text-slate-500">Configuration monétaire</p>
            </div>
          </div>

          <div className="mb-3">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              Devise de la boutique
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choisissez la monnaie principale pour vos encaissements.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 my-auto">
          <div className="grid grid-cols-2 gap-2">
            {currencies.map((curr) => {
              const isSelected = selectedCurrency.code === curr.code && !customCode;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    setSelectedCurrency({ code: curr.code, symbol: curr.symbol });
                    setCustomCode('');
                    setCustomSymbol('');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="font-bold text-sm">{curr.symbol} ({curr.code})</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {curr.name}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Ou créez votre propre devise :
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Code (ex: CAD)"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <input
                type="text"
                placeholder="Symbole (ex: $)"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-medium rounded-xl transition-all text-sm shadow-sm cursor-pointer mt-3"
          >
            Lancer la caisse ({customSymbol || selectedCurrency.symbol})
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          Cette devise s'appliquera sur tous vos rapports et tickets.
        </div>

      </div>
    </div>
  );
}


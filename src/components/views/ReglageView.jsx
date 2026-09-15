import { Settings, Check, DollarSign } from 'lucide-react';

export default function ReglageView() {
  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="font-bold text-slate-800 mb-1">Paramètres de la Boutique</h2>
        <p className="text-xs text-slate-400 mb-4">Configuration système et monnaie de référence</p>

        <label className="text-xs font-bold text-slate-600 block mb-3">Sélectionner la Devise</label>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50">
            <span className="text-lg font-bold text-slate-700">€</span>
            <span className="text-xs font-bold text-slate-800">Euro</span>
            <span className="text-[10px] text-slate-400">EUR</span>
          </div>

          <div className="p-4 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50">
            <span className="text-lg font-bold text-slate-700">$</span>
            <span className="text-xs font-bold text-slate-800">Américain</span>
            <span className="text-[10px] text-slate-400">USD</span>
          </div>

          <div className="p-4 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50">
            <span className="text-lg font-bold text-slate-700">Fr</span>
            <span className="text-xs font-bold text-slate-800">CFA</span>
            <span className="text-[10px] text-slate-400">FCFA</span>
          </div>

          <div className="p-4 border-2 border-blue-600 bg-blue-50/40 rounded-2xl flex flex-col items-center justify-center gap-1 relative">
            <span className="absolute top-2 right-2 text-blue-600"><Check size={14}/></span>
            <span className="text-lg font-bold text-blue-600">F</span>
            <span className="text-xs font-bold text-slate-900">Congolais</span>
            <span className="text-[10px] text-blue-600 font-semibold">CDF</span>
          </div>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold shadow-sm transition-all">
          Enregistrer les Paramètres
        </button>
      </div>
    </div>
  );
}

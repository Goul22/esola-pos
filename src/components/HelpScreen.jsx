export default function HelpScreen({ onBack }) {
  return (
    <div className="h-screen w-screen bg-white md:bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-sm h-full max-h-[600px] bg-white md:rounded-2xl md:shadow-lg md:border md:border-slate-200 flex flex-col justify-between py-6 px-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight mb-2">
            Aide & Support ESOLA
          </h2>
          <p className="text-xs text-slate-500">
            Pour toute assistance ou pour obtenir une clé de licence valide, contactez le support technique au numéro de l'administrateur.
          </p>
        </div>
        <button
          onClick={onBack}
          className="w-full py-3 px-4 bg-slate-900 text-white font-medium rounded-xl text-sm"
        >
          Retour
        </button>
      </div>
    </div>
  );
}

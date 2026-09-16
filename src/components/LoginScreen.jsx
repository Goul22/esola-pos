import { useState } from 'react';
import { supabase } from '../supabase';

export default function LoginScreen({ shopName, onLoginSuccess, onOpenLicense, onOpenHelp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const inputVal = username.trim();
      let loggedUser = null;

      // 1. Recherche dans la table des Administrateurs (table 'users')
      const { data: usersList, error: userError } = await supabase
        .from('users')
        .select('*');

      if (!userError && usersList) {
        const foundAdmin = usersList.find(u => 
          (u.email && u.email.toLowerCase() === inputVal.toLowerCase()) || 
          (u.name && u.name.toLowerCase() === inputVal.toLowerCase())
        );

        if (foundAdmin && foundAdmin.password === password) {
          loggedUser = foundAdmin;
        }
      }

      // 2. Si ce n'est pas un admin, on cherche dans l'équipe (table 'team_members')
      if (!loggedUser) {
        const { data: teamList, error: teamError } = await supabase
          .from('team_members')
          .select('*');

        if (!teamError && teamList) {
          const foundMember = teamList.find(m => 
            (m.email && m.email.toLowerCase() === inputVal.toLowerCase()) || 
            (m.name && m.name.toLowerCase() === inputVal.toLowerCase())
          );

          if (foundMember && foundMember.password === password) {
            loggedUser = foundMember;
          }
        }
      }

      if (!loggedUser) {
        throw new Error('Identifiant ou mot de passe incorrect.');
      }

      // Sauvegarde robuste des métadonnées de session et de licence pour éviter les blocages de chargement
      localStorage.setItem('user_email', loggedUser.email || loggedUser.name);
      localStorage.setItem('user_role', loggedUser.role || 'Vendeur');
      localStorage.setItem('user_data', JSON.stringify(loggedUser));
      
      if (loggedUser.license_key) {
        localStorage.setItem('esola_active_license', loggedUser.license_key);
      }
      if (loggedUser.shop) {
        localStorage.setItem('current_shop_name', loggedUser.shop);
      }

      setLoading(false);
      onLoginSuccess(loggedUser);

    } catch (err) {
      console.error("Erreur de connexion:", err);
      setLoading(false);
      setError(err.message || 'Identifiant ou mot de passe incorrect.');
    }
  };

  return (
    <div className="h-screen w-screen bg-white md:bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
<<<<<<< HEAD
      <div className="w-full max-w-sm h-full max-h-[600px] bg-white md:rounded-2xl md:shadow-lg md:border md:border-slate-200 flex flex-col justify-between py-6 px-4">
=======
      <div className="w-full max-w-sm h-full max-h-[560px] bg-white md:rounded-2xl md:shadow-lg md:border md:border-slate-200 flex flex-col justify-between py-6 px-4">
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
        
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm tracking-widest shadow-xs">
              ES
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                {shopName || 'ESOLA POS'}
              </h1>
              <p className="text-[11px] text-slate-500">Connexion à votre espace</p>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              Bon retour !
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Veuillez vous connecter pour accéder à la caisse.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5 my-auto">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nom de boutique / Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: Marek ou email@domain.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all text-sm shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2 text-center">
          <button 
            type="button"
            onClick={onOpenLicense}
            className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
          >
            Première utilisation ? Créer un compte boutique
          </button>
<<<<<<< HEAD

          {/* Ajout du numéro WhatsApp du support */}
          <a 
            href="https://wa.me/243989546920?text=Bonjour,%20je%20souhaite%20obtenir%20une%20licence%20pour%20ESOLA%20POS." 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-emerald-600 hover:underline cursor-pointer"
          >
            💬 Obtenir sa licence sur WhatsApp : +243 989 546 920
          </a>
=======
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
          
          <button 
            type="button"
            onClick={onOpenHelp}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Besoin d'aide ? Contactez le support
          </button>
        </div>

      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc

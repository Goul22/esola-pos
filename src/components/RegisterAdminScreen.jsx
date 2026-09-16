import { useState } from 'react';
import { supabase } from '../supabase';

export default function RegisterAdminScreen({ onRegisterSuccess, onBackToLogin }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [shopName, setShopName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!licenseKey.trim() || !shopName.trim() || !username.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs, y compris la clé de licence.');
      return;
    }
    if (password.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const cleanLicenseKey = licenseKey.trim().toUpperCase();
      const cleanShopName = shopName.trim();
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      // 1. VÉRIFIER QUE LA LICENCE EXISTE ET RÉCUPÉRER SON ID
      const { data: licenseData, error: licenseCheckError } = await supabase
        .from('licenses')
        .select('*')
        .eq('key', cleanLicenseKey)
        .maybeSingle();

      if (licenseCheckError || !licenseData) {
        throw new Error('Clé de licence invalide ou introuvable.');
      }

      if (licenseData.is_active === true) {
        throw new Error('Cette clé de licence a déjà été activée et utilisée par une autre boutique.');
      }

      const licenseId = licenseData.id; // <-- Récupération automatique de l'ID de la table licenses

      // 2. VÉRIFIER QUE L'UTILISATEUR N'EXISTE PAS DÉJÀ
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        throw new Error("Ce nom d'utilisateur / email existe déjà.");
      }

      // 3. CRÉER L'UTILISATEUR ET RÉCUPÉRER SON ID
      const { data: createdUser, error: userError } = await supabase
        .from('users')
        .insert([{ email: cleanUsername, password: cleanPassword, role: 'shop_owner' }])
        .select()
        .single();

      if (userError || !createdUser) {
        throw new Error("Erreur création utilisateur : " + (userError?.message || "Inconnue"));
      }

      const userId = createdUser.id; // <-- Récupération automatique de l'ID de la table users

      // 4. CRÉER LA BOUTIQUE AVEC LES DEUX ID AUTOMATIQUES
      const { error: shopError } = await supabase
        .from('shops')
        .insert([
          {
            shop_name: cleanShopName,
            license_key: cleanLicenseKey,
            license_id: licenseId,  // <-- ID automatique de la table licenses
            user_id: userId,        // <-- ID automatique de la table users
            owner: cleanUsername    // Nom d'utilisateur ou e-mail
          }
        ]);

      if (shopError) {
        // En cas d'échec, on nettoie l'utilisateur créé juste avant
        await supabase.from('users').delete().eq('id', userId);
        throw new Error("Erreur création boutique : " + shopError.message);
      }

      // 5. EN TOUTE FIN : ACTIVER LA LICENCE
      const { error: licenseUpdateError } = await supabase
        .from('licenses')
        .update({ shop_name: cleanShopName, is_active: true })
        .eq('key', cleanLicenseKey);

      if (licenseUpdateError) {
        throw new Error("Erreur activation licence : " + licenseUpdateError.message);
      }

      // Enregistrement des infos en local pour les sessions futures
      localStorage.setItem('user_email', cleanUsername);
      localStorage.setItem('license_key', cleanLicenseKey);

      setLoading(false);
      onRegisterSuccess({ shopName: cleanShopName, username: cleanUsername });

    } catch (err) {
      console.error("Erreur critique lors de l'enregistrement:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-white md:bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-sm h-full max-h-[700px] bg-white md:rounded-2xl md:shadow-lg md:border md:border-slate-200 flex flex-col justify-between py-6 px-4 overflow-y-auto">
        
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm tracking-widest shadow-xs">
              ES
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                ESOLA POS
              </h1>
              <p className="text-[11px] text-slate-500">Configuration du compte</p>
            </div>
          </div>

          <div className="mb-3">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              Créer votre compte de gérant
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Renseignez votre clé de licence et sécurisez votre application.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 my-auto">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Clé de licence
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              placeholder="Ex: ESOLA-XXXX-2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nom de la boutique / Établissement
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Ex: Quincaillerie Moderne"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nom d'utilisateur / Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: moncompte@email.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Mot de passe de sécurité
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all text-sm shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50 mt-1"
          >
            {loading ? 'Enregistrement...' : 'Valider & Continuer'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-1 text-center text-xs mt-2">
          <span className="text-slate-400">Vous avez déjà un compte ?</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onBackToLogin) onBackToLogin();
            }}
            className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ← Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}

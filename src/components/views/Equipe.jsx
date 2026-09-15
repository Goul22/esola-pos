import { useState, useEffect } from 'react';
import { UserPlus, Shield, Key, Store, Trash2, X, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../../supabase';
import { db } from '../../db';

export default function EquipeGSView() {
  const [team, setTeam] = useState([
    { id: 1, name: 'Hervé Geliba', email: 'yacha@gmail.com', role: 'Super Admin', shop: 'Toutes les boutiques', canManageStaff: true, canSell: true, canStock: true },
    { id: 2, name: 'Christian Mutombo', email: 'christian@esola.com', role: 'Sous-Admin', shop: 'Boutique Kinshasa', canManageStaff: true, canSell: true, canStock: true },
  ]);

  const [shops, setShops] = useState(["Boutique Kinshasa", "Boutique Lemba", "Boutique Gombe"]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulaire d'ajout
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Vendeur'); // Vendeur ou Sous-Admin
  const [assignedShop, setAssignedShop] = useState('Boutique Kinshasa');
  
  // Permissions spécifiques
  const [canManageStaff, setCanManageStaff] = useState(false);
  const [canSell, setCanSell] = useState(true);
  const [canStock, setCanStock] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      if (navigator.onLine) {
        const { data, error } = await supabase.from('team_members').select('*');
        if (!error && data && data.length > 0) {
          setTeam(data);
        }
      }
    } catch (err) {
      console.error("Erreur chargement équipe:", err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Si c'est un sous-admin, on peut lui donner par défaut le droit de gérer son équipe de vendeurs
    const memberData = {
      id: Date.now(),
      name: newName,
      email: newEmail,
      role: newRole,
      shop: assignedShop,
      canManageStaff: newRole === 'Sous-Admin' ? canManageStaff : false,
      canSell: newRole === 'Super Admin' ? true : canSell,
      canStock: newRole === 'Super Admin' ? true : canStock,
      created_at: new Date().toISOString()
    };

    try {
      // Sauvegarde locale ou Supabase
      setTeam([...team, memberData]);
      
      if (navigator.onLine) {
        await supabase.from('team_members').insert([memberData]);
      }

      toast.success("Utilisateur créé avec succès ! Traçabilité active.");
      setIsModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setCanManageStaff(false);
    } catch (err) {
      toast.error("Erreur lors de la création");
    }
  };

  const deleteMember = async (id) => {
    setTeam(team.filter(m => m.id !== id));
    toast.success("Membre supprimé de l'équipe.");
    if (navigator.onLine) {
      await supabase.from('team_members').delete().eq('id', id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 max-w-lg mx-auto">
      <Toaster />
      
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-800">Gestion Équipe & Rôles</h1>
          <p className="text-xs text-slate-500">Supervision centralisée des boutiques</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-200 active:scale-95 cursor-pointer"
        >
          <UserPlus size={16} /> Ajouter
        </button>
      </div>

      {/* Liste des membres */}
      <div className="space-y-3">
        {team.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2.5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{member.name}</h3>
                <p className="text-xs text-slate-400">{member.email}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${member.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' : member.role === 'Sous-Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                {member.role}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 text-[10px] text-slate-600">
              <span className="bg-slate-100 px-2 py-1 rounded-lg flex items-center gap-1 font-semibold">
                <Store size={12}/> {member.shop}
              </span>
              {member.canManageStaff && (
                <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-lg font-semibold">
                  ✓ Gère ses vendeurs
                </span>
              )}
              <span className={`px-2 py-1 rounded-lg font-semibold ${member.canSell ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {member.canSell ? "Vente OK" : "Vente bloquée"}
              </span>
              <span className={`px-2 py-1 rounded-lg font-semibold ${member.canStock ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {member.canStock ? "Stock OK" : "Stock bloqué"}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              {member.role !== 'Super Admin' && (
                <button onClick={() => deleteMember(member.id)} className="p-1.5 bg-rose-50 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer">
                  <Trash2 size={14}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout avec gestion des droits hiérarchiques */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm">Nouvel utilisateur</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 cursor-pointer">
                <X size={16}/>
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600">Nom complet</label>
                <input type="text" placeholder="Ex: Jean Paul" value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 text-xs" required />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600">Email professionnel</label>
                <input type="email" placeholder="email@esola.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 text-xs" required />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600">Mot de passe</label>
                <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 text-xs" required />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600">Rôle</label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 text-xs bg-white font-bold text-slate-800">
                    <option value="Sous-Admin">Sous-Admin</option>
                    <option value="Vendeur">Vendeur</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600">Boutique</label>
                  <select value={assignedShop} onChange={e => setAssignedShop(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 text-xs bg-white font-bold text-slate-800">
                    {shops.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {newRole === 'Sous-Admin' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={canManageStaff} onChange={e => setCanManageStaff(e.target.checked)} className="rounded text-blue-600 w-4 h-4" />
                    <span className="text-xs font-semibold text-slate-700">Lui donner le droit de créer des vendeurs pour cette boutique</span>
                  </label>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={canSell} onChange={e => setCanSell(e.target.checked)} className="rounded text-blue-600 w-4 h-4" />
                  <span className="text-xs font-semibold text-slate-700">Autoriser les ventes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={canStock} onChange={e => setCanStock(e.target.checked)} className="rounded text-blue-600 w-4 h-4" />
                  <span className="text-xs font-semibold text-slate-700">Autoriser la gestion du stock</span>
                </label>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-200 active:scale-95 transition-transform mt-3 cursor-pointer">
                Créer le compte
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Users, UserPlus, Store, Trash2, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabase';
import { db } from '../db';
import toast, { Toaster } from 'react-hot-toast';

export default function TeamView() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Formulaire d'ajout
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Vendeur');
  const [assignedShop, setAssignedShop] = useState('');
  const [canSell, setCanSell] = useState(true);
  const [canStock, setCanStock] = useState(false);

  // Modal de confirmation
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    initTeamData();
  }, []);

  const initTeamData = async () => {
    setLoading(true);
    try {
      const currentLicense = localStorage.getItem('esola_active_license') || JSON.parse(localStorage.getItem('user_data') || '{}').license_key || '';
      
<<<<<<< HEAD
      // 1. Charger les boutiques de manière robuste (par licence ou par user_id/email)
      let shopsData = [];
      if (navigator.onLine) {
        if (currentLicense) {
          const { data: sData } = await supabase.from('shops').select('*').eq('license_key', currentLicense);
          if (sData && sData.length > 0) shopsData = sData;
        }

        if (shopsData.length === 0) {
          const currentEmail = localStorage.getItem('user_email');
          if (currentEmail) {
            const { data: userData } = await supabase.from('users').select('id').eq('email', currentEmail).single();
            if (userData) {
              const { data: sData2 } = await supabase.from('shops').select('*').eq('user_id', userData.id);
              if (sData2) shopsData = sData2;
            }
          }
        }
      }

      if (shopsData.length === 0 && db.shops) {
        shopsData = await db.shops.toArray();
      }

=======
      // Charger les boutiques pour l'assignation
      let shopsData = [];
      if (navigator.onLine && currentLicense) {
        const { data: sData } = await supabase.from('shops').select('*').eq('license_key', currentLicense);
        if (sData) shopsData = sData;
      }
      if (shopsData.length === 0 && db.shops) {
        shopsData = await db.shops.toArray();
      }
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
      setShops(shopsData);
      if (shopsData.length > 0 && !assignedShop) {
        setAssignedShop(shopsData[0].shop_name);
      }

<<<<<<< HEAD
      // 2. Charger les membres de l'équipe
=======
      // Charger les membres de l'équipe
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
      let membersData = [];
      if (db.team_members) {
        membersData = await db.team_members.toArray();
      }
<<<<<<< HEAD

      if (navigator.onLine) {
        try {
          let query = supabase.from('team_members').select('*');
          if (currentLicense) {
            query = query.eq('license_key', currentLicense);
          }
          const { data: mData, error } = await query;
          if (!error && mData) {
            membersData = mData;
            if (db.team_members) {
              await db.team_members.clear();
              await db.team_members.bulkPut(mData);
            }
          }
        } catch (e) {
          console.warn("Impossible de charger l'équipe depuis Supabase, utilisation du local:", e);
        }
      }

=======
      if (navigator.onLine && currentLicense) {
        const { data: mData, error } = await supabase.from('team_members').select('*').eq('license_key', currentLicense);
        if (!error && mData) {
          membersData = mData;
          if (db.team_members) await db.team_members.bulkPut(mData);
        }
      }
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
      setTeamMembers(membersData);
    } catch (err) {
      console.error("Erreur chargement équipe:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const currentLicense = localStorage.getItem('esola_active_license') || JSON.parse(localStorage.getItem('user_data') || '{}').license_key || 'DEFAULT-LICENSE';

<<<<<<< HEAD
=======
    // Utilisation d'un identifiant unique textuel pour éviter les doublons de clés primaires
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
    const memberData = {
      id: String(Date.now()),
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword,
      license_key: currentLicense,
      role: newRole,
      shop: assignedShop || (shops[0]?.shop_name ?? 'Boutique Principale'),
      can_sell: newRole === 'Super Admin' ? true : Boolean(canSell),
      can_stock: newRole === 'Super Admin' ? true : Boolean(canStock),
      created_at: new Date().toISOString()
    };

    try {
      if (navigator.onLine) {
        const { error } = await supabase.from('team_members').insert([memberData]);
<<<<<<< HEAD
        if (error) {
          console.warn("Avertissement Supabase (insertion membre) :", error);
        }
=======
        if (error) throw error;
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
      }

      if (db.team_members) {
        await db.team_members.put(memberData);
      }

      toast.success("Membre ajouté avec succès !");
<<<<<<< HEAD
      setTeamMembers(prev => [...prev, memberData]);
=======
      setTeamMembers([...teamMembers, memberData]);
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
      setShowAddModal(false);

      // Réinitialiser le formulaire
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('Vendeur');
      if (shops.length > 0) setAssignedShop(shops[0].shop_name);
    } catch (err) {
<<<<<<< HEAD
      console.error("Détail exact de l'erreur d'ajout:", err);
=======
      console.error("Détail exact de l'erreur Supabase:", err);
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
      toast.error("Erreur : " + (err.message || err.details || "Impossible d'enregistrer le membre"));
    }
  };

  const executeDelete = async (memberId) => {
    try {
      if (navigator.onLine) {
        await supabase.from('team_members').delete().eq('id', memberId);
      }
      if (db.team_members) {
        await db.team_members.delete(memberId);
      }
<<<<<<< HEAD
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success("Membre supprimé avec succès.");
    } catch (err) {
      console.error("Erreur suppression:", err);
      if (db.team_members) {
        await db.team_members.delete(memberId);
      }
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success("Membre supprimé localement.");
=======
      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
      toast.success("Membre supprimé avec succès.");
    } catch (err) {
      console.error("Erreur suppression:", err);
      toast.error("Erreur lors de la suppression.");
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
    }
  };

  const handleDeleteMember = (member) => {
    setConfirmModal({
      isOpen: true,
      title: "Supprimer le membre",
      message: `Voulez-vous vraiment supprimer ${member.name} de l'équipe ?`,
      onConfirm: () => executeDelete(member.id)
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-3 space-y-3 overflow-y-auto pb-24 max-w-lg mx-auto w-full">
      <Toaster position="top-center" />

      {/* En-tête de la vue */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Gestion d'équipe</h2>
            <p className="text-[10px] text-slate-400">Gérez les accès et les boutiques des vendeurs</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <UserPlus size={14} /> Ajouter
        </button>
      </div>
<<<<<<< HEAD

=======
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
      {/* Liste des membres */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase px-1">Membres enregistrés ({teamMembers.length})</span>

        {loading ? (
          <p className="text-center text-xs text-slate-400 py-6 bg-white rounded-2xl border border-slate-200">Chargement...</p>
        ) : teamMembers.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6 bg-white rounded-2xl border border-slate-200">Aucun membre d'équipe configuré.</p>
        ) : (
          teamMembers.map((m) => (
            <div key={m.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold text-slate-900 truncate">{m.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase">
                    {m.role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{m.email}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <Store size={10} /> {m.shop || 'Boutique par défaut'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => handleDeleteMember(m)}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal d'ajout de membre */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold block">Nouvel accès</span>
                <h3 className="font-black text-slate-900 text-sm">Ajouter un vendeur</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nom complet</label>
                <input 
                  type="text" 
                  placeholder="Ex: Jean Dupont" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  required 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email / Identifiant</label>
                <input 
                  type="email" 
                  placeholder="jean@email.com" 
                  value={newEmail} 
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  required 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mot de passe</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  required 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rôle</label>
                <select 
                  value={newRole} 
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Vendeur">Vendeur</option>
<<<<<<< HEAD
                  
=======
                  <option value="Super Admin">Super Admin (Accès global)</option>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
                </select>
              </div>

              {newRole !== 'Super Admin' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Boutique Assignée (Strict)</label>
                  <select 
                    value={assignedShop} 
                    onChange={e => setAssignedShop(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
<<<<<<< HEAD
                    {shops.length === 0 ? (
                      <option value="">Aucune boutique disponible</option>
                    ) : (
                      shops.map(s => (
                        <option key={s.id || s.shop_name} value={s.shop_name}>{s.shop_name}</option>
                      ))
                    )}
=======
                    {shops.map(s => (
                      <option key={s.id || s.shop_name} value={s.shop_name}>{s.shop_name}</option>
                    ))}
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
                  </select>
                  <p className="text-[9px] text-amber-600 mt-1">Le vendeur ne verra que les données de cette boutique.</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Enregistrer
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmation de suppression */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">{confirmModal.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Confirmer
              </button>
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
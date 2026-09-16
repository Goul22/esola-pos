import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart2, Settings, 
  Menu, X, Users, History, LogOut, Wifi, WifiOff, RefreshCw 
} from 'lucide-react';

import AccueilView from './views/AccueilView';
import StockView from './views/StockView';
import VenteView from './views/VenteView';
import RapportView from './views/RapportView';
import ReglageView from './views/ReglageView';
import TeamView from './TeamView'; 
import { db } from '../db'; 

export default function PosDashboard({ shopName, user, onLogout }) {
  // Déterminer si l'utilisateur connecté est un simple vendeur
  const isVendor = user?.role === 'Vendeur' || user?.role === 'vendeur';

  // Si c'est un vendeur, on le positionne par défaut sur 'vente' (caisse) au lieu de 'accueil'
  const [activeTab, setActiveTab] = useState(isVendor ? 'vente' : 'accueil');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🌐 États pour la gestion du réseau et de la synchronisation
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const checkPendingSales = async () => {
    try {
      if (db.sales) {
        const unsynced = await db.sales.where('synced').equals(0).toArray();
        setPendingCount(unsynced.length);
      }
    } catch (err) {
      console.error("Erreur vérification file d'attente:", err);
    }
  };

  useEffect(() => {
    checkPendingSales();

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      setTimeout(async () => {
        await checkPendingSales();
        setIsSyncing(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkPendingSales, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Définition dynamique des onglets principaux selon les droits (Rapport accessible au vendeur pour sa boutique)
  const allNavItems = [
    { id: 'accueil', label: 'Accueil', icon: LayoutDashboard, show: !isVendor },
    { id: 'stock', label: 'Stock', icon: Package, show: !isVendor || user?.can_stock === true },
    { id: 'vente', label: 'Vente', icon: ShoppingCart, show: true },
    { id: 'rapport', label: 'Rapport', icon: BarChart2, show: true },
    { id: 'reglages', label: 'Réglages', icon: Settings, show: !isVendor },
  ];

  const navItems = allNavItems.filter(item => item.show);

  // Rendu dynamique sécurisé des vues (Transmission du filtre de boutique pour le vendeur)
  const renderView = () => {
    switch (activeTab) {
      case 'accueil': return isVendor ? <VenteView /> : <AccueilView />;
      case 'stock': return (!isVendor || user?.can_stock === true) ? <StockView /> : <div className="p-6 text-rose-600 font-bold">Accès non autorisé au stock.</div>;
      case 'vente': return <VenteView />;
      case 'rapport': return <RapportView shopFilter={isVendor ? (user?.shop || shopName) : null} />;
      case 'reglages': return !isVendor ? <ReglageView /> : <div className="p-6 text-rose-600 font-bold">Accès non autorisé.</div>;
      case 'equipe': return (!isVendor || user?.can_manage_staff === true) ? <TeamView onBack={() => setActiveTab('vente')} /> : <div className="p-6 text-rose-600 font-bold">Accès non autorisé.</div>; 
      case 'historique': return <div className="p-6 text-slate-600 font-bold">Vue Historique Stock en cours...</div>;
      default: return <VenteView />;
    }
  };

  const pageTransition = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.18, ease: "easeInOut" }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-xs z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="font-bold text-slate-800 text-base capitalize leading-tight">
              {activeTab === 'accueil' ? 'Dashboard' : activeTab} {isVendor && <span className="text-xs font-normal text-slate-500">({user?.name || 'Vendeur'})</span>}
            </h1>
            <p className="text-[10px] text-slate-400">{user?.shop || shopName || 'ESOLA POS'}</p>
          </div>
        </div>

        {/* 🌐 INDICATEUR D'ÉTAT CLOUD & SYNCHRO DYNAMIQUE */}
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200 animate-pulse">
              {pendingCount} en attente
            </span>
          )}

          <div className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 transition-colors ${
            isOnline 
              ? (isSyncing ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100')
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {isOnline ? (
              isSyncing ? (
                <>
                  <RefreshCw size={12} className="animate-spin text-amber-600" />
                  <span>Synchro...</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>En ligne</span>
                </>
              )
            ) : (
              <>
                <WifiOff size={12} className="text-rose-600" />
                <span>Hors-ligne</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR ANIMÉE (MENU LATÉRAL) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)} 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
            />
            <motion.div 
              initial={{ x: -280 }} 
              animate={{ x: 0 }} 
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed left-0 top-0 h-full w-72 bg-white z-50 p-6 shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-wider">ESOLA</h2>
                    <p className="text-xs text-slate-400">{isVendor ? `Espace Vendeur (${user?.shop})` : 'Système de Gestion Pro'}</p>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X size={22}/>
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${activeTab === item.id ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <item.icon size={20} /> {item.label}
                    </button>
                  ))}
                  <div className="my-4 border-t border-slate-100" />
                  
                  {/* Bouton Gestion Équipe */}
                  {(!isVendor || user?.can_manage_staff === true) && (
                    <button 
                      onClick={() => { setActiveTab('equipe'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'equipe' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Users size={18}/> Gestion Équipe
                    </button>
                  )}
{/* 
        Bouton Historique Stock masqué en attendant la mise à jour 
        {( !isVendor || user?.can_stock === true ) && (
          <button
            onClick={() => { setActiveTab('historique'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-...`}
          >
            <History size={18}/> Historique Stock
          </button>
        )}
      */}

                </nav>
              </div>

              <button 
                onClick={onLogout} 
                className="w-full flex items-center justify-center gap-2 text-rose-600 p-3 bg-rose-50 hover:bg-rose-100 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                <LogOut size={18} /> Déconnexion
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CONTENU DES VUES AVEC ANIMATION FLUIDE */}
      <main className="flex-1 overflow-y-auto pb-24 relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            {...pageTransition}
            className="h-full w-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* NAVIGATION INFÉRIEURE (TAB BAR) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-30">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 flex-1 relative transition-colors cursor-pointer ${isActive ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <item.icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'} />
              <span className="text-[10px]">{item.label}</span>
              {isActive && (
                <motion.div layoutId="activeIndicator" className="absolute -top-2 w-8 h-1 bg-slate-900 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

    </div>
  );
}

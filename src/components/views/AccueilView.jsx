import { useState, useEffect } from 'react';
import { Package, TrendingUp, Tag, AlertTriangle, X, ArrowRight, Bell, Plus, DollarSign, Clock, ChevronRight, ShoppingCart } from 'lucide-react';
import { supabase } from '../../supabase';
import { db } from '../../db';

export default function AccueilView() {
  const [shops, setShops] = useState([]);
  const [activeShop, setActiveShop] = useState(null);
  const [showShopSelector, setShowShopSelector] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [products, setProducts] = useState([]);
  const [todaySales, setTodaySales] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // États dettes et modals
  const [debtsList, setDebtsList] = useState([]);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isSalesDetailOpen, setIsSalesDetailOpen] = useState(false);
  const [allShopsSalesToday, setAllShopsSalesToday] = useState([]);
  const [globalSalesTotal, setGlobalSalesTotal] = useState(0);
  const [selectedProductForRestock, setSelectedProductForRestock] = useState(null);
  const [addedQty, setAddedQty] = useState('');

  // États pour les tranches de ventes / crédits détaillés
  const [salesTranches, setSalesTranches] = useState({
    '0 - 20k CDF': { label: 'Petites ventes (0 - 20k)', count: 0, total: 0, items: [] },
    '20k - 50k CDF': { label: 'Ventes moyennes (20k - 50k)', count: 0, total: 0, items: [] },
    '50k+ CDF': { label: 'Importantes ventes (50k+)', count: 0, total: 0, items: [] }
  });
  const [selectedTrancheDetail, setSelectedTrancheDetail] = useState(null);
  const [isTrancheModalOpen, setIsTrancheModalOpen] = useState(false);

  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

<<<<<<< HEAD
 // Récupération de la devise active (ex: USD, CDF, EUR, etc.)
  const currentCurrency = localStorage.getItem('shop_currency') || 'CDF';

  const formatMoney = (num) => {
    const numericAmount = Number(num || 0);
    return numericAmount.toLocaleString().replace(/[\s\u00A0\u202F]/g, ' ') + ` ${currentCurrency}`;
  };
=======
  const formatMoney = (num) => (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc

  const formatCompactMoney = (num) => {
    const val = num || 0;
    if (val >= 1_000_000) {
<<<<<<< HEAD
      return (val / 1_000_000).toFixed(1).replace('.', ',') + `M ${currentCurrency}`;
    }
    if (val >= 1_000) {
      return (val / 1_000).toFixed(0) + `k ${currentCurrency}`;
    }
    return formatMoney(val);
  };
=======
      return (val / 1_000_000).toFixed(1).replace('.', ',') + 'M';
    }
    if (val >= 1_000) {
      return (val / 1_000).toFixed(0) + 'k';
    }
    return formatMoney(val);
  };

>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
  useEffect(() => {
    fetchUserShops();
  }, []);

  useEffect(() => {
    if (activeShop) {
      fetchShopData(activeShop.id);
    }
  }, [activeShop]);

  const fetchUserShops = async () => {
    try {
      const currentEmail = localStorage.getItem('user_email');
      const userRole = localStorage.getItem('user_role') || 'admin';
      setIsAdmin(userRole === 'admin');

      let shopsData = [];
      if (navigator.onLine && currentEmail) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', currentEmail)
          .single();

        if (userData) {
          const { data: sData } = await supabase
            .from('shops')
            .select('*')
            .eq('user_id', userData.id);
          shopsData = sData || [];
        }
      }

      if (shopsData.length === 0) {
        const savedShopId = localStorage.getItem('current_shop_id');
        const savedShopName = localStorage.getItem('current_shop_name') || 'Boutique';
        if (savedShopId) {
          shopsData = [{ id: savedShopId, shop_name: savedShopName }];
        }
      }

      if (shopsData.length > 0) {
        setShops(shopsData);
        const savedShopId = localStorage.getItem('current_shop_id');
        const defaultShop = shopsData.find(s => s.id === savedShopId) || shopsData[0];
        setActiveShop(defaultShop);
        
        fetchDebtsForAllShops(shopsData.map(s => s.id));
      }
    } catch (err) {
      console.error("Erreur chargement boutiques:", err);
    }
  };

  const fetchShopData = async (shopId) => {
    setLoading(true);
    try {
      let salesSource = [];
      const localProducts = await db.products.where('shop_id').equals(shopId).toArray();
      if (localProducts && localProducts.length > 0) {
        setProducts(localProducts);
      } else {
        setProducts([]);
      }

      if (db.sales) {
        const localSales = await db.sales.where('shop_id').equals(shopId).toArray();
        const startOfDayTime = new Date();
        startOfDayTime.setHours(0, 0, 0, 0);

        const todaySalesFiltered = localSales.filter(s => new Date(s.created_at) >= startOfDayTime);
        const localSalesTotal = todaySalesFiltered.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
        setTodaySales(localSalesTotal);
        salesSource = todaySalesFiltered;
      }

      if (navigator.onLine) {
        const { data: prodData } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopId);

        if (prodData) {
          setProducts(prodData);
          await db.products.bulkPut(prodData);
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { data: salesData } = await supabase
          .from('sales')
          .select('*')
          .eq('shop_id', shopId)
          .gte('created_at', startOfDay.toISOString());

        if (salesData) {
          const total = salesData.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
          setTodaySales(total);
          salesSource = salesData;
        }
      }

      computeTranches(salesSource);

    } catch (err) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  };

  const computeTranches = (salesList) => {
    const tranches = {
      '0 - 20k CDF': { label: 'Petites ventes (0 - 20k)', count: 0, total: 0, items: [] },
      '20k - 50k CDF': { label: 'Ventes moyennes (20k - 50k)', count: 0, total: 0, items: [] },
      '50k+ CDF': { label: 'Importantes ventes (50k+)', count: 0, total: 0, items: [] }
    };

    salesList.forEach((sale) => {
      const amount = sale.total_amount || 0;
      if (amount <= 20000) {
        tranches['0 - 20k CDF'].count++;
        tranches['0 - 20k CDF'].total += amount;
        tranches['0 - 20k CDF'].items.push(sale);
      } else if (amount <= 50000) {
        tranches['20k - 50k CDF'].count++;
        tranches['20k - 50k CDF'].total += amount;
        tranches['20k - 50k CDF'].items.push(sale);
      } else {
        tranches['50k+ CDF'].count++;
        tranches['50k+ CDF'].total += amount;
        tranches['50k+ CDF'].items.push(sale);
      }
    });

    setSalesTranches(tranches);
  };

  const fetchDebtsForAllShops = async (shopIds) => {
    try {
      if (db.sales) {
        const allLocalSales = await db.sales.toArray();
        const localDebts = allLocalSales.filter(s => shopIds.includes(s.shop_id) && s.payment_type === 'credit');
        if (localDebts.length > 0) {
          setDebtsList(localDebts);
        }
      }

      if (navigator.onLine) {
        const { data: salesData } = await supabase
          .from('sales')
          .select('*')
          .in('shop_id', shopIds)
          .eq('payment_type', 'credit')
          .order('created_at', { ascending: false });

        if (salesData) setDebtsList(salesData);
      }
    } catch (err) {
      console.error("Erreur chargement dettes:", err);
    }
  };
const handlePayDebt = async (debtId) => {
    try {
      if (db.sales) {
        const debtRecord = await db.sales.get(debtId);
        if (debtRecord) {
          await db.sales.put({ ...debtRecord, payment_type: 'cash' });
        }
      }

      if (navigator.onLine) {
        await supabase
          .from('sales')
          .update({ payment_type: 'cash' })
          .eq('id', debtId);
      }

      setDebtsList(prev => prev.filter(d => d.id !== debtId));
    } catch (err) {
      console.error("Erreur paiement dette:", err);
    }
  };

  const handleOpenSalesDetail = async () => {
    try {
      const shopIdsToFetch = shops.length > 0 ? shops.map(s => s.id) : [activeShop?.id];
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      let salesSource = [];
      if (db.sales) {
        const allLocal = await db.sales.toArray();
        salesSource = allLocal.filter(s => shopIdsToFetch.includes(s.shop_id) && new Date(s.created_at) >= startOfDay);
      }

      if (navigator.onLine) {
        const { data } = await supabase
          .from('sales')
          .select('*')
          .in('shop_id', shopIdsToFetch)
          .gte('created_at', startOfDay.toISOString());
        if (data) salesSource = data;
      }

      const salesByShopMap = {};
      shops.forEach(s => {
        salesByShopMap[s.id] = { shopName: s.shop_name, total: 0, count: 0 };
      });
      if (activeShop && !salesByShopMap[activeShop.id]) {
        salesByShopMap[activeShop.id] = { shopName: activeShop.shop_name, total: 0, count: 0 };
      }

      let globalSum = 0;
      salesSource.forEach(sale => {
        if (!salesByShopMap[sale.shop_id]) {
          salesByShopMap[sale.shop_id] = { shopName: 'Boutique', total: 0, count: 0 };
        }
        salesByShopMap[sale.shop_id].total += (sale.total_amount || 0);
        salesByShopMap[sale.shop_id].count += 1;
        globalSum += (sale.total_amount || 0);
      });

      setAllShopsSalesToday(Object.values(salesByShopMap));
      setGlobalSalesTotal(globalSum);
      setIsSalesDetailOpen(true);
    } catch (err) {
      console.error("Erreur ventes globales:", err);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductForRestock || !addedQty || isNaN(addedQty)) return;

    const currentQty = selectedProductForRestock.qty !== undefined ? selectedProductForRestock.qty : selectedProductForRestock.quantite;
    const qtyField = selectedProductForRestock.qty !== undefined ? 'qty' : 'quantite';
    const newTotalQty = Number(currentQty) + parseInt(addedQty);

    try {
      const updatedProduct = { ...selectedProductForRestock, [qtyField]: newTotalQty };
      await db.products.put(updatedProduct);

      if (navigator.onLine) {
        await supabase
          .from('products')
          .update({ [qtyField]: newTotalQty })
          .eq('id', selectedProductForRestock.id);
      }

      setSelectedProductForRestock(null);
      setAddedQty('');
      if (activeShop) fetchShopData(activeShop.id);
    } catch (err) {
      console.error("Erreur réapprovisionnement:", err);
    }
  };

  const totalStockValue = products.reduce((acc, p) => acc + ((p.price || p.prix_vente || 0) * (p.qty !== undefined ? p.qty : p.quantite || 0)), 0);
  const totalProductsCount = products.reduce((acc, p) => acc + (p.qty !== undefined ? p.qty : p.quantite || 0), 0);
  const lowStockProducts = products.filter(p => (p.qty !== undefined ? p.qty : p.quantite) < 5);

  const categoriesMap = {};
  products.forEach(p => {
    const cat = p.category || p.categorie || 'Général';
    if (!categoriesMap[cat]) categoriesMap[cat] = { count: 0, value: 0 };
    categoriesMap[cat].count += 1;
    categoriesMap[cat].value += (p.price || p.prix_vente || 0) * (p.qty !== undefined ? p.qty : p.quantite || 0);
  });

  const dynamicBreakdown = Object.keys(categoriesMap).map(cat => ({
    category: cat,
    count: `${categoriesMap[cat].count} articles`,
<<<<<<< HEAD
    value: `${formatMoney(categoriesMap[cat].value)} `
=======
    value: `${formatMoney(categoriesMap[cat].value)} CDF`
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
  }));

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto relative pb-24">
      
      {/* Alerte Crédits / Dettes globale */}
      {debtsList.length > 0 && (
        <div 
          onClick={() => setIsDebtModalOpen(true)}
          className="bg-gradient-to-r from-rose-500 to-red-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Bell size={20} className="animate-bounce text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Alerte Dettes / Crédits</p>
              <p className="text-xs text-rose-100">{debtsList.length} vente(s) à crédit en attente</p>
            </div>
          </div>
          <span className="bg-white text-rose-600 font-black text-xs px-2.5 py-1 rounded-xl shadow-xs">
            Voir
          </span>
        </div>
      )}

      {/* Sélecteur de boutique */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Espace Actif</span>
          <button 
            onClick={() => setShowShopSelector(!showShopSelector)}
            className="text-sm font-extrabold text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            {activeShop ? activeShop.shop_name : 'Chargement...'} ▼
          </button>
        </div>
<<<<<<< HEAD
        
=======
        <div className="flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-emerald-700">Mode Local / Cloud</span>
        </div>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
      </div>

      {showShopSelector && shops.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-md space-y-1 z-20">
          <p className="text-[10px] font-bold text-slate-400 uppercase px-2">Basculer vers une boutique :</p>
          {shops.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveShop(s);
                localStorage.setItem('current_shop_id', s.id);
                localStorage.setItem('current_shop_name', s.shop_name);
                setShowShopSelector(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${activeShop?.id === s.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              {s.shop_name}
            </button>
          ))}
        </div>
      )}

      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider capitalize">{todayFormatted}</div>

      {/* Cartes de Synthèse */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => setSelectedDetail('stock')}
          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-300 transition-all active:scale-95"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Valeur Stock</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Package size={18}/></div>
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">
<<<<<<< HEAD
              {loading ? '...' : `${formatCompactMoney(totalStockValue)} `}
=======
              {loading ? '...' : `${formatCompactMoney(totalStockValue)} CDF`}
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
            </div>
            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-1">
              Appuyer pour le détail <ArrowRight size={10}/>
            </span>
          </div>
        </div>
<div 
          onClick={handleOpenSalesDetail}
          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all active:scale-95"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Ventes Auj.</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={18}/></div>
          </div>
          <div>
            <div className="text-lg font-black text-emerald-600">
<<<<<<< HEAD
              {loading ? '...' : `${formatCompactMoney(todaySales)} `}
=======
              {loading ? '...' : `${formatCompactMoney(todaySales)} CDF`}
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
            </div>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              Toutes boutiques <ArrowRight size={10}/>
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Produits</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Tag size={18}/></div>
          </div>
          <div className="text-xl font-black text-purple-600">
            {loading ? '...' : totalProductsCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Alertes Stock</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle size={18}/></div>
          </div>
          <div className="text-xl font-black text-rose-600">
            {loading ? '...' : lowStockProducts.length}
          </div>
        </div>
      </div>

      {/* SECTION DÉTAILLÉE : Suivi des Crédits & Tranches en cours (Avec affichage des produits) */}
<<<<<<< HEAD
     
=======
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={16} />
            </div>
            <h2 className="font-bold text-slate-800 text-sm">Suivi des Ventes par Tranches (Crédits)</h2>
          </div>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            {debtsList.length} en cours
          </span>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {debtsList.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400">Aucun crédit ou tranche en cours actuellement.</p>
            </div>
          ) : (
            debtsList.map((debt) => {
              const total = debt.total_amount || 0;
              const paid = debt.amount_paid || (total * 0.4); 
              const remaining = total - paid;
              
              // Récupération sécurisée des produits de la vente (items / products / cart)
              let itemsList = [];
              try {
                if (typeof debt.items === 'string') {
                  itemsList = JSON.parse(debt.items);
                } else if (Array.isArray(debt.items)) {
                  itemsList = debt.items;
                } else if (Array.isArray(debt.products)) {
                  itemsList = debt.products;
                }
              } catch (e) {
                itemsList = [];
              }

              return (
                <div key={debt.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{debt.client_name || 'Client comptant'}</p>
                      <p className="text-[10px] text-slate-500">{debt.client_phone || '+243...'}</p>
                    </div>
                    <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                      Échéance : {debt.due_date ? new Date(debt.due_date).toLocaleDateString() : '2026-09-05'}
                    </span>
                  </div>

                  {/* LISTE DES PRODUITS CONCERNÉS */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <ShoppingCart size={10} /> Produits concernés :
                    </span>
                    {itemsList.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">Détails des articles non disponibles</p>
                    ) : (
                      <div className="space-y-1 pt-1">
                        {itemsList.map((prod, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-700 font-medium">
                            <span>• {prod.name || prod.nom} <span className="text-[10px] text-slate-400">(x{prod.qty || prod.quantite || 1})</span></span>
                            <span className="font-bold">{formatMoney((prod.price || prod.prix_vente || 0) * (prod.qty || prod.quantite || 1))} CDF</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">TOTAL</span>
                      <span className="font-black text-slate-700">{formatMoney(total)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">VERSÉ</span>
                      <span className="font-black text-emerald-600">{formatMoney(paid)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">RESTE</span>
                      <span className="font-black text-rose-600">{formatMoney(remaining)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedTrancheDetail({
                        label: `Détails - ${debt.client_name || 'Client'}`,
                        count: 1,
                        total: total,
                        items: [debt]
                      });
                      setIsTrancheModalOpen(true);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    Encaissement / Gérer la tranche <ChevronRight size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
{/* Analyse par Tranche de Montant Global */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <DollarSign size={15} className="text-indigo-600" /> Analyse par Tranche de Montant (Jour)
          </h2>
        </div>

        <div className="space-y-2">
          {Object.entries(salesTranches).map(([key, tranche]) => (
            <div 
              key={key}
              onClick={() => {
                setSelectedTrancheDetail(tranche);
                setIsTrancheModalOpen(true);
              }}
              className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-100 flex justify-between items-center cursor-pointer transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-slate-800">{tranche.label}</p>
                <p className="text-[10px] text-slate-400">{tranche.count} transaction(s)</p>
              </div>
              <div className="text-right">
<<<<<<< HEAD
                <span className="font-black text-slate-900 text-xs">{formatMoney(tranche.total)} </span>
=======
                <span className="font-black text-slate-900 text-xs">{formatMoney(tranche.total)} CDF</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
                <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 justify-end mt-0.5">
                  Détails <ArrowRight size={10} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Produits en Alerte Stock */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
        <h2 className="font-bold text-slate-800 text-sm mb-2">
          Produits en Alerte (Stock &lt; 5) — {activeShop?.shop_name}
        </h2>
        
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-4">Chargement...</p>
        ) : lowStockProducts.length === 0 ? (
          <div className="p-4 text-center bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">Aucun produit en alerte dans cette boutique 🎉</p>
          </div>
        ) : (
          lowStockProducts.map((p) => (
            <div 
              key={p.id} 
              onClick={() => setSelectedProductForRestock(p)}
              className="bg-rose-50/60 p-3 rounded-xl border border-rose-100 flex justify-between items-center cursor-pointer hover:bg-rose-100/50 transition-colors"
            >
              <div>
                <div className="text-sm font-bold text-slate-800">{p.name || p.nom}</div>
<<<<<<< HEAD
                <div className="text-xs text-slate-500 font-semibold">{formatMoney(p.price || p.prix_vente || 0)} </div>
=======
                <div className="text-xs text-slate-500 font-semibold">{formatMoney(p.price || p.prix_vente || 0)} CDF</div>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  Stock : {p.qty !== undefined ? p.qty : p.quantite}
                </span>
                <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <Plus size={14} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modale des détails par Tranche */}
      {isTrancheModalOpen && selectedTrancheDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedTrancheDetail.label}</h3>
<<<<<<< HEAD
                <span className="text-xs text-slate-400">{selectedTrancheDetail.count} élément(s) - Total : {formatMoney(selectedTrancheDetail.total)} </span>
=======
                <span className="text-xs text-slate-400">{selectedTrancheDetail.count} élément(s) - Total : {formatMoney(selectedTrancheDetail.total)} CDF</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
              </div>
              <button 
                onClick={() => setIsTrancheModalOpen(false)} 
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 cursor-pointer"
              >
                <X size={18}/>
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {selectedTrancheDetail.items.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Aucune vente dans cette catégorie.</p>
              ) : (
                selectedTrancheDetail.items.map((item, idx) => {
                  let subItems = [];
                  try {
                    subItems = typeof item.items === 'string' ? JSON.parse(item.items) : (item.items || item.products || []);
                  } catch (e) { subItems = []; }

                  return (
                    <div key={item.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{item.client_name || 'Client comptant'}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
<<<<<<< HEAD
                        <span className="font-black text-emerald-600 text-xs">{formatMoney(item.total_amount)} </span>
=======
                        <span className="font-black text-emerald-600 text-xs">{formatMoney(item.total_amount)} CDF</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
                      </div>
                      {subItems.length > 0 && (
                        <div className="text-[11px] text-slate-600 pl-2 border-l-2 border-indigo-200">
                          {subItems.map((si, sidx) => (
                            <div key={sidx}>• {si.name || si.nom} (x{si.qty || si.quantite || 1})</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <button 
              onClick={() => setIsTrancheModalOpen(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modale Dettes / Crédits */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Crédits en attente</h3>
                <span className="text-xs text-slate-400">{debtsList.length} impayé(s)</span>
              </div>
              <button onClick={() => setIsDebtModalOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 cursor-pointer">
                <X size={18}/>
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {debtsList.map((debt) => {
                let itemsList = [];
                try {
                  itemsList = typeof debt.items === 'string' ? JSON.parse(debt.items) : (debt.items || debt.products || []);
                } catch(e) { itemsList = []; }

                return (
                  <div key={debt.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{debt.client_name || 'Client inconnu'}</p>
                        {debt.client_phone && <p className="text-[11px] text-slate-500">{debt.client_phone}</p>}
                      </div>
<<<<<<< HEAD
                      <span className="font-black text-rose-600 text-sm">{formatMoney(debt.total_amount)} </span>
=======
                      <span className="font-black text-rose-600 text-sm">{formatMoney(debt.total_amount)} CDF</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
                    </div>

                    {itemsList.length > 0 && (
                      <div className="bg-white p-2 rounded-lg border border-slate-100 text-[11px] text-slate-700">
                        {itemsList.map((it, i) => (
                          <div key={i}>• {it.name || it.nom} (x{it.qty || it.quantite || 1})</div>
                        ))}
                      </div>
                    )}

                    <button 
                      onClick={() => handlePayDebt(debt.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Marquer comme payé
                    </button>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setIsDebtModalOpen(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modale Ventes du jour globales */}
      {isSalesDetailOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Ventes du jour</h3>
                <span className="text-xs text-slate-400">Toutes vos boutiques</span>
              </div>
              <button onClick={() => setIsSalesDetailOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 cursor-pointer">
                <X size={18}/>
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Total Global Aujourd'hui</span>
<<<<<<< HEAD
              <p className="text-xl font-black text-emerald-700">{formatMoney(globalSalesTotal)} </p>
=======
              <p className="text-xl font-black text-emerald-700">{formatMoney(globalSalesTotal)} CDF</p>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {allShopsSalesToday.map((shopSale, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{shopSale.shopName}</p>
                    <p className="text-[10px] text-slate-400">{shopSale.count} vente(s) enregistrée(s)</p>
                  </div>
<<<<<<< HEAD
                  <span className="font-black text-slate-900 text-xs">{formatMoney(shopSale.total)} </span>
=======
                  <span className="font-black text-slate-900 text-xs">{formatMoney(shopSale.total)} CDF</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
                </div>
              ))}
            </div>

            <button 
              onClick={() => setIsSalesDetailOpen(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modale Valeur Stock */}
      {selectedDetail === 'stock' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Valeur du Stock</h3>
                <span className="text-xs text-slate-400">{activeShop?.shop_name}</span>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 cursor-pointer">
                <X size={18}/>
              </button>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center">
              <span className="text-[10px] font-bold text-blue-600 uppercase">Valeur Totale du Stock</span>
<<<<<<< HEAD
              <p className="text-xl font-black text-blue-700">{formatMoney(totalStockValue)} </p>
=======
              <p className="text-xl font-black text-blue-700">{formatMoney(totalStockValue)} CDF</p>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {dynamicBreakdown.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Aucune catégorie disponible</p>
              ) : (
                dynamicBreakdown.map((cat, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800 text-xs capitalize">{cat.category}</p>
                      <p className="text-[10px] text-slate-400">{cat.count}</p>
                    </div>
                    <span className="font-black text-slate-900 text-xs">{cat.value}</span>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => setSelectedDetail(null)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
{/* Modale Réapprovisionnement */}
      {selectedProductForRestock && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRestockSubmit} className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Réapprovisionner</h3>
                <span className="text-xs text-rose-600 font-semibold">{selectedProductForRestock.name || selectedProductForRestock.nom}</span>
              </div>
              <button type="button" onClick={() => setSelectedProductForRestock(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 cursor-pointer">
                <X size={18}/>
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
              Stock actuel : <span className="font-bold text-slate-900">{selectedProductForRestock.qty !== undefined ? selectedProductForRestock.qty : selectedProductForRestock.quantite} pcs</span>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Quantité à ajouter</label>
              <input 
                type="number" 
                min="1" 
                placeholder="Ex: 10" 
                value={addedQty} 
                onChange={(e) => setAddedQty(e.target.value)} 
                required
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setSelectedProductForRestock(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-200 cursor-pointer"
              >
                Valider l'ajout
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
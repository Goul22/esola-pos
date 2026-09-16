import { useState, useEffect } from 'react';
import { Search, FileDown, Store, AlertTriangle, PlusCircle, Calendar, User, ShoppingBag, ChevronDown } from 'lucide-react';
import { supabase } from '../../supabase';
import { jsPDF } from 'jspdf';
import toast, { Toaster } from 'react-hot-toast';

<<<<<<< HEAD


export default function RapportView() {

  // 1. ÉTAT POUR LA DEVISE DYNAMIQUE (synchronisée avec ReglageView)
  const [currency, setCurrency] = useState(localStorage.getItem('shop_currency') || 'CDF');

  useEffect(() => {
    const handleCurrencyChange = (event) => {
      setCurrency(event.detail);
    };
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange);
    };
  }, []);

  // 2. FONCTION FORMATMONEY MISE À JOUR AVEC LE SYMBOLE
  // Bon
const formatMoney = (amount) => {
  const currency = localStorage.getItem('shop_currency') || 'USD';
  const numericAmount = Number(amount || 0);
  
  // Remplace tous les espaces spéciaux par un espace normal pour éviter le bug du '/' dans jsPDF
  const formattedNumber = numericAmount.toLocaleString().replace(/[\s\u00A0\u202F]/g, ' ');

  let symbol = currency;
  if (currency === 'USD') symbol = '$';
  else if (currency === 'EUR') symbol = '€';
  else if (currency === 'FCFA') symbol = 'Fr';
  else if (currency === 'CDF') symbol = 'CDF';

  return `${formattedNumber} ${symbol}`;
};
=======
const formatMoney = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export default function RapportView() {
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [filterType, setFilterType] = useState('all'); // 'all', 'comptant', ou 'tranche'
=======
  
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
  const [shops, setShops] = useState([]);
  const [activeShop, setActiveShop] = useState(null);

  // Gestion rôle utilisateur
  const [userRole, setUserRole] = useState('vendeur');
  const [userName, setUserName] = useState('');

  // Demandes d'annulation en attente (pour le gérant)
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  // Modal pour ajouter une tranche / versement
  const [showAddTrancheModal, setShowAddTrancheModal] = useState(false);
  const [trancheAmountInput, setTrancheAmountInput] = useState('');

  // États pour les Modals pro
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', placeholder: '', value: '', onConfirm: null });

  const isUserGerant = ['shop_owner', 'admin', 'administrateur', 'owner', 'sous-admin'].includes(userRole.toLowerCase());

  useEffect(() => {
    const localUserData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const role = (localStorage.getItem('user_role') || localUserData.role || 'vendeur').toLowerCase();
    const name = localStorage.getItem('user_name') || localUserData.name || localUserData.username || 'Vendeur';
    
    setUserRole(role);
    setUserName(name);

    initData(role, localUserData);
  }, []);

  useEffect(() => {
    if (activeShop) {
      fetchSales(activeShop);
      if (isUserGerant) {
        fetchCancellationRequests(activeShop);
      }
    }
  }, [activeShop, userRole]);

  const initData = async (role, localUserData) => {
    setLoading(true);
    try {
      let shopsData = [];
      const userAssignedShop = localUserData.shop || localStorage.getItem('esola_current_shop') || localStorage.getItem('current_shop_name') || 'Boutique Principale';
      const currentLicense = localStorage.getItem('esola_active_license') || localUserData.license_key;
      const userEmail = localStorage.getItem('user_email') || localUserData.email;

      // Récupération exclusive depuis Supabase
      try {
        let query = supabase.from('shops').select('*');
        if (currentLicense) {
          query = query.eq('license_key', currentLicense);
        } else if (userEmail) {
          query = query.eq('owner', userEmail);
        }
        const { data: sData, error } = await query;
        if (!error && sData && sData.length > 0) {
          shopsData = sData;
        }
      } catch (supErr) {
        console.warn("Erreur Supabase lors de la récupération des boutiques:", supErr);
        toast.error("Impossible de récupérer la liste des boutiques.");
      }

      if (shopsData.length === 0) {
        shopsData = [{ id: 'default-shop-id', shop_name: userAssignedShop }];
      }

      setShops(shopsData);

      let targetShop;
      if (role === 'vendeur') {
        targetShop = shopsData.find(s => s.shop_name?.toLowerCase() === userAssignedShop?.toLowerCase()) || { id: 'default-shop-id', shop_name: userAssignedShop };
      } else {
        const savedShopId = localStorage.getItem('current_shop_id');
        targetShop = shopsData.find(s => s.id === savedShopId) || shopsData[0];
      }
      
      if (targetShop) {
        setActiveShop(targetShop);
        localStorage.setItem('current_shop_id', targetShop.id);
        localStorage.setItem('current_shop_name', targetShop.shop_name);
        localStorage.setItem('esola_current_shop', targetShop.shop_name);
      }
    } catch (err) {
      console.error("Init error:", err);
      const fallbackShop = { id: 'default-shop-id', shop_name: 'Boutique Principale' };
      setShops([fallbackShop]);
      setActiveShop(fallbackShop);
    } finally {
      setLoading(false);
    }
  };

  const handleShopChange = (e) => {
    const selectedShopId = e.target.value;
    const newActiveShop = shops.find(s => s.id === selectedShopId);
    
    if (newActiveShop) {
      setActiveShop(newActiveShop);
      localStorage.setItem('current_shop_id', newActiveShop.id);
      localStorage.setItem('current_shop_name', newActiveShop.shop_name);
      localStorage.setItem('esola_current_shop', newActiveShop.shop_name);
      toast.success(`Boutique changée pour : ${newActiveShop.shop_name}`);
    }
  };

  const fetchSales = async (shop) => {
    if (!shop) return;
    setLoading(true);
    try {
      let salesData = [];
      const shopId = typeof shop === 'object' ? shop.id : shop;
      const shopName = typeof shop === 'object' ? shop.shop_name : shop;

      // Récupération exclusive depuis Supabase
      try {
        let { data, error } = await supabase.from('sales').select('*').eq('shop_id', shopId);
        if ((!data || data.length === 0) && shopName) {
          const resName = await supabase.from('sales').select('*').eq('shop_name', shopName);
          if (!resName.error && resName.data) data = resName.data;
        }
        if (!error && data && data.length > 0) {
          salesData = data;
        }
      } catch (netErr) {
        console.error("Erreur de récupération des ventes Supabase:", netErr);
        toast.error("Impossible de charger les ventes depuis le serveur.");
      }

      salesData.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      const formattedSales = salesData.map((sale) => {
        const dateObj = new Date(sale.created_at);
        const formattedDate = !isNaN(dateObj.getTime()) 
          ? dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
          : 'Inconnue';
        
        const formattedTime = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          : '';

        let rawItems = sale.items || sale.products || [];
        if (typeof rawItems === 'string') {
          try { rawItems = JSON.parse(rawItems); } catch(e) { rawItems = []; }
        }

        const calculatedItemsTotal = rawItems.reduce((sum, item) => {
          const q = Number(item.qty || item.quantite || item.quantity || 1);
          const p = Number(item.price || item.prix || 0);
          return sum + (q * p);
        }, 0);

        const totalNum = calculatedItemsTotal > 0 ? calculatedItemsTotal : Number(sale.total_amount || sale.total || 0);
        
        let amountPaid = sale.amount_paid !== undefined && sale.amount_paid !== null ? Number(sale.amount_paid) : totalNum;
        if (amountPaid > totalNum && sale.payment_type !== 'tranche') {
          amountPaid = totalNum;
        }
        
        const remainingDue = Math.max(0, totalNum - amountPaid);

        let rawTranches = sale.tranches || [];
        if (typeof rawTranches === 'string') {
          try { rawTranches = JSON.parse(rawTranches); } catch(e) { rawTranches = []; }
        }
        return {
          id: sale.id,
          date: formattedDate,
          time: formattedTime,
          rawDate: sale.created_at,
          seller: sale.seller_name || sale.vendeur || 'Vendeur',
          clientName: sale.client_name || sale.client || 'Client comptoir',
          paymentType: sale.payment_type || 'cash',
<<<<<<< HEAD
          total: `${formatMoney(totalNum)} `,
=======
          total: `${formatMoney(totalNum)} CDF`,
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
          totalNum: totalNum,
          amountPaid: amountPaid,
          remainingDue: remainingDue,
          items: Array.isArray(rawItems) ? rawItems : [],
          tranches: Array.isArray(rawTranches) ? rawTranches : []
        };
      });

      setReports(formattedSales);
    } catch (err) {
      console.error("Fetch sales error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTranchePayment = async () => {
    if (!selectedReport) return;
    const addVal = Number(trancheAmountInput);
    if (isNaN(addVal) || addVal <= 0) {
      toast.error("Veuillez entrer un montant valide.");
      return;
    }

    if (addVal > selectedReport.remainingDue) {
      toast.error("Le montant dépasse le reste dû.");
      return;
    }

    try {
      const newAmountPaid = selectedReport.amountPaid + addVal;
      const newRemainingDue = Math.max(0, selectedReport.totalNum - newAmountPaid);
      const newTranchesList = [
        ...(selectedReport.tranches || []),
        { date: new Date().toISOString(), amount: addVal, seller: userName }
      ];

      const updatePayload = {
        amount_paid: newAmountPaid,
        remaining_balance: newRemainingDue,
        tranches: JSON.stringify(newTranchesList),
        payment_status: newRemainingDue === 0 ? 'soldé' : 'en_cours'
      };

      if (selectedReport.id) {
        const { error } = await supabase.from('sales').update(updatePayload).eq('id', selectedReport.id);
        if (error) throw error;
      }

      toast.success("Versement de tranche ajouté avec succès !");
      setShowAddTrancheModal(false);
      setTrancheAmountInput('');
      
      const updatedReport = {
        ...selectedReport,
        amountPaid: newAmountPaid,
        remainingDue: newRemainingDue,
        tranches: newTranchesList
      };
      setSelectedReport(updatedReport);
      fetchSales(activeShop);
    } catch (err) {
      console.error("Erreur versement tranche:", err);
      toast.error("Erreur lors de l'enregistrement du versement sur le serveur.");
    }
  };

  const fetchCancellationRequests = async (shop) => {
    if (!shop) return;
    const shopId = typeof shop === 'object' ? shop.id : shop;
    try {
      const { data, error } = await supabase
        .from('cancellation_requests')
        .select('*')
        .eq('shop_id', shopId)
        .eq('status', 'pending');
      
      if (!error && data) {
        setCancellationRequests(data);
      }
    } catch (err) {
      console.warn("Erreur chargement demandes annulation depuis Supabase:", err);
    }
  };

  const executeApproval = async (request) => {
    try {
      if (request.sale_id) {
        await supabase.from('sales').delete().eq('id', request.sale_id);
      }

      if (request.id) {
        await supabase.from('cancellation_requests').update({ status: 'approved' }).eq('id', request.id);
      }

      const targetSale = reports.find(r => r.id === request.sale_id);
      if (targetSale && targetSale.items) {
        for (const item of targetSale.items) {
          const prodId = item.id || item.product_id;
          const qtyToRestore = Number(item.qty || item.quantite || item.quantity || 0);
          if (prodId && qtyToRestore > 0) {
            const { data: pData } = await supabase.from('products').select('stock').eq('id', prodId).single();
            if (pData) {
              await supabase.from('products').update({ stock: (Number(pData.stock) || 0) + qtyToRestore }).eq('id', prodId);
            }
          }
        }
      }

      toast.success("Vente annulée et stock restauré avec succès.");
      fetchSales(activeShop);
      fetchCancellationRequests(activeShop);
      if (cancellationRequests.length <= 1) setShowRequestsModal(false);
    } catch (err) {
      console.error("Erreur approbation annulation:", err);
      toast.error("Erreur lors de l'approbation.");
    }
  };

  const handleApproveCancellation = (request) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmer l'annulation",
      message: `Voulez-vous vraiment approuver l'annulation de la vente pour ${request.client_name} demandée par ${request.seller} ?`,
      onConfirm: () => executeApproval(request)
    });
  };

  const handleRejectCancellation = async (request) => {
    try {
      if (request.id) {
        await supabase.from('cancellation_requests').update({ status: 'rejected' }).eq('id', request.id);
      }
      toast.success("Demande d'annulation rejetée.");
      fetchCancellationRequests(activeShop);
      if (cancellationRequests.length <= 1) setShowRequestsModal(false);
    } catch (err) {
      console.error("Erreur rejet:", err);
      toast.error("Erreur lors du rejet sur le serveur.");
    }
  };

  const executeAdminCancel = async (report) => {
    try {
      if (report.id) {
        await supabase.from('sales').delete().eq('id', report.id);
      }

      if (report.items && report.items.length > 0) {
        for (const item of report.items) {
          const prodId = item.id || item.product_id;
          const qtyToRestore = Number(item.qty || item.quantite || item.quantity || 0);

          if (prodId && qtyToRestore > 0) {
            const { data: pData } = await supabase.from('products').select('stock').eq('id', prodId).single();
            if (pData) {
              const newStock = (Number(pData.stock) || 0) + qtyToRestore;
              await supabase.from('products').update({ stock: newStock }).eq('id', prodId);
            }
          }
        }
      }

      toast.success("Vente annulée et stock restauré avec succès.");
      setSelectedReport(null);
      fetchSales(activeShop);
    } catch (err) {
      console.error("Erreur annulation vente:", err);
      toast.error("Erreur lors de l'annulation de la vente sur le serveur.");
    }
  };

  const handleCancelSaleAdmin = (report) => {
    setConfirmModal({
      isOpen: true,
      title: "Annulation de vente (Gérant)",
      message: "Êtes-vous sûr de vouloir annuler cette vente ? Le stock sera automatiquement restauré.",
      onConfirm: () => executeAdminCancel(report)
    });
  };

  const submitCancellationRequest = async (reason, report) => {
    if (!reason || !reason.trim()) return;
    try {
      const currentLicense = localStorage.getItem('esola_active_license') || localStorage.getItem('license_key') || 'LICENCE-DEFAUT';
      const requestData = {
        shop_id: activeShop?.id,
        shop_name: activeShop?.shop_name,
        sale_id: report.id,
        client_name: report.clientName,
        total: report.total,
        seller: userName,
        reason: reason.trim(),
        license_key: currentLicense,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('cancellation_requests').insert([requestData]);
      if (error) throw error;

      toast.success("Demande d'annulation envoyée au gérant avec succès.");
      setSelectedReport(null);
    } catch (err) {
      console.error("Erreur envoi demande:", err);
      toast.error("Erreur lors de l'envoi de la demande au serveur.");
    }
  };
const handleRequestCancelSale = (report) => {
    setPromptModal({
      isOpen: true,
      title: "Demande d'annulation",
      placeholder: "Veuillez indiquer la raison de la demande...",
      value: '',
      onConfirm: (val) => submitCancellationRequest(val, report)
    });
  };

<<<<<<< HEAD
const exportInvoicePDF = (report) => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 160] }); // Légèrement allongé pour inclure les tranches si besoin
    
    // --- EN-TÊTE DE LA BOUTIQUE ---
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text(activeShop?.shop_name || "ESOLA SHOP", 40, 8, { align: "center" });
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text(activeShop?.address || "Kinshasa, RDC", 40, 12, { align: "center" });
    doc.text("----------------------------------------------------------------", 40, 15, { align: "center" });

    // --- INFORMATIONS DE LA VENTE ---
    doc.setFontSize(7.5);
    doc.text(`Reçu N° : ${report.id}`, 5, 20);
    doc.text(`Date : ${report.date} à ${report.time}`, 5, 24);
    doc.text(`Client : ${report.clientName}`, 5, 28);
    doc.text(`Vendeur : ${report.seller}`, 5, 32);
    
    const isTranche = report.paymentType === 'tranche' || report.paymentType === 'credit';
    const typeLabel = isTranche ? 'Paiement par Tranche' : 'Paiement Comptant';
    doc.text(`Type : ${typeLabel}`, 5, 36);
    
    doc.text("----------------------------------------------------------------", 40, 40, { align: "center" });

    // --- LISTE DES ARTICLES ---
    let y = 45;
    doc.setFont("Helvetica", "bold");
    doc.text("Articles", 5, y);
    doc.text("Total", 75, y, { align: "right" });
    y += 4;
    doc.setFont("Helvetica", "normal");

    report.items.forEach((item) => {
      const name = item.name || item.product_name || 'Article';
      const qty = Number(item.qty || item.quantite || item.quantity || 1);
      const price = Number(item.price || item.prix || 0);
      
      // Gestion des noms longs sur le ticket thermique
      doc.text(`${qty}x ${name}`, 5, y);
      doc.text(`${formatMoney(price * qty)}`, 75, y, { align: "right" });
      y += 5;
    });

    doc.text("----------------------------------------------------------------", 40, y, { align: "center" });
    y += 5;

    // --- TOTAUX & TRANCHES ---
    doc.setFont("Helvetica", "bold");
    doc.text("TOTAL GÉNÉRAL :", 5, y);
    doc.text(`${report.total}`, 75, y, { align: "right" });
    y += 6;

    if (isTranche) {
      doc.setFontSize(7.5);
      doc.setFont("Helvetica", "normal");
      doc.text(`Montant payé :`, 5, y);
      doc.text(`${formatMoney(report.amountPaid || 0)} `, 75, y, { align: "right" });
      y += 5;

     doc.setFont("Helvetica", "bold");
doc.text("TOTAL GÉNÉRAL :", 5, y);

// Extrait proprement la valeur numérique du total (même s'il y a du texte ou des slashs dedans)
const rawTotal = Number(String(report.total || 0).replace(/[^0-9.-]+/g, ""));
doc.text(`${formatMoney(rawTotal)}`, 75, y, { align: "right" });
y += 6;

      // Historique des tranches sur le ticket si existant
      if (report.tranches && report.tranches.length > 0) {
        doc.setFont("Helvetica", "bold");
        doc.text("Historique des versements :", 5, y);
        y += 4;
        doc.setFont("Helvetica", "normal");
        report.tranches.forEach((t) => {
          const tDate = new Date(t.date).toLocaleDateString();
          doc.text(`- ${tDate} (${t.seller})`, 5, y);
          doc.text(`+${formatMoney(t.amount)}`, 75, y, { align: "right" });
          y += 4;
        });
        y += 2;
      }
    }

    // --- PIED DE PAGE ---
    doc.text("----------------------------------------------------------------", 40, y, { align: "center" });
    y += 5;
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7);
    doc.text("Merci pour votre confiance !", 40, y, { align: "center" });

    doc.save(`recu_${report.id}.pdf`);
  };
 const filteredReports = reports.filter(report => {
  // Filtre de recherche textuelle
  const matchesSearch = 
    report.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.seller?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.items?.some(i => (i.name || i.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  // Filtre par type (Tous, Comptant, ou Tranche)
  const isTranche = report.paymentType === 'tranche' || report.paymentType === 'credit';
  if (filterType === 'comptant' && isTranche) return false;
  if (filterType === 'tranche' && !isTranche) return false;

  return matchesSearch;
});
=======
  const exportInvoicePDF = (report) => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 150] });
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text(activeShop?.shop_name || "ESOLA SHOP", 40, 10, { align: "center" });
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Date: ${report.date} à ${report.time}`, 5, 18);
    doc.text(`Vendeur: ${report.seller}`, 5, 22);
    doc.text(`Client: ${report.clientName}`, 5, 26);
    doc.text("------------------------------------------------", 5, 30);

    let y = 35;
    report.items.forEach((item) => {
      const name = item.name || item.product_name || 'Article';
      const qty = item.qty || item.quantite || item.quantity || 1;
      const price = item.price || item.prix || 0;
      doc.text(`${name} (x${qty})`, 5, y);
      doc.text(`${formatMoney(price * qty)}`, 75, y, { align: "right" });
      y += 6;
    });

    doc.text("------------------------------------------------", 5, y);
    y += 5;
    doc.setFont("Helvetica", "bold");
    doc.text(`TOTAL: ${report.total}`, 5, y);

    doc.save(`recu_${report.id}.pdf`);
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = searchQuery === '' || 
      r.seller.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.items.some(i => (i.name || i.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc

  const totalRevenue = reports.reduce((acc, curr) => acc + curr.totalNum, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 text-slate-800">
      <Toaster position="top-right" />

      {/* En-tête avec Sélecteur de Boutique */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 w-full sm:w-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full inline-block mb-1">
            Rapports & Ventes
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Historique des Ventes</h1>
          
          {/* Sélecteur de boutique intégré à l'en-tête (visible uniquement pour les rôles gérants/admins s'ils gèrent plusieurs boutiques) */}
          <div className="mt-2 flex items-center gap-2">
            <Store size={14} className="text-indigo-600 shrink-0" />
            {isUserGerant && shops.length > 1 ? (
              <div className="relative inline-block w-full max-w-[200px]">
                <select
                  value={activeShop?.id || ''}
                  onChange={handleShopChange}
                  className="appearance-none w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shop_name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <ChevronDown size={12} />
                </div>
              </div>
            ) : (
              <span className="font-bold text-slate-700 text-sm">
                {activeShop?.shop_name || 'Chargement...'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {isUserGerant && (
            <button
              onClick={() => setShowRequestsModal(true)}
              className="relative bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-indigo-100"
            >
              <AlertTriangle size={16} />
              <span className="hidden sm:inline">Demandes d'annulation</span>
              <span className="sm:hidden">Annulations</span>
              {cancellationRequests.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cancellationRequests.length}
                </span>
              )}
            </button>
          )}

          <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Chiffre d'affaires</span>
<<<<<<< HEAD
            <span className="text-sm font-black text-emerald-600">{formatMoney(totalRevenue)} </span>
=======
            <span className="text-sm font-black text-emerald-600">{formatMoney(totalRevenue)} CDF</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Barre de recherche & Filtres */}
<div className="flex flex-col gap-3">
  <div className="relative flex-1">
    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      placeholder="Rechercher par client, vendeur ou produit..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full bg-white pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
    />
  </div>

  {/* Boutons de filtre rapides */}
  <div className="flex items-center gap-2 overflow-x-auto pb-1">
    <button
      onClick={() => setFilterType('all')}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
        filterType === 'all'
          ? 'bg-slate-900 text-white shadow-sm'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      Toutes les ventes
    </button>
    <button
      onClick={() => setFilterType('comptant')}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
        filterType === 'comptant'
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      Comptant
    </button>
    <button
      onClick={() => setFilterType('tranche')}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
        filterType === 'tranche'
          ? 'bg-amber-600 text-white shadow-sm'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      Par Tranche
    </button>
  </div>
</div>
=======
      {/* Barre de recherche */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par client, vendeur ou produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>
      </div>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc

      {/* LISTE DES VENTES EN CARTES (MOBILE-FRIENDLY SANS SCROLL HORIZONTAL) */}
      <div className="space-y-3">
        {loading ? (
           <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-100 text-xs">
           Chargement des ventes depuis le serveur...
         </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-100 text-xs">
            Aucune vente enregistrée pour {activeShop?.shop_name}.
          </div>
        ) : (
          filteredReports.map((report) => {
            const isTranche = report.paymentType === 'tranche' || report.paymentType === 'credit';
            let badgeText = 'Comptant';
            let badgeClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';

            if (isTranche) {
              if (report.remainingDue <= 0) {
                badgeText = 'Soldé';
                badgeClass = 'bg-blue-50 text-blue-600 border-blue-200';
              } else {
                badgeText = 'En cours';
                badgeClass = 'bg-amber-50 text-amber-600 border-amber-200';
              }
            }

            // Résumé des produits achetés
            const itemsSummary = report.items.map(i => `${i.qty || i.quantite || i.quantity || 1}x ${i.name || i.product_name || 'Article'}`).join(', ');

            return (
              <div 
                key={report.id} 
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col gap-3"
              >
                {/* Ligne 1 : Client + Date & Heure */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <User size={15} />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-xs font-black text-slate-900 truncate">{report.clientName}</h3>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                        <Calendar size={11} className="shrink-0" /> {report.date} à {report.time} • Vendeur: <span className="font-semibold text-slate-600">{report.seller}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-xl text-[10px] font-extrabold border shrink-0 ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>

                {/* Ligne 2 : Produits achetés */}
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 flex items-center gap-2 text-xs text-slate-700">
                  <ShoppingBag size={15} className="text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{itemsSummary || 'Aucun détail article'}</span>
                </div>

                {/* Ligne 3 : Total & Bouton d'action */}
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Général</span>
                    <span className="text-sm font-black text-slate-900">{report.total}</span>
                  </div>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl font-bold text-xs transition-all cursor-pointer border border-indigo-100 shadow-2xs"
                  >
                    Voir Facture
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE DÉTAILS DE LA VENTE */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900">Détails de la Vente / Facture</h2>
              <button 
                onClick={() => setSelectedReport(null)} 
                className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <p><strong>Date :</strong> {selectedReport.date} à {selectedReport.time}</p>
              <p><strong>Client :</strong> {selectedReport.clientName}</p>
              <p><strong>Vendeur :</strong> {selectedReport.seller}</p>
              <p><strong>Type :</strong> {selectedReport.paymentType === 'tranche' ? 'Par Tranche' : 'Comptant'}</p>
            </div>

            {/* Articles achetés corrigés */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Articles achetés :</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {selectedReport.items.map((item, idx) => {
                  const qty = Number(item.qty || item.quantite || item.quantity || 1);
                  const price = Number(item.price || item.prix || 0);
                  const lineTotal = qty * price;
<<<<<<< HEAD
                  return (
                    <div key={idx} className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center justify-between">
                      <div className="overflow-hidden pr-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name || item.product_name || 'Article'}</p>
                        <p className="text-[10px] text-slate-500">Qté : {qty} × {formatMoney(price)}</p>
                      </div>
                      <span className="text-xs font-black text-slate-900 shrink-0">{formatMoney(lineTotal)}</span>
=======
return (
                    <div key={idx} className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center justify-between">
                      <div className="overflow-hidden pr-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name || item.product_name || 'Article'}</p>
                        <p className="text-[10px] text-slate-500">Qté : {qty} × {formatMoney(price)} CDF</p>
                      </div>
                      <span className="text-xs font-black text-slate-900 shrink-0">{formatMoney(lineTotal)} CDF</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totaux & Gestion des tranches si applicable */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between font-black text-sm">
                <span>Total Général :</span>
                <span className="text-emerald-600">{selectedReport.total}</span>
              </div>

              {(selectedReport.paymentType === 'tranche' || selectedReport.paymentType === 'credit') && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl space-y-2 text-amber-900">
                  <div className="flex justify-between">
                    <span>Total payé à ce jour :</span>
<<<<<<< HEAD
                    <span className="font-bold">{formatMoney(selectedReport.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reste dû :</span>
                    <span className="font-black text-rose-600">{formatMoney(selectedReport.remainingDue)}</span>
=======
                    <span className="font-bold">{formatMoney(selectedReport.amountPaid)} CDF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reste dû :</span>
                    <span className="font-black text-rose-600">{formatMoney(selectedReport.remainingDue)} CDF</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
                  </div>

                  {/* Historique des tranches versées */}
                  {selectedReport.tranches && selectedReport.tranches.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-amber-200/60 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Historique des versements :</span>
                      {selectedReport.tranches.map((t, tIdx) => (
                        <div key={tIdx} className="flex justify-between text-[11px] text-amber-800">
                          <span>{new Date(t.date).toLocaleDateString()} ({t.seller})</span>
<<<<<<< HEAD
                          <span className="font-bold">+{formatMoney(t.amount)}</span>
=======
                          <span className="font-bold">+{formatMoney(t.amount)} CDF</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bouton pour ajouter un versement si non soldé */}
                  {selectedReport.remainingDue > 0 && (
                    <button
                      onClick={() => setShowAddTrancheModal(true)}
                      className="w-full mt-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <PlusCircle size={15} />
                      <span>Ajouter un versement (Tranche)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
<<<<<<< HEAD
=======

>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
            {/* Actions (PDF & Annulation) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => exportInvoicePDF(selectedReport)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <FileDown size={15} />
                <span>Télécharger PDF</span>
              </button>

              <div className="flex gap-2">
                {isUserGerant ? (
                  <button
                    onClick={() => handleCancelSaleAdmin(selectedReport)}
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold border border-rose-200 transition-all text-center cursor-pointer"
                  >
                    Annuler la vente (Gérant)
                  </button>
                ) : (
                  <button
                    onClick={() => handleRequestCancelSale(selectedReport)}
                    className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-2xl text-xs font-bold border border-amber-200 transition-all text-center cursor-pointer"
                  >
                    Demander l'annulation
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL POUR AJOUTER UNE TRANCHE */}
      {showAddTrancheModal && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl text-slate-900">
            <h3 className="text-sm font-extrabold text-slate-900">Nouveau versement (Tranche)</h3>
            <p className="text-xs text-slate-500">
              Reste dû : <span className="font-bold text-rose-600">{formatMoney(selectedReport.remainingDue)} CDF</span>
            </p>
            
            <input
              type="number"
              placeholder="Montant payé (en CDF)..."
              value={trancheAmountInput}
              onChange={(e) => setTrancheAmountInput(e.target.value)}
              className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-bold"
              autoFocus
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddTrancheModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleAddTranchePayment}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DEMANDES D'ANNULATION (POUR GÉRANT) */}
      {showRequestsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900">Demandes d'annulation en attente</h2>
              <button onClick={() => setShowRequestsModal(false)} className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
            </div>

            {cancellationRequests.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-xs">Aucune demande d'annulation en attente.</p>
            ) : (
              <div className="space-y-3">
                {cancellationRequests.map((req, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Client : {req.client_name}</p>
                        <p className="text-[11px] text-slate-500">Demandé par : <span className="font-semibold text-slate-700">{req.seller}</span></p>
                      </div>
                      <span className="text-xs font-black text-emerald-600">{req.total}</span>
                    </div>
                    <p className="text-xs bg-white p-2.5 rounded-xl border border-slate-100 text-slate-700">
                      <strong>Raison :</strong> {req.reason}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApproveCancellation(req)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Approuver & Restaurer stock
                      </button>
                      <button
                        onClick={() => handleRejectCancellation(req)}
                        className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMATION GÉNÉRIQUE */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl text-slate-900">
            <h3 className="text-sm font-extrabold text-slate-900">{confirmModal.title}</h3>
            <p className="text-xs text-slate-600">{confirmModal.message}</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROMPT GÉNÉRIQUE */}
      {promptModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl text-slate-900">
            <h3 className="text-sm font-extrabold text-slate-900">{promptModal.title}</h3>
            <input
              type="text"
              placeholder={promptModal.placeholder}
              value={promptModal.value}
              onChange={(e) => setPromptModal({ ...promptModal, value: e.target.value })}
              className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPromptModal({ isOpen: false, title: '', placeholder: '', value: '', onConfirm: null })}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (promptModal.onConfirm) promptModal.onConfirm(promptModal.value);
                  setPromptModal({ isOpen: false, title: '', placeholder: '', value: '', onConfirm: null });
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { supabase } from '../../supabase';
import { db } from '../../db';
import { jsPDF } from 'jspdf';
import { Plus, Trash2, Printer, Download, X, CheckCircle2, User, Phone, DollarSign, AlertCircle } from 'lucide-react';

export default function VenteView() {
  const [shops, setShops] = useState([]);
  const [activeShopId, setActiveShopId] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  // États du formulaire de vente & client
  const [clientName, setClientName] = useState('Client Anonyme');
  const [clientPhone, setClientPhone] = useState('');
  const [paymentType, setPaymentType] = useState('cash'); // 'cash' ou 'tranche'
  const [amountPaid, setAmountPaid] = useState('');

  // Modale de facture validée
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentSaleInvoice, setCurrentSaleInvoice] = useState(null);

  // État pour les messages Toast personnalisés
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  // 1. Charger les boutiques au démarrage (multi-critères : license, email, user_id, dexie)
  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    try {
      let shopsData = [];
      const currentLicense = localStorage.getItem('esola_active_license') || JSON.parse(localStorage.getItem('user_data') || '{}').license_key || '';
      const currentEmail = localStorage.getItem('user_email') || JSON.parse(localStorage.getItem('user_data') || '{}').email || '';
      const userAssignedShop = localStorage.getItem('esola_current_shop') || localStorage.getItem('current_shop_name') || 'Boutique Principale';

      // Tentative Supabase
      if (navigator.onLine) {
        try {
          let query = supabase.from('shops').select('*');
          if (currentLicense) {
            query = query.eq('license_key', currentLicense);
          } else if (currentEmail) {
            query = query.eq('owner', currentEmail);
          }
          const { data: sData, error } = await query;
          if (!error && sData && sData.length > 0) {
            shopsData = sData;
          } else if (currentEmail) {
            const { data: userData } = await supabase.from('users').select('id').eq('email', currentEmail).single();
            if (userData) {
              const { data: sData2 } = await supabase.from('shops').select('*').eq('user_id', userData.id);
              if (sData2 && sData2.length > 0) shopsData = sData2;
            }
          }
        } catch (supErr) {
          console.warn("Erreur Supabase shops:", supErr);
        }
      }

      // Si vide, vérifier Dexie (local)
      if (shopsData.length === 0 && db && db.shops) {
        shopsData = await db.shops.toArray();
      }

      // Fallback ultime
=======
import { Search, ShoppingBag, Plus, CheckCircle2, Store, Trash2, User, Phone, Printer, Download, X } from 'lucide-react';
import { supabase } from '../../supabase';
import toast, { Toaster } from 'react-hot-toast';

const formatMoney = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export default function VenteView() {
  const [shops, setShops] = useState([]);
  const [activeShop, setActiveShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Panier
  const [cart, setCart] = useState([]);

  // Modal Paiement / Tranche
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [paymentType, setPaymentType] = useState('cash'); // 'cash' ou 'tranche'
  const [amountPaidInput, setAmountPaidInput] = useState('');

  // Modal Facture après vente
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentSaleInvoice, setCurrentSaleInvoice] = useState(null);

  // Rôle & Utilisateur
  const [userName, setUserName] = useState('');
  const [currentLicense, setCurrentLicense] = useState('');
  const [userRole, setUserRole] = useState('vendeur');

  useEffect(() => {
    const localUserData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const role = (localStorage.getItem('user_role') || localUserData.role || 'vendeur').toLowerCase();
    const name = localStorage.getItem('user_name') || localUserData.name || localUserData.username || 'Vendeur';
    const license = localStorage.getItem('esola_active_license') || localUserData.license_key || localStorage.getItem('license_key') || '';
    
    setUserRole(role);
    setUserName(name);
    setCurrentLicense(license);

    initShops(license, localUserData);
  }, []);

  useEffect(() => {
    if (activeShop?.id) {
      fetchProducts(activeShop.id);
    }
  }, [activeShop]);

  const initShops = async (license, localUserData) => {
    setLoading(true);
    try {
      let shopsData = [];
      const userAssignedShop = localUserData.shop || localStorage.getItem('esola_current_shop') || localStorage.getItem('current_shop_name') || 'Boutique Principale';
      const userEmail = localStorage.getItem('user_email') || localUserData.email;

      let query = supabase.from('shops').select('*');
      if (license) {
        query = query.eq('license_key', license);
      } else if (userEmail) {
        query = query.eq('owner', userEmail);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        shopsData = data;
      }

>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
      if (shopsData.length === 0) {
        shopsData = [{ id: 'default-shop-id', shop_name: userAssignedShop }];
      }

      setShops(shopsData);

<<<<<<< HEAD
      const savedShopId = localStorage.getItem('current_shop_id') || localStorage.getItem('active_shop_id');
      const targetShop = shopsData.find(s => s.id === savedShopId || s.shop_name === userAssignedShop) || shopsData[0];
      
      if (targetShop) {
        setActiveShopId(targetShop.id);
        localStorage.setItem('current_shop_id', targetShop.id);
        localStorage.setItem('current_shop_name', targetShop.shop_name || targetShop.name);
        localStorage.setItem('esola_current_shop', targetShop.shop_name || targetShop.name);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des boutiques :", err);
      const fallback = [{ id: 'default-shop-id', shop_name: 'Boutique Principale' }];
      setShops(fallback);
      setActiveShopId(fallback[0].id);
=======
      const savedShopId = localStorage.getItem('current_shop_id');
      let targetShop = shopsData.find(s => s.id === savedShopId) || shopsData.find(s => s.shop_name?.toLowerCase() === userAssignedShop?.toLowerCase()) || shopsData[0];

      if (targetShop) {
        setActiveShop(targetShop);
        localStorage.setItem('current_shop_id', targetShop.id);
        localStorage.setItem('current_shop_name', targetShop.shop_name);
        localStorage.setItem('esola_current_shop', targetShop.shop_name);
      }
    } catch (err) {
      console.error("Erreur chargement boutiques:", err);
      toast.error("Erreur lors de la récupération des boutiques.");
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // 2. Charger les produits de la boutique active (par ID ou par Nom)
  useEffect(() => {
    if (activeShopId) {
      fetchProducts(activeShopId);
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [activeShopId]);
=======
  const handleShopChange = (e) => {
    const selectedShopId = e.target.value;
    const newShop = shops.find(s => s.id === selectedShopId);
    if (newShop) {
      setActiveShop(newShop);
      localStorage.setItem('current_shop_id', newShop.id);
      localStorage.setItem('current_shop_name', newShop.shop_name);
      localStorage.setItem('esola_current_shop', newShop.shop_name);
      setCart([]);
      toast.success(`Boutique active : ${newShop.shop_name}`);
    }
  };
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc

  const fetchProducts = async (shopId) => {
    setLoading(true);
    try {
<<<<<<< HEAD
      let productList = [];
      const activeShopObj = shops.find(s => s.id === shopId);
      const shopName = activeShopObj ? (activeShopObj.shop_name || activeShopObj.name) : '';

      if (navigator.onLine) {
        try {
          let { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('shop_id', shopId);

          if ((!data || data.length === 0) && shopName) {
            const resByName = await supabase
              .from('products')
              .select('*')
              .eq('shop_name', shopName);
            if (!resByName.error && resByName.data) data = resByName.data;
          }

          if (!error && data) {
            productList = data;
          }
        } catch (netErr) {
          console.warn("Erreur réseau produits Supabase:", netErr);
        }
      }

      if (productList.length === 0 && db && db.products) {
        productList = await db.products.where('shop_id').equals(shopId).toArray();
        if (productList.length === 0 && shopName) {
          productList = await db.products.where('shop_name').equals(shopName).toArray();
        }
      }

      setProducts(productList);
    } catch (err) {
      console.error("Erreur lors du chargement des produits :", err);
      setProducts([]);
=======
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Erreur produits:", err);
      toast.error("Impossible de charger les produits.");
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // Gestion du panier
  const addToCart = (product) => {
    setCart((prevCart) => {
      const stockAvailable = Number(product.qty !== undefined ? product.qty : (product.stock || 0));
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= stockAvailable) {
          showToast('Stock maximum atteint pour ce produit !', 'error');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        if (stockAvailable <= 0) {
          showToast('Ce produit est en rupture de stock !', 'error');
          return prevCart;
        }
        return [...prevCart, { ...product, quantity: 1 }];
=======
  const addToCart = (product) => {
    const stockAvailable = Number(product.qty || 0);
    if (stockAvailable <= 0) {
      toast.error("Ce produit est en rupture de stock !");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= stockAvailable) {
          toast.error("Stock maximum atteint pour ce produit.");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          qty: 1,
          maxStock: stockAvailable,
          unit: product.unit || 'pcs'
        }];
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
      }
    });
  };

  const updateCartQty = (id, delta) => {
<<<<<<< HEAD
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          const productRef = products.find(p => p.id === id);
          const maxStock = productRef ? Number(productRef.qty !== undefined ? productRef.qty : (productRef.stock || 0)) : 999;
          
          if (newQty > maxStock) {
            showToast('Stock insuffisant !', 'error');
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== id));
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCartAmount = cart.reduce((sum, item) => sum + (Number(item.price || item.prix || 0) * Number(item.quantity)), 0);

  // Fonction de formatage avec la devise dynamique
  const formatMoney = (val) => {
    if (val === undefined || val === null) return '0';
    const formattedNumber = Number(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    
    let symbol = currency;
    if (currency === 'USD') symbol = '$';
    else if (currency === 'EUR') symbol = '€';
    else if (currency === 'FCFA') symbol = 'Fr';
    else if (currency === 'CDF') symbol = 'CDF';

    return `${formattedNumber} ${symbol}`;
  };

  // Valider la vente
  const handleValidateSale = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Le panier est vide.', 'error');
      return;
    }

    const paid = paymentType === 'cash' ? totalCartAmount : parseFloat(amountPaid || 0);

    if (paymentType === 'tranche') {
      if (isNaN(paid) || paid <= 0) {
        showToast('Veuillez entrer un montant versé valide.', 'error');
        return;
      }
      if (paid >= totalCartAmount) {
        showToast('Le montant versé doit être inférieur au total pour un crédit.', 'error');
        return;
      }
    }

    const finalCartItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: Number(item.price || item.prix || 0),
      quantity: Number(item.quantity || 1)
    }));

    for (const item of finalCartItems) {
      const productRef = products.find(p => p.id === item.id);
      if (!productRef) {
        showToast(`Le produit ${item.name} n'existe plus.`, 'error');
        return;
      }
      const currentQty = Number(productRef.qty !== undefined ? productRef.qty : (productRef.stock || 0));
      if (item.quantity > currentQty) {
        showToast(`Stock insuffisant pour ${item.name}. Stock actuel : ${currentQty}`, 'error');
        return;
      }
    }

    const remaining = paymentType === 'tranche' ? totalCartAmount - paid : 0;
    const selectedShopObj = shops.find(s => s.id === activeShopId);
    const shopName = selectedShopObj ? (selectedShopObj.shop_name || selectedShopObj.name) : 'Boutique';

    const saleId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : 'sale_' + Date.now() + Math.random().toString(36).substring(2, 7);

    const salePayload = {
      id: saleId,
      shop_id: activeShopId,
      shop_name: shopName,
      seller_name: localStorage.getItem('user_name') || 'Vendeur',
      client_name: clientName.trim() || 'Client Anonyme',
      client_phone: clientPhone.trim(),
      payment_type: paymentType,
      items: finalCartItems,
      total_amount: totalCartAmount,
      amount_paid: paid,
      remaining_balance: remaining,
      created_at: new Date().toISOString()
    };

    try {
      for (const item of finalCartItems) {
        const productRef = products.find(p => p.id === item.id);
        if (productRef) {
          const currentQty = Number(productRef.qty !== undefined ? productRef.qty : (productRef.stock || 0));
          const newStock = Math.max(0, currentQty - item.quantity);

         const { error: updateErr } = await supabase
            .from('products')
            .update({ qty: newStock })
            .eq('id', item.id);
            
          if (updateErr) console.warn("Erreur mise à jour stock distant:", updateErr);
        }
      }

      const { error: saleErr } = await supabase
        .from('sales')
        .insert([salePayload]);

      if (saleErr) console.warn("Erreur insertion vente distante:", saleErr);

      await fetchProducts(activeShopId);

      const finalInvoiceObj = {
        ...salePayload,
        date: new Date().toLocaleString()
      };

      setCurrentSaleInvoice(finalInvoiceObj);
      setShowInvoiceModal(true);
      showToast('Vente enregistrée avec succès !', 'success');

      setCart([]);
      setClientName('Client Anonyme');
      setClientPhone('');
      setPaymentType('cash');
      setAmountPaid('');

    } catch (err) {
      console.error("Erreur lors de l'enregistrement de la vente :", err);
      showToast("Erreur lors de l'enregistrement de la vente.", 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!currentSaleInvoice) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 160]
    });

    let y = 10;
    const pageWidth = 80;
    const margin = 5;

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text(currentSaleInvoice.shop_name, pageWidth / 2, y, { align: 'center' });
    
    y += 6;
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text(`Reçu N : #${String(currentSaleInvoice.id).slice(-6)}`, pageWidth / 2, y, { align: 'center' });
    
    y += 4;
    doc.text(`Date : ${currentSaleInvoice.date}`, pageWidth / 2, y, { align: 'center' });

    y += 5;
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.text(`Client : ${currentSaleInvoice.client_name}`, margin, y);
    if (currentSaleInvoice.client_phone) {
      y += 4;
      doc.text(`Tél : ${currentSaleInvoice.client_phone}`, margin, y);
    }
    y += 4;
    doc.text(`Vendeur : ${currentSaleInvoice.seller_name}`, margin, y);
    y += 4;
    doc.text(`Paiement : ${currentSaleInvoice.payment_type === 'cash' ? 'Comptant' : 'Par Tranche'}`, margin, y);

    y += 5;
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont('courier', 'bold');
    doc.text('Article', margin, y);
    doc.text('Q', 45, y, { align: 'center' });
    doc.text('Total', pageWidth - margin, y, { align: 'right' });

    y += 4;
    doc.setFont('courier', 'normal');
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    currentSaleInvoice.items.forEach(item => {
      const itemTotal = Number(item.price) * Number(item.quantity);
      const itemName = item.name.length > 18 ? item.name.substring(0, 18) + '...' : item.name;
      
      doc.text(itemName, margin, y);
      doc.text(String(item.quantity), 45, y, { align: 'center' });
      doc.text(formatMoney(itemTotal), pageWidth - margin, y, { align: 'right' });
      y += 5;
    });

    y += 2;
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont('courier', 'bold');
    doc.text('TOTAL :', margin, y);
    doc.text(formatMoney(currentSaleInvoice.total_amount), pageWidth - margin, y, { align: 'right' });

    if (currentSaleInvoice.payment_type === 'tranche') {
      y += 5;
      doc.setFont('courier', 'normal');
      doc.text('Versé :', margin, y);
      doc.text(formatMoney(currentSaleInvoice.amount_paid), pageWidth - margin, y, { align: 'right' });
      
      y += 5;
      doc.setFont('courier', 'bold');
      doc.text('Reste :', margin, y);
      doc.text(formatMoney(currentSaleInvoice.remaining_balance), pageWidth - margin, y, { align: 'right' });
    }

    y += 8;
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.text('*** Merci pour votre confiance ! ***', pageWidth / 2, y, { align: 'center' });

    doc.save(`Facture_${String(currentSaleInvoice.id).slice(-6)}.pdf`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 space-y-4 overflow-y-auto pb-24 relative">
      
      {/* TOAST NOTIFICATION FLOTTANTE */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white transition-all transform animate-bounce ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
          body, html {
            width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          body * {
            visibility: hidden;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            font-family: 'Courier New', Courier, monospace !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Caisse & Ventes</h1>
        <p className="text-xs text-slate-500">Enregistrement des ventes par antenne</p>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Antenne active
        </label>
        <select 
          value={activeShopId} 
          onChange={(e) => setActiveShopId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.shop_name || shop.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <input
              type="text"
              placeholder="Rechercher un produit à vendre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-xs text-slate-400 animate-pulse">Chargement des produits...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 bg-slate-50 rounded-xl border border-slate-100 p-6 text-center">
                <p className="text-sm font-medium text-slate-600">Aucun produit trouvé</p>
                <p className="text-xs text-slate-400 mt-1">Ajoutez des articles dans votre stock pour cette antenne.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredProducts.map((product) => {
                  const stock = Number(product.qty !== undefined ? product.qty : (product.stock || 0));
                  return (
                    <div 
                      key={product.id} 
                      onClick={() => addToCart(product)}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all cursor-pointer active:scale-95"
                    >
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{product.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Stock : {stock} {product.unit || 'pcs'}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-indigo-600">
                          {formatMoney(product.price || product.prix)}
                        </span>
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          +
                        </span>
                      </div>
                    </div>
                  );
                })}
=======
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty <= 0) return null;
        if (newQty > item.maxStock) {
          toast.error("Stock insuffisant !");
          return item;
        }
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      toast.error("Le panier est vide.");
      return;
    }
    setClientName('');
    setClientPhone('');
    setAmountPaidInput(totalCartAmount.toString());
    setPaymentType('cash');
    setShowCheckoutModal(true);
  };

  const handleValidateSale = async () => {
    try {
      const amountPaidNum = paymentType === 'cash' ? totalCartAmount : Number(amountPaidInput || 0);

      // Validation spécifique pour les ventes par tranche
      if (paymentType === 'tranche') {
        if (!clientName.trim()) {
          toast.error("Veuillez renseigner le nom du client pour une vente par tranche.");
          return;
        }
        if (!clientPhone.trim()) {
          toast.error("Veuillez renseigner le numéro de téléphone du client.");
          return;
        }
        if (isNaN(amountPaidNum) || amountPaidNum <= 0) {
          toast.error("Veuillez entrer un montant versé initial valide.");
          return;
        }
        if (amountPaidNum >= totalCartAmount) {
          toast.error("Le montant versé doit être inférieur au total pour une vente par tranche. Utilisez 'Comptant' sinon.");
          return;
        }
      }

      // Attribuer "Comptoir" si le mode est cash, sinon le nom saisi
      const finalClientName = paymentType === 'cash' ? 'Comptoir' : clientName.trim();
      const finalClientPhone = paymentType === 'cash' ? '' : clientPhone.trim();

      const remainingBalance = paymentType === 'cash' ? 0 : Math.max(0, totalCartAmount - amountPaidNum);

      const saleItemsFormatted = cart.map(item => ({
        id: item.id,
        name: item.name,
        qty: Number(item.qty),
        price: Number(item.price),
        unit: item.unit
      }));

      // Historique initial des tranches pour les ventes par tranche
      const initialTranches = paymentType === 'tranche' && amountPaidNum > 0 ? [{
        amount: amountPaidNum,
        date: new Date().toISOString(),
        seller: userName
      }] : [];

      const saleData = {
        id: crypto.randomUUID(),
        shop_id: activeShop.id,
        shop_name: activeShop.shop_name,
        client_name: finalClientName,
        client_phone: finalClientPhone,
        seller_name: userName,
        total_amount: totalCartAmount,
        amount_paid: amountPaidNum,
        remaining_balance: remainingBalance,
        payment_type: paymentType,
        payment_status: paymentType === 'cash' || remainingBalance === 0 ? 'soldé' : 'en_cours',
        items: JSON.stringify(saleItemsFormatted),
        tranches: JSON.stringify(initialTranches),
        
        created_at: new Date().toISOString()
      };

      const { data: insertedSale, error: saleError } = await supabase
  .from('sales')
  .insert(saleData)
  .select()
  .single();

      if (saleError) throw saleError;

      // Mise à jour des stocks produits
      for (const item of cart) {
        const { data: prodData } = await supabase
          .from('products')
          .select('qty')
          .eq('id', item.id)
          .single();

        if (prodData) {
          const currentQty = Number(prodData.qty || 0);
          const newQty = Math.max(0, currentQty - item.qty);
          await supabase.from('products').update({ qty: newQty }).eq('id', item.id);
        }
      }

      toast.success("Vente validée avec succès !");

      setCurrentSaleInvoice({
        id: insertedSale?.id || Date.now(),
        date: new Date().toLocaleString(),
        shop_name: activeShop.shop_name,
        client_name: finalClientName,
        client_phone: finalClientPhone,
        seller_name: userName,
        items: saleItemsFormatted,
        total_amount: totalCartAmount,
        amount_paid: amountPaidNum,
        remaining_balance: remainingBalance,
        payment_type: paymentType
      });

      setCart([]);
      setShowCheckoutModal(false);
      setClientName('');
      setClientPhone('');
      setAmountPaidInput('');
      setShowInvoiceModal(true);
      
      fetchProducts(activeShop.id);

        } catch (err) {
      console.error("Erreur validation vente:", err);
      toast.error(`Erreur Supabase: ${err.message || JSON.stringify(err)}`);
    }

  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    if (!currentSaleInvoice) return;

    let content = `========================================\n`;
    content += `         ${currentSaleInvoice.shop_name.toUpperCase()}\n`;
    content += `========================================\n`;
    content += `FACTURE N° : #${String(currentSaleInvoice.id).slice(-6)}\n`;
    content += `Date : ${currentSaleInvoice.date}\n`;
    content += `Client : ${currentSaleInvoice.client_name}\n`;
    if (currentSaleInvoice.client_phone) content += `Téléphone : ${currentSaleInvoice.client_phone}\n`;
    content += `Vendeur : ${currentSaleInvoice.seller_name || 'numero 1'}\n`;

    content += `Mode de paiement : ${currentSaleInvoice.payment_type === 'cash' ? 'Comptant (Cash)' : 'Par Tranche'}\n`;
    content += `----------------------------------------\n`;
    content += `ARTICLES :\n`;
    
    currentSaleInvoice.items.forEach(item => {
      content += `- ${item.name} (${item.qty} ${item.unit}) : ${formatMoney(item.price * item.qty)} CDF\n`;
    });

    content += `----------------------------------------\n`;
    content += `TOTAL À PAYER : ${formatMoney(currentSaleInvoice.total_amount)} CDF\n`;
    if (currentSaleInvoice.payment_type === 'tranche') {
      content += `Montant Versé : ${formatMoney(currentSaleInvoice.amount_paid)} CDF\n`;
      content += `Reste Dû : ${formatMoney(currentSaleInvoice.remaining_balance)} CDF\n`;
    }
    content += `========================================\n`;
    content += `       Merci pour votre confiance !\n`;
    content += `             Logiciel ESOLA\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Facture_${String(currentSaleInvoice.id).slice(-6)}_${currentSaleInvoice.client_name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Facture téléchargée avec succès !");
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 text-slate-800">
      <Toaster position="top-right"/>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 w-full sm:w-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full inline-block mb-1">
            Caisse & Vente
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Nouvelle Vente</h1>

          <div className="mt-2 flex items-center gap-2">
            <Store className="text-indigo-600 shrink-0" size={14}/>
            {shops.length > 1 ? (
              <select
                value={activeShop?.id || ''}
                onChange={handleShopChange}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>{s.shop_name}</option>
                ))}
              </select>
            ) : (
              <span className="font-bold text-slate-700 text-sm">
                {activeShop?.shop_name || 'Chargement...'}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
            <input
              type="text"
              placeholder="Rechercher un produit dans le stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produits disponibles ({activeShop?.shop_name || ''})</h2>
            {loading ? (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-100 text-xs">
                Chargement des produits...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-100 text-xs">
                Aucun produit trouvé dans cette boutique.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center transition-all hover:border-indigo-200">
                    <div className="overflow-hidden pr-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {product.category || 'Général'} • Stock : <strong className={product.qty > 0 ? "text-emerald-600" : "text-rose-600"}>{product.qty} {product.unit || 'pcs'}</strong>
                      </p>
                      <p className="text-xs font-black text-indigo-600 mt-1.5">{formatMoney(product.price)} CDF</p>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.qty <= 0}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm transition-all cursor-pointer shrink-0 ${product.qty > 0 ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    >
                      <Plus size={16}/>
                    </button>
                  </div>
                ))}
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
              </div>
            )}
          </div>
        </div>

<<<<<<< HEAD
        <div className="lg:col-span-5">
          <form onSubmit={handleValidateSale} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex justify-between items-center">
              <span>Panier Actuel</span>
              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[10px]">{cart.length} articles</span>
            </h2>

            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {cart.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Le panier est vide</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{formatMoney(item.price || item.prix)} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => updateCartQty(item.id, -1)} className="w-5 h-5 bg-white border rounded flex items-center justify-center font-bold">-</button>
                      <span className="w-4 text-center font-bold">{item.quantity}</span>
                      <button type="button" onClick={() => updateCartQty(item.id, 1)} className="w-5 h-5 bg-white border rounded flex items-center justify-center font-bold">+</button>
                      <button type="button" onClick={() => removeFromCart(item.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Trash2 size={13}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Nom du Client</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input 
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Téléphone Client (Optionnel)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input 
                    type="text"
                    placeholder="Ex: +243..."
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Type de Paiement</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('cash')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      paymentType === 'cash' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
=======
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 sticky top-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="text-indigo-600" size={15}/>
                Panier ({cart.length})
              </h2>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-rose-600 text-xs font-bold hover:underline cursor-pointer">
                  Vider
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-xs">Le panier est vide</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-slate-900 truncate pr-2">{item.name}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                        <Trash2 size={13}/>
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-indigo-600">{formatMoney(item.price)} CDF</span>
                      
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
                        <button onClick={() => updateCartQty(item.id, -1)} className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer">-</button>
                        <span className="text-xs font-black w-5 text-center">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.id, 1)} className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total :</span>
                  <span className="text-base font-black text-emerald-600">{formatMoney(totalCartAmount)} CDF</span>
                </div>

                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16}/>
                  <span>Encaisser la vente</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black">Finaliser l'encaissement</h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Mode de paiement</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setPaymentType('cash'); setAmountPaidInput(totalCartAmount.toString()); }}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${paymentType === 'cash' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
                  >
                    Comptant (Cash)
                  </button>
                  <button
                    type="button"
<<<<<<< HEAD
                    onClick={() => setPaymentType('tranche')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      paymentType === 'tranche' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Par Tranche (Crédit)
=======
                    onClick={() => { setPaymentType('tranche'); setAmountPaidInput(''); }}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${paymentType === 'tranche' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                  >
                    Par Tranche
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
                  </button>
                </div>
              </div>

<<<<<<< HEAD
              {paymentType === 'tranche' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Montant Versé (Acompte)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input 
                      type="number"
                      placeholder="Montant payé maintenant"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Total à Payer :</span>
                <span className="text-indigo-600 text-sm font-extrabold">{formatMoney(totalCartAmount)}</span>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  cart.length > 0 ? 'bg-indigo-600 hover:bg-indigo-700 shadow-sm' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 size={15} />
                <span>Encaisser et Générer le Reçu</span>
              </button>
            </div>

          </form>
        </div>

      </div>

      {showInvoiceModal && currentSaleInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl text-slate-900 border border-slate-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 no-print">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Aperçu du Reçu Thermique</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={16}/>
              </button>
            </div>

            <div id="printable-ticket" className="font-mono text-[11px] bg-white p-3 border border-slate-200 rounded-xl text-black space-y-2.5">
              
              <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-black">
                <h2 className="text-sm font-bold uppercase">{currentSaleInvoice.shop_name}</h2>
                <p className="text-[10px]">Reçu N : #${String(currentSaleInvoice.id).slice(-6)}</p>
                <p className="text-[10px]">Date : {currentSaleInvoice.date}</p>
              </div>

              <div className="space-y-0.5 text-[10px] pb-2 border-b border-dashed border-black">
                <div>Client : {currentSaleInvoice.client_name}</div>
                {currentSaleInvoice.client_phone && <div>Tél : {currentSaleInvoice.client_phone}</div>}
                <div>Vendeur : {currentSaleInvoice.seller_name}</div>
                <div>Paiement : {currentSaleInvoice.payment_type === 'cash' ? 'Comptant' : 'Par Tranche'}</div>
              </div>

              <div className="pb-1 border-b border-black">
                <div className="flex justify-between font-bold text-[10px] pb-1">
                  <span>Article</span>
                  <span>Q</span>
                  <span>Total</span>
                </div>
                <div className="border-b border-dashed border-black mb-1"></div>
                {currentSaleInvoice.items.map((item, idx) => {
                  const itemTotal = Number(item.price) * Number(item.quantity);
                  return (
                    <div key={idx} className="flex justify-between items-center py-0.5 text-[10px]">
                      <span className="truncate max-w-[100px]">{item.name}</span>
                      <span className="text-center">{item.quantity}</span>
                      <span className="font-bold">{formatMoney(itemTotal)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1 space-y-1">
                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL :</span>
                  <span>{formatMoney(currentSaleInvoice.total_amount)}</span>
                </div>

                {currentSaleInvoice.payment_type === 'tranche' && (
                  <div className="space-y-0.5 pt-1 text-[10px] border-t border-dashed border-black">
                    <div className="flex justify-between">
                      <span>Versé :</span>
                      <span>{formatMoney(currentSaleInvoice.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-600">
                      <span>Reste :</span>
                      <span>{formatMoney(currentSaleInvoice.remaining_balance)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 text-center text-[9px] border-t border-dashed border-black">
                <p>*** Merci pour votre confiance ! ***</p>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 no-print">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer size={14}/>
                <span>Imprimer Ticket</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={14}/>
                <span>Télécharger PDF</span>
=======
              {/* Le champ Nom et Téléphone s'affichent uniquement si le paiement est "Par Tranche" */}
              {paymentType === 'tranche' ? (
                <>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                      Nom du client <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Nom complet du client"
                        className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                      Téléphone du client <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Ex: +243..."
                        className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Montant versé initial (CDF) <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      value={amountPaidInput}
                      onChange={(e) => setAmountPaidInput(e.target.value)}
                      placeholder="Montant inférieur au total"
                      className="w-full bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-amber-600 mt-1 font-semibold">
                      Reste dû : {formatMoney(Math.max(0, totalCartAmount - Number(amountPaidInput || 0)))} CDF
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 text-indigo-900 text-xs font-semibold">
                  Client : <strong className="font-bold">Comptoir</strong> (Automatique pour le comptant)
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Total à payer :</span>
                <span className="text-sm font-black text-emerald-600">{formatMoney(totalCartAmount)} CDF</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleValidateSale}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FACTURATION */}
      {showInvoiceModal && currentSaleInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-black border border-black print:m-0 print:p-0 print:shadow-none print:border-none">
            
            <div className="flex justify-between items-center border-b border-black pb-4 print:hidden">
              <h3 className="text-sm font-bold uppercase tracking-wider">Facture de Vente</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-black hover:opacity-70 cursor-pointer">
                <X size={18}/>
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono text-black bg-white p-2">
              <div className="text-center space-y-1 pb-3 border-b border-black">
                <h2 className="text-base font-bold uppercase tracking-widest">{currentSaleInvoice.shop_name}</h2>
                <p className="text-[11px]">Reçu de Vente / Facture N° : #{String(currentSaleInvoice.id).slice(-6)}</p>
                <p className="text-[10px]">Date : {currentSaleInvoice.date}</p>
              </div>

              <div className="space-y-1 text-[11px] pb-3 border-b border-black">
                <div className="flex justify-between">
                  <span><strong>Client :</strong> {currentSaleInvoice.client_name}</span>
                  {currentSaleInvoice.client_phone && <span><strong>Tél :</strong> {currentSaleInvoice.client_phone}</span>}
                </div>
                <div><strong>Vendeur :</strong> {currentSaleInvoice.seller_name}</div>
                <div><strong>Mode :</strong> {currentSaleInvoice.payment_type === 'cash' ? 'Comptant (Cash)' : 'Par Tranche'}</div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black text-[11px]">
                    <th className="py-1.5 font-bold">Article</th>
                    <th className="py-1.5 font-bold text-center">Qté</th>
                    <th className="py-1.5 font-bold text-right">P.U</th>
                    <th className="py-1.5 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-black">
                  {currentSaleInvoice.items.map((item, idx) => (
                    <tr key={idx} className="text-[11px]">
                      <td className="py-1.5 pr-2 truncate max-w-[140px]">{item.name}</td>
                      <td className="py-1.5 text-center">{item.qty} {item.unit}</td>
                      <td className="py-1.5 text-right">{formatMoney(item.price)}</td>
                      <td className="py-1.5 text-right font-bold">{formatMoney(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-3 border-t border-black space-y-1 text-right">
                <div className="flex justify-between text-xs font-bold">
                  <span>TOTAL À PAYER :</span>
                  <span>{formatMoney(currentSaleInvoice.total_amount)} CDF</span>
                </div>
                {currentSaleInvoice.payment_type === 'tranche' && (
                  <>
                    <div className="flex justify-between text-[11px]">
                      <span>Montant Versé :</span>
                      <span>{formatMoney(currentSaleInvoice.amount_paid)} CDF</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                      <span>Reste Dû :</span>
                      <span>{formatMoney(currentSaleInvoice.remaining_balance)} CDF</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center pt-4 text-[10px] border-t border-dashed border-black">
                <p>*** Merci pour votre confiance ! ***</p>
                <p>Logiciel ESOLA</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-black print:hidden">
              <button
                type="button"
                onClick={handlePrintInvoice}
                className="flex-1 py-3 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer size={15}/>
                <span>Imprimer</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="flex-1 py-3 bg-white hover:bg-slate-100 text-black border border-black rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download size={15}/>
                <span>Télécharger</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
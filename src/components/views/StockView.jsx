import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function StockView() {
  const [shops, setShops] = useState([]);
  const [activeShop, setActiveShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // États pour les Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [showShopSelector, setShowShopSelector] = useState(false);
  
  // État pour le produit sélectionné (Modification / Suppression)
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Formulaire d'ajout de produit
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productQty, setProductQty] = useState('');
  const [productUnit, setProductUnit] = useState('pcs'); // Unité par défaut
  const [productPrice, setProductPrice] = useState('');
  const [productBuyPrice, setProductBuyPrice] = useState('');
  const [productError, setProductError] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Formulaire de modification de produit
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editUnit, setEditUnit] = useState('pcs');
  const [editPrice, setEditPrice] = useState('');
  const [editBuyPrice, setEditBuyPrice] = useState('');
  const [editError, setEditError] = useState('');
  const [updatingProduct, setUpdatingProduct] = useState(false);

  // Formulaire de création de boutique secondaire
  const [newShopName, setNewShopName] = useState('');
  const [shopError, setShopError] = useState('');
  const [submittingShop, setSubmittingShop] = useState(false);

  // Recherche de produit
  const [searchTerm, setSearchTerm] = useState('');

<<<<<<< HEAD
  // ----------------------------------------------------
  // GESTION DE LA DEVISE (AJOUTÉ)
  // ----------------------------------------------------
  const [currency, setCurrency] = useState(localStorage.getItem('shop_currency') || 'CDF');

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrency(localStorage.getItem('shop_currency') || 'CDF');
    };
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      const current = localStorage.getItem('shop_currency') || 'CDF';
      if (current !== currency) setCurrency(current);
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currency]);

  const formatMoney = (num) => {
    const numericAmount = Number(num || 0);
    return numericAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ` ${currency}`;
  };
  // ----------------------------------------------------

=======
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
  // 1. Charger les boutiques de l'utilisateur au montage
  useEffect(() => {
    fetchUserShops();
  }, []);

  // 2. Charger les produits dès que la boutique active change
  useEffect(() => {
    if (activeShop) {
      fetchProducts(activeShop.id);
    }
  }, [activeShop]);

  const fetchUserShops = async () => {
    try {
      const currentEmail = localStorage.getItem('user_email');
      if (!currentEmail) return;

      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', currentEmail)
        .single();

      if (userErr || !userData) return;

      const { data: shopsData, error: shopsErr } = await supabase
        .from('shops')
        .select('*')
        .eq('user_id', userData.id);

      if (shopsErr) {
        console.error("Erreur chargement boutiques:", shopsErr);
        return;
      }

      if (shopsData && shopsData.length > 0) {
        setShops(shopsData);
        setActiveShop(prev => shopsData.find(s => s.id === prev?.id) || shopsData[0]);
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const fetchProducts = async (shopId) => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Erreur chargement produits:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Gestion de l'ajout d'un produit
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim() || !productQty || !productPrice) {
      setProductError('Veuillez remplir les champs obligatoires.');
      return;
    }
    if (!activeShop) {
      setProductError('Aucune boutique active.');
      return;
    }

    setSubmittingProduct(true);
    setProductError('');

    try {
      const { error } = await supabase.from('products').insert([
        {
          shop_id: activeShop.id,
          name: productName.trim(),
          category: productCategory.trim() || 'Général',
          qty: parseInt(productQty, 10),
          unit: productUnit, // Enregistrement de l'unité
          buy_price: parseFloat(productBuyPrice) || 0,
          price: parseFloat(productPrice) || 0
        }
      ]);

      if (error) throw error;

      setProductName('');
      setProductCategory('');
      setProductQty('');
      setProductUnit('pcs');
      setProductPrice('');
      setProductBuyPrice('');
      setShowAddProductModal(false);
      fetchProducts(activeShop.id);
    } catch (err) {
      setProductError(err.message);
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Ouvrir le modal de modification avec les données du produit cliqué
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditName(product.name);
    setEditCategory(product.category || '');
    setEditQty(product.qty.toString());
    setEditUnit(product.unit || 'pcs');
    setEditPrice(product.price.toString());
    setEditBuyPrice(product.buy_price ? product.buy_price.toString() : '');
    setEditError('');
  };

  // Enregistrer les modifications du produit
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editQty || !editPrice) {
      setEditError('Veuillez remplir les champs obligatoires.');
      return;
    }

    setUpdatingProduct(true);
    setEditError('');

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editName.trim(),
          category: editCategory.trim() || 'Général',
          qty: parseInt(editQty, 10),
          unit: editUnit, // Mise à jour de l'unité
          price: parseFloat(editPrice) || 0,
          buy_price: parseFloat(editBuyPrice) || 0
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      setSelectedProduct(null);
      fetchProducts(activeShop.id);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setUpdatingProduct(false);
    }
  };

  // Supprimer un produit
  const handleDeleteProduct = async () => {
    if (!confirm(`Voulez-vous vraiment supprimer "${selectedProduct.name}" ?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id);

      if (error) throw error;

      setSelectedProduct(null);
      fetchProducts(activeShop.id);
    } catch (err) {
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  // Gestion de la création d'une boutique secondaire
  const handleAddShopSubmit = async (e) => {
    e.preventDefault();
    if (!newShopName.trim()) {
      setShopError('Veuillez donner un nom à la boutique.');
      return;
    }

    setSubmittingShop(true);
    setShopError('');

    try {
      const currentEmail = localStorage.getItem('user_email');
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', currentEmail)
        .single();

      if (userErr || !userData) throw new Error("Utilisateur introuvable.");

      const { data: existingShop, error: shopCheckErr } = await supabase
        .from('shops')
        .select('license_key, license_id')
        .eq('user_id', userData.id)
        .limit(1)
        .single();

      if (shopCheckErr || !existingShop) {
        throw new Error("Aucune licence d'origine trouvée pour ce compte.");
      }

      const { error: shopErr } = await supabase.from('shops').insert([
        {
          shop_name: newShopName.trim(),
          license_key: existingShop.license_key,
          license_id: existingShop.license_id,
          user_id: userData.id,
          owner: currentEmail
        }
      ]);

      if (shopErr) throw shopErr;

      setNewShopName('');
      setShowAddShopModal(false);
      fetchUserShops();
    } catch (err) {
      setShopError(err.message);
    } finally {
      setSubmittingShop(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 space-y-4 overflow-y-auto pb-24">
      
      {/* En-tête titre */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock & Inventaire</h1>
        <p className="text-xs text-slate-500">Gestion multi-boutiques en temps réel (Supabase)</p>
      </div>

      {/* Carte de sélection de l'antenne active & Bouton ajout boutique */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            🏢
          </div>
          <div className="flex-1">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Antenne active</span>
            <button 
              onClick={() => setShowShopSelector(!showShopSelector)}
              className="text-sm font-bold text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              {activeShop ? activeShop.shop_name : 'Aucune boutique'} ▼
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowAddShopModal(true)}
          className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
        >
          + Boutique
        </button>
      </div>

      {/* Sélecteur déroulant des boutiques si cliqué */}
      {showShopSelector && shops.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-md space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase px-2">Changer de boutique :</p>
          {shops.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveShop(s);
                setShowShopSelector(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeShop?.id === s.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              {s.shop_name}
            </button>
          ))}
        </div>
      )}

      {/* Calculs automatiques */}
      {(() => {
        const totalPotentialProfit = products.reduce((acc, p) => acc + ((p.price - (p.buy_price || 0)) * p.qty), 0);
        const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.qty), 0);
        
        return (
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Bénéfice total potentiel</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Actif</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
<<<<<<< HEAD
                <h3 className="text-xl font-extrabold">{formatMoney(totalPotentialProfit)}</h3>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-slate-400">Valeur stock vente</span>
                <span className="text-xs font-bold">{formatMoney(totalStockValue)}</span>
=======
                <h3 className="text-xl font-extrabold">{totalPotentialProfit.toLocaleString()} CDF</h3>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-slate-400">Valeur stock vente</span>
                <span className="text-xs font-bold">{totalStockValue.toLocaleString()} CDF</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
              </div>
            </div>
          </div>
        );
      })()}

      {/* Barre de recherche et bouton Ajouter Stock */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un produit..."
          className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <button
          onClick={() => setShowAddProductModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs flex items-center gap-1 shadow-sm whitespace-nowrap"
        >
          + Ajouter Stock
        </button>
      </div>

      {/* Liste des produits (Cliquable pour modifier/supprimer) */}
      <div className="space-y-2">
        {loadingProducts ? (
          <p className="text-center text-xs text-slate-400 py-6">Chargement des produits...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <div className="text-3xl">📦</div>
            <p className="text-xs text-slate-500">Aucun produit dans cette boutique.</p>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div 
              key={p.id} 
              onClick={() => openEditModal(p)}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center cursor-pointer hover:border-blue-400 transition-all active:scale-[0.99]"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                <div className="flex gap-2 mt-0.5 items-center">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{p.category}</span>
                  <span className="text-[10px] text-slate-500">Qté : <strong>{p.qty} {p.unit || 'pcs'}</strong></span>
                </div>
              </div>
              <div className="text-right">
<<<<<<< HEAD
                <span className="block text-sm font-extrabold text-slate-900">{formatMoney(p.price)}</span>
                <span className="text-[10px] text-emerald-600 font-medium">Achat : {formatMoney(p.buy_price || 0)}</span>
=======
                <span className="block text-sm font-extrabold text-slate-900">{p.price.toLocaleString()} CDF</span>
                <span className="text-[10px] text-emerald-600 font-medium">Achat : {p.buy_price || 0}</span>
>>>>>>> a4af81b1e5cdb5f0a271ca95578f269c3ac545dc
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL : AJOUTER UN PRODUIT */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-slate-900">Ajouter un produit</h3>
            <form onSubmit={handleAddProductSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Nom du produit</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Savon / Amoxicilline"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Catégorie</label>
                <input
                  type="text"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  placeholder="Ex: Pharmacie / Quincaillerie"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              {/* Quantité et Unité sur la même ligne */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Quantité</label>
                  <input
                    type="number"
                    value={productQty}
                    onChange={(e) => setProductQty(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Unité</label>
                  <select
                    value={productUnit}
                    onChange={(e) => setProductUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="plaquette">Plaquette</option>
                    <option value="boite">Boîte</option>
                    <option value="pcs">Pièce (pcs)</option>
                    <option value="kg">Kilo (kg)</option>
                    <option value="sac">Sac</option>
                    <option value="carton">Carton</option>
                    <option value="bidon">Bidon</option>
                    <option value="m">Mètre (m)</option>
                    <option value="mm">Millimètre (mm)</option>
                    <option value="litre">Litre (L)</option>
                    <option value="paquet">Paquet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Prix de vente</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="1500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Prix d'achat</label>
                  <input
                    type="number"
                    value={productBuyPrice}
                    onChange={(e) => setProductBuyPrice(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {productError && <p className="text-xs text-rose-600 font-medium">{productError}</p>}
              
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {submittingProduct ? 'Ajout...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* MODAL : MODIFIER / SUPPRIMER UN PRODUIT */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Modifier le produit</h3>
              <button 
                onClick={handleDeleteProduct}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                🗑️ Supprimer
              </button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Nom du produit</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Catégorie</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              {/* Quantité et Unité modifiables */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Quantité</label>
                  <input
                    type="number"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Unité</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="plaquette">Plaquette</option>
                    <option value="boite">Boîte</option>
                    <option value="pcs">Pièce (pcs)</option>
                    <option value="kg">Kilo (kg)</option>
                    <option value="sac">Sac</option>
                    <option value="carton">Carton</option>
                    <option value="bidon">Bidon</option>
                    <option value="m">Mètre (m)</option>
                    <option value="mm">Millimètre (mm)</option>
                    <option value="litre">Litre (L)</option>
                    <option value="paquet">Paquet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Prix de vente</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Prix d'achat</label>
                  <input
                    type="number"
                    value={editBuyPrice}
                    onChange={(e) => setEditBuyPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {editError && <p className="text-xs text-rose-600 font-medium">{editError}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updatingProduct}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {updatingProduct ? 'Mise à jour...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : CRÉER UNE BOUTIQUE SECONDAIRE */}
      {showAddShopModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-slate-900">Ajouter une nouvelle boutique</h3>
            <form onSubmit={handleAddShopSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Nom de la boutique</label>
                <input
                  type="text"
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  placeholder="Ex: Antenne Marché Central"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              {shopError && <p className="text-xs text-rose-600 font-medium">{shopError}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddShopModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingShop}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {submittingShop ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
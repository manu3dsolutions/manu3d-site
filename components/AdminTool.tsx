import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Package, Image as ImageIcon, Sparkles, MessageSquare, Briefcase, Users, Lock, Unlock, Eye, ShoppingCart, Gem, Shield, Star, ExternalLink, Home, RefreshCw, Megaphone, Search, Globe, Instagram, Loader2, Bot, Wand2, Ticket, Trash2, Database, Save, Beaker, Coins, AlertTriangle, FileText, Truck, Clock, Plus, Edit, MoreHorizontal, ChevronDown, CheckCircle, Settings, Scale } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Coupon, Product, Article, ShippingMethod, GlobalSiteConfig } from '../types';
import { useLiveContent, PrintingMaterial } from '../LiveContent';
import { useToast } from '../contexts/ToastContext';
import { hashPassword, isHash } from '../utils/security';

// --- TYPES INTERNES ---
interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  items: any[];
  shipping_address: string;
  payment_method: string;
}

// --- MAIN COMPONENT ---
interface AdminToolProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminTool: React.FC<AdminToolProps> = ({ isOpen, onClose }) => {
  const { refreshData, printingMaterials, hero, promo, siteConfig, shippingMethods } = useLiveContent();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'home' | 'config' | 'products' | 'orders' | 'materials' | 'coupons' | 'blog' | 'shipping'>('home');
  const [isSaving, setIsSaving] = useState(false);

  // --- DATA STATES ---
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [matsList, setMatsList] = useState<PrintingMaterial[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [shippingList, setShippingList] = useState<ShippingMethod[]>([]);

  // --- EDITING STATES ---
  const [editHero, setEditHero] = useState(hero);
  const [editPromo, setEditPromo] = useState(promo);
  const [editConfig, setEditConfig] = useState(siteConfig);
  
  // Forms
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percent'|'fixed'>('percent');
  const [newCouponValue, setNewCouponValue] = useState(10);

  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  const [editingShipping, setEditingShipping] = useState<Partial<ShippingMethod> | null>(null);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
     if(isOpen && isAuthenticated) {
         setEditHero(hero);
         setEditPromo(promo);
         setEditConfig(siteConfig);
         setMatsList(printingMaterials);
         setShippingList(shippingMethods);
         fetchAllData();
     }
  }, [isOpen, isAuthenticated, hero, promo, siteConfig, printingMaterials, shippingMethods]);

  const fetchAllData = () => {
      fetchCoupons();
      fetchProducts();
      fetchOrders();
      fetchArticles();
      fetchShipping();
  };

  // --- AUTH ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let storedPwd = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!storedPwd) {
        try { storedPwd = (process.env as any).VITE_ADMIN_PASSWORD; } catch (e) {}
    }

    if (!storedPwd) {
        setErrorMsg("Erreur Config : VITE_ADMIN_PASSWORD non trouvé.");
        return;
    }

    if (isHash(storedPwd)) {
        const inputHash = await hashPassword(password);
        if (inputHash === storedPwd) {
            setIsAuthenticated(true);
            setErrorMsg('');
            setSecurityWarning(null);
        } else {
            setErrorMsg('Mot de passe incorrect.');
        }
    } else {
        if (password === storedPwd) {
            setIsAuthenticated(true);
            setErrorMsg('');
            const secureHash = await hashPassword(password);
            setSecurityWarning(secureHash);
        } else {
            setErrorMsg('Mot de passe incorrect.');
        }
    }
  };

  // --- FETCHERS ---
  const fetchCoupons = async () => {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if(data) setCouponsList(data as Coupon[]);
  };
  const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('id', { ascending: true });
      if(data) {
          const mapped = data.map((p: any) => ({
             ...p,
             numericPrice: parseFloat(p.price.replace('€','')),
             tags: p.tags || []
          }));
          setProductsList(mapped);
      }
  };
  const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if(data) setOrdersList(data as Order[]);
  };
  const fetchArticles = async () => {
      const { data } = await supabase.from('articles').select('*').order('date', { ascending: false });
      if(data) setArticlesList(data as Article[]);
  };
  const fetchShipping = async () => {
      const { data } = await supabase.from('shipping_methods').select('*').order('base_price', { ascending: true });
      if(data) setShippingList(data as ShippingMethod[]);
  };

  // --- ACTIONS: HOME & CONFIG ---
  const saveHomeConfig = async () => {
      setIsSaving(true);
      try {
          const updates = [
              { key: 'hero_title1', value: editHero.titleLine1 },
              { key: 'hero_title2', value: editHero.titleLine2 },
              { key: 'hero_subtitle', value: editHero.subtitle },
              { key: 'hero_badge', value: editHero.badge },
              { key: 'promo_text', value: editPromo.text },
              { key: 'promo_active', value: String(editPromo.isActive) }
          ];
          const { error } = await supabase.from('site_config').upsert(updates);
          if(error) throw error;
          await refreshData();
          toast("Site mis à jour en direct !", "success");
      } catch (err: any) {
          toast("Erreur update config", "error");
      } finally {
          setIsSaving(false);
      }
  };

  const saveGlobalConfig = async () => {
      setIsSaving(true);
      try {
          const updates = [
              { key: 'shipping_free_threshold', value: String(editConfig.shippingFreeThreshold) },
              { key: 'invoice_company_name', value: editConfig.invoice.companyName },
              { key: 'invoice_address_line1', value: editConfig.invoice.addressLine1 },
              { key: 'invoice_address_line2', value: editConfig.invoice.addressLine2 },
              { key: 'invoice_siret', value: editConfig.invoice.siret },
              { key: 'invoice_email', value: editConfig.invoice.email },
              { key: 'invoice_footer_text', value: editConfig.invoice.footerText }
          ];
          const { error } = await supabase.from('site_config').upsert(updates);
          if(error) throw error;
          await refreshData();
          toast("Configuration globale sauvegardée !", "success");
      } catch (err: any) {
          toast("Erreur sauvegarde config", "error");
      } finally {
          setIsSaving(false);
      }
  };

  // --- ACTIONS: SHIPPING ---
  const saveShippingMethod = async () => {
      if(!editingShipping) return;
      setIsSaving(true);

      const payload = {
          name: editingShipping.name,
          description: editingShipping.description,
          base_price: editingShipping.basePrice,
          price_per_kg: editingShipping.pricePerKg,
          estimated_days: editingShipping.estimatedDays,
          min_weight: editingShipping.minWeight,
          max_weight: editingShipping.maxWeight,
          is_pickup: editingShipping.isPickup
      };

      let error;
      if (editingShipping.id) {
          const res = await supabase.from('shipping_methods').update(payload).eq('id', editingShipping.id);
          error = res.error;
      } else {
          const res = await supabase.from('shipping_methods').insert(payload);
          error = res.error;
      }

      setIsSaving(false);
      if(!error) {
          toast("Transporteur sauvegardé !", "success");
          setIsShippingModalOpen(false);
          fetchShipping();
          refreshData();
      } else {
          toast("Erreur sauvegarde transporteur", "error");
      }
  };
  const deleteShippingMethod = async (id: number) => {
      if(!confirm("Supprimer ce transporteur ?")) return;
      await supabase.from('shipping_methods').delete().eq('id', id);
      fetchShipping();
      refreshData();
  };

  // --- ACTIONS: PRODUCTS ---
  const handleEditProduct = (p: Product) => { setEditingProduct({ ...p }); setIsProductModalOpen(true); };
  const handleNewProduct = () => { setEditingProduct({ title: '', price: '0.00€', category: 'Figurine', image: '', description: '', stock: 5, tags: [], active: true, isNew: true }); setIsProductModalOpen(true); };
  const saveProduct = async () => {
      if(!editingProduct) return;
      setIsSaving(true);
      const payload = {
          title: editingProduct.title, category: editingProduct.category, price: editingProduct.price, image: editingProduct.image, description: editingProduct.description,
          stock: editingProduct.stock, tags: editingProduct.tags, active: editingProduct.active, is_new: editingProduct.isNew
      };
      let error;
      if (editingProduct.id) {
          const res = await supabase.from('products').update(payload).eq('id', editingProduct.id); error = res.error;
      } else {
          const res = await supabase.from('products').insert(payload); error = res.error;
      }
      setIsSaving(false);
      if(!error) { toast("Produit sauvegardé !", "success"); setIsProductModalOpen(false); fetchProducts(); refreshData(); } else { toast("Erreur sauvegarde produit", "error"); }
  };
  const deleteProduct = async (id: number) => { if(!confirm("Supprimer ce produit ?")) return; const { error } = await supabase.from('products').delete().eq('id', id); if(!error) { toast("Produit supprimé", "info"); fetchProducts(); }};

  // --- ACTIONS: ORDERS ---
  const updateOrderStatus = async (id: number, status: string) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if(!error) { toast(`Commande #${id} passée en ${status}`, "success"); fetchOrders(); }
  };

  // --- ACTIONS: BLOG ---
  const saveArticle = async () => {
     if(!editingArticle) return;
     const payload = {
         title: editingArticle.title, excerpt: editingArticle.excerpt, category: editingArticle.category, image: editingArticle.image,
         author: editingArticle.author || 'Manu', date: editingArticle.date || new Date().toISOString(), read_time: editingArticle.readTime || '3 min'
     };
     const { error } = editingArticle.id ? await supabase.from('articles').update(payload).eq('id', editingArticle.id) : await supabase.from('articles').insert(payload);
     if(!error) { toast("Article publié", "success"); setIsBlogModalOpen(false); fetchArticles(); } else { toast("Erreur article", "error"); }
  };

  // --- ACTIONS: MATERIALS ---
  const updateMaterialPrice = async (id: string, newCost: number) => {
      const { error } = await supabase.from('printing_materials').update({ cost_per_gram: newCost }).eq('id', id);
      if(!error) { toast("Prix mis à jour", "success"); refreshData(); }
  };

  // --- ACTIONS: COUPONS ---
  const createCoupon = async () => {
      if(!newCouponCode) return;
      const { error } = await supabase.from('coupons').insert({ code: newCouponCode.toUpperCase(), discount_type: newCouponType, value: newCouponValue, active: true });
      if(!error) { fetchCoupons(); setNewCouponCode(''); toast("Coupon créé !", "success"); }
  };
  const deleteCoupon = async (id: number) => { if(!confirm("Supprimer ?")) return; await supabase.from('coupons').delete().eq('id', id); fetchCoupons(); };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
     return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#151921] w-full max-w-md p-8 rounded-2xl border border-red-900/50 shadow-2xl relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24}/></button>
              <form onSubmit={handleLogin} className="space-y-4">
                 <h2 className="text-2xl font-bold text-white text-center">Admin Manu3D</h2>
                 <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white text-center focus:border-manu-orange outline-none transition-colors" autoFocus placeholder="Mot de passe" />
                 {errorMsg && <p className="text-red-500 text-center text-sm">{errorMsg}</p>}
                 <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors">Entrer</button>
              </form>
           </div>
        </div>
     );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-2 py-4 md:px-4 bg-black/90 backdrop-blur-sm animate-in zoom-in-95 duration-200">
      <div className="bg-[#151921] w-full max-w-7xl rounded-2xl border border-manu-orange shadow-2xl flex flex-col h-full max-h-[95vh] overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-manu-orange text-black p-4 flex justify-between items-center flex-shrink-0">
          <h2 className="font-display font-bold text-lg md:text-xl flex items-center gap-2">
            <Unlock size={20} /> CMS Ultimate <span className="text-xs bg-black/20 px-2 py-0.5 rounded">V3.5</span>
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors"><X size={24} /></button>
        </div>

        {/* Security Warning */}
        {securityWarning && (
            <div className="bg-red-900/90 text-white p-2 text-xs flex justify-between gap-4 border-b border-red-500">
                <span><strong>SÉCURITÉ :</strong> Copiez ce hash dans .env (VITE_ADMIN_PASSWORD) :</span>
                <code className="bg-black/50 px-2 rounded select-all font-mono">{securityWarning}</code>
            </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-16 md:w-64 bg-[#0F1216] border-r border-gray-800 flex flex-col flex-shrink-0 overflow-y-auto p-2 space-y-1">
             {[
               { id: 'home', label: 'Accueil & Promo', icon: Home, color: 'text-white' },
               { id: 'config', label: 'Config Globale', icon: Settings, color: 'text-gray-300' },
               { id: 'orders', label: 'Commandes', icon: ShoppingCart, color: 'text-blue-400' },
               { id: 'products', label: 'Produits', icon: Package, color: 'text-manu-orange' },
               { id: 'shipping', label: 'Frais de Port', icon: Truck, color: 'text-pink-400' },
               { id: 'blog', label: 'Blog / Articles', icon: FileText, color: 'text-purple-400' },
               { id: 'materials', label: 'Matériaux & Prix', icon: Beaker, color: 'text-green-400' },
               { id: 'coupons', label: 'Codes Promo', icon: Ticket, color: 'text-yellow-400' },
             ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)} 
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${activeTab === item.id ? 'bg-gray-800 border border-gray-700 shadow-lg' : 'hover:bg-gray-800/50 text-gray-400'}`}
                >
                   <item.icon size={20} className={activeTab === item.id ? item.color : ''} /> 
                   <span className={`hidden md:block text-sm font-bold ${activeTab === item.id ? 'text-white' : ''}`}>{item.label}</span>
                   {item.id === 'orders' && ordersList.filter(o => o.status === 'paid').length > 0 && (
                       <span className="hidden md:flex ml-auto w-5 h-5 bg-red-500 text-white text-[10px] rounded-full items-center justify-center">
                           {ordersList.filter(o => o.status === 'paid').length}
                       </span>
                   )}
                </button>
             ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar bg-[#151921] relative">
            
            {/* --- TAB: HOME --- */}
            {activeTab === 'home' && (
                <div className="space-y-8 max-w-3xl mx-auto">
                    <div className="bg-black/30 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Megaphone size={20}/> Bandeau Promo</h3>
                        <div className="space-y-4">
                            <input type="text" value={editPromo.text} onChange={e => setEditPromo({...editPromo, text: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white text-sm" />
                            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                                <input type="checkbox" checked={editPromo.isActive} onChange={e => setEditPromo({...editPromo, isActive: e.target.checked})} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-manu-orange focus:ring-manu-orange" />
                                Activer le bandeau
                            </label>
                        </div>
                    </div>
                    <div className="bg-black/30 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Home size={20}/> Hero Section</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" value={editHero.badge} onChange={e => setEditHero({...editHero, badge: e.target.value})} className="bg-black border border-gray-700 rounded p-3 text-white text-sm" placeholder="Badge" />
                            <input type="text" value={editHero.titleLine1} onChange={e => setEditHero({...editHero, titleLine1: e.target.value})} className="bg-black border border-gray-700 rounded p-3 text-white text-sm font-bold" placeholder="Titre 1" />
                            <input type="text" value={editHero.titleLine2} onChange={e => setEditHero({...editHero, titleLine2: e.target.value})} className="bg-black border border-gray-700 rounded p-3 text-white text-sm font-bold" placeholder="Titre 2" />
                            <input type="text" value={editHero.subtitle} onChange={e => setEditHero({...editHero, subtitle: e.target.value})} className="bg-black border border-gray-700 rounded p-3 text-white text-sm md:col-span-2" placeholder="Sous-titre" />
                        </div>
                    </div>
                    <button onClick={saveHomeConfig} disabled={isSaving} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all">
                        {isSaving ? <Loader2 className="animate-spin"/> : <Save size={20}/>} PUBLIER LA PAGE D'ACCUEIL
                    </button>
                </div>
            )}

            {/* --- TAB: GLOBAL CONFIG --- */}
            {activeTab === 'config' && (
                <div className="space-y-8 max-w-3xl mx-auto">
                    <div className="bg-black/30 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Settings size={20}/> Paramètres Généraux</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-500 text-xs uppercase mb-1 block">Seuil Livraison Gratuite (€)</label>
                                <input type="number" value={editConfig.shippingFreeThreshold} onChange={e => setEditConfig({...editConfig, shippingFreeThreshold: parseFloat(e.target.value)})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-black/30 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FileText size={20}/> Informations Facturation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" value={editConfig.invoice.companyName} onChange={e => setEditConfig({...editConfig, invoice: {...editConfig.invoice, companyName: e.target.value}})} className="bg-black border border-gray-700 rounded p-3 text-white text-sm" placeholder="Nom Entreprise" />
                            <input type="text" value={editConfig.invoice.siret} onChange={e => setEditConfig({...editConfig, invoice: {...editConfig.invoice, siret: e.target.value}})} className="bg-black border border-gray-700 rounded p-3 text-white text-sm" placeholder="SIRET" />
                            <input type="text" value={editConfig.invoice.email} onChange={e => setEditConfig({...editConfig, invoice: {...editConfig.invoice, email: e.target.value}})} className="bg-black border border-gray-700 rounded p-3 text-white text-sm" placeholder="Email Contact" />
                            <input type="text" value={editConfig.invoice.addressLine1} onChange={e => setEditConfig({...editConfig, invoice: {...editConfig.invoice, addressLine1: e.target.value}})} className="bg-black border border-gray-700 rounded p-3 text-white text-sm" placeholder="Adresse Ligne 1" />
                            <input type="text" value={editConfig.invoice.addressLine2} onChange={e => setEditConfig({...editConfig, invoice: {...editConfig.invoice, addressLine2: e.target.value}})} className="bg-black border border-gray-700 rounded p-3 text-white text-sm" placeholder="Code Postal & Ville" />
                            <textarea value={editConfig.invoice.footerText} onChange={e => setEditConfig({...editConfig, invoice: {...editConfig.invoice, footerText: e.target.value}})} className="bg-black border border-gray-700 rounded p-3 text-white text-sm md:col-span-2" placeholder="Texte pied de page (TVA...)" />
                        </div>
                    </div>

                    <button onClick={saveGlobalConfig} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all">
                        {isSaving ? <Loader2 className="animate-spin"/> : <Save size={20}/>} SAUVEGARDER LA CONFIGURATION
                    </button>
                </div>
            )}

            {/* --- TAB: ORDERS --- */}
            {activeTab === 'orders' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-white">Gestion des Commandes</h3>
                        <button onClick={fetchOrders} className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-white"><RefreshCw size={16}/></button>
                    </div>
                    <div className="grid gap-4">
                        {ordersList.map(order => (
                            <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-blue-500/30 transition-colors">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-lg font-bold text-white">#{order.id}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                            order.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                                            order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' : 
                                            'bg-gray-700 text-gray-400'
                                        }`}>
                                            {order.status}
                                        </span>
                                        <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-sm text-gray-300 font-bold">{order.customer_name}</div>
                                    <div className="text-xs text-gray-500">{order.items?.length} articles • {order.total}€ • {order.payment_method}</div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Truck size={12}/> {order.shipping_address}</div>
                                </div>
                                <div className="flex gap-2">
                                    {order.status === 'paid' && (
                                        <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1">
                                            <Truck size={14}/> Marquer Expédié
                                        </button>
                                    )}
                                    {order.status === 'shipped' && (
                                        <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center gap-1">
                                            <CheckCircle size={14}/> Terminer
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {ordersList.length === 0 && <div className="text-center py-10 text-gray-500">Aucune commande pour le moment.</div>}
                    </div>
                </div>
            )}

            {/* --- TAB: PRODUCTS --- */}
            {activeTab === 'products' && (
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-white">Catalogue ({productsList.length})</h3>
                        <button onClick={handleNewProduct} className="bg-manu-orange text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white transition-colors">
                            <Plus size={18}/> Ajouter Produit
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-20">
                        {productsList.map(p => (
                            <div key={p.id} className="group bg-black border border-gray-800 rounded-xl overflow-hidden hover:border-manu-orange/50 transition-all relative">
                                <div className="aspect-square relative">
                                    <img src={p.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <button onClick={() => handleEditProduct(p)} className="p-1.5 bg-black/60 text-white rounded hover:bg-blue-500"><Edit size={14}/></button>
                                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 bg-black/60 text-white rounded hover:bg-red-500"><Trash2 size={14}/></button>
                                    </div>
                                    {p.stock <= 0 && <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-500 font-bold text-xs uppercase">Rupture</div>}
                                </div>
                                <div className="p-3">
                                    <h4 className="font-bold text-white text-sm truncate">{p.title}</h4>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-manu-orange font-mono text-sm">{p.price}</span>
                                        <span className="text-[10px] text-gray-500">Stock: {p.stock}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PRODUCT MODAL */}
                    {isProductModalOpen && editingProduct && (
                        <div className="absolute inset-0 bg-[#151921] z-50 flex flex-col animate-in slide-in-from-bottom">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0B0D10]">
                                <h3 className="text-lg font-bold text-white">{editingProduct.id ? 'Modifier Produit' : 'Nouveau Produit'}</h3>
                                <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-white"><X/></button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-4 max-w-2xl mx-auto w-full">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500 uppercase">Titre</label>
                                        <input type="text" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">Prix (ex: 24.00€)</label>
                                        <input type="text" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">Stock</label>
                                        <input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500 uppercase">Image URL</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="flex-1 bg-black border border-gray-700 rounded p-3 text-white" />
                                            {editingProduct.image && <img src={editingProduct.image} className="w-12 h-12 rounded object-cover border border-gray-700" />}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500 uppercase">Description</label>
                                        <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white h-24" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">Catégorie</label>
                                        <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white">
                                            <option value="Figurine">Figurine</option>
                                            <option value="Decor">Decor</option>
                                            <option value="Cosplay">Cosplay</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-4 pt-6">
                                        <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                                            <input type="checkbox" checked={editingProduct.isNew} onChange={e => setEditingProduct({...editingProduct, isNew: e.target.checked})} className="rounded bg-gray-800 border-gray-600" />
                                            Badge Nouveauté
                                        </label>
                                    </div>
                                </div>
                                <button onClick={saveProduct} disabled={isSaving} className="w-full bg-manu-orange text-black font-bold py-4 rounded-lg mt-8 hover:bg-white transition-colors">
                                    {isSaving ? <Loader2 className="animate-spin mx-auto"/> : 'ENREGISTRER LE PRODUIT'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- TAB: SHIPPING --- */}
            {activeTab === 'shipping' && (
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-white">Frais de Port</h3>
                        <button onClick={() => { setEditingShipping({ name: '', basePrice: 5, pricePerKg: 2, minWeight: 0, maxWeight: 10000, estimatedDays: '3-5 jours', isPickup: false }); setIsShippingModalOpen(true); }} className="bg-pink-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-500 transition-colors">
                            <Plus size={18}/> Nouveau Transporteur
                        </button>
                    </div>
                    <div className="space-y-4">
                        {shippingList.map(method => (
                            <div key={method.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-white text-lg">{method.name} {method.isPickup && <span className="text-[10px] bg-blue-500 px-2 rounded ml-2">Retrait</span>}</h4>
                                    <div className="text-xs text-gray-400">{method.estimatedDays} • De {method.minWeight}g à {method.maxWeight}g</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-white font-bold">{method.basePrice}€</div>
                                        <div className="text-xs text-gray-500">Base</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-bold">+{method.pricePerKg}€</div>
                                        <div className="text-xs text-gray-500">/Kg</div>
                                    </div>
                                    <button onClick={() => { setEditingShipping(method); setIsShippingModalOpen(true); }} className="p-2 bg-black/40 rounded hover:text-white"><Edit size={16}/></button>
                                    <button onClick={() => deleteShippingMethod(method.id)} className="p-2 bg-black/40 rounded hover:text-red-500"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {isShippingModalOpen && editingShipping && (
                        <div className="absolute inset-0 bg-[#151921] z-50 flex flex-col animate-in slide-in-from-right">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0B0D10]">
                                <h3 className="text-lg font-bold text-white">Éditer Transporteur</h3>
                                <button onClick={() => setIsShippingModalOpen(false)}><X/></button>
                            </div>
                            <div className="p-6 max-w-2xl mx-auto w-full space-y-4">
                                <input type="text" placeholder="Nom (ex: Colissimo)" value={editingShipping.name} onChange={e => setEditingShipping({...editingShipping, name: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white font-bold" />
                                <input type="text" placeholder="Description (ex: Livraison à domicile)" value={editingShipping.description} onChange={e => setEditingShipping({...editingShipping, description: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs text-gray-500">Prix Base (€)</label><input type="number" step="0.1" value={editingShipping.basePrice} onChange={e => setEditingShipping({...editingShipping, basePrice: parseFloat(e.target.value)})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" /></div>
                                    <div><label className="text-xs text-gray-500">Prix / Kg (€)</label><input type="number" step="0.1" value={editingShipping.pricePerKg} onChange={e => setEditingShipping({...editingShipping, pricePerKg: parseFloat(e.target.value)})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" /></div>
                                    <div><label className="text-xs text-gray-500">Poids Min (g)</label><input type="number" value={editingShipping.minWeight} onChange={e => setEditingShipping({...editingShipping, minWeight: parseFloat(e.target.value)})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" /></div>
                                    <div><label className="text-xs text-gray-500">Poids Max (g)</label><input type="number" value={editingShipping.maxWeight} onChange={e => setEditingShipping({...editingShipping, maxWeight: parseFloat(e.target.value)})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" /></div>
                                </div>
                                <input type="text" placeholder="Délai (ex: 48h)" value={editingShipping.estimatedDays} onChange={e => setEditingShipping({...editingShipping, estimatedDays: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" />
                                <label className="flex items-center gap-2 text-white cursor-pointer p-2 border border-gray-700 rounded bg-black/20">
                                    <input type="checkbox" checked={editingShipping.isPickup} onChange={e => setEditingShipping({...editingShipping, isPickup: e.target.checked})} />
                                    Est un point de retrait (Gratuit)
                                </label>
                                <button onClick={saveShippingMethod} className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-500">SAUVEGARDER</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- TAB: BLOG --- */}
            {activeTab === 'blog' && (
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-white">Articles Blog</h3>
                        <button 
                            onClick={() => { setEditingArticle({ title: '', category: 'News', image: '', excerpt: '', readTime: '5 min' }); setIsBlogModalOpen(true); }} 
                            className="bg-purple-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-500 transition-colors"
                        >
                            <Plus size={18}/> Nouvel Article
                        </button>
                    </div>
                    <div className="space-y-4">
                        {articlesList.map(article => (
                            <div key={article.id} className="bg-black/40 border border-gray-800 p-4 rounded-xl flex gap-4 items-center">
                                <img src={article.image} className="w-20 h-20 object-cover rounded-lg border border-gray-700" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-white">{article.title}</h4>
                                    <div className="text-xs text-gray-500 mt-1">{article.category} • {article.date}</div>
                                </div>
                                <button onClick={() => { setEditingArticle(article); setIsBlogModalOpen(true); }} className="p-2 text-gray-400 hover:text-white"><Edit size={16}/></button>
                            </div>
                        ))}
                    </div>
                    {isBlogModalOpen && editingArticle && (
                        <div className="absolute inset-0 bg-[#151921] z-50 flex flex-col animate-in slide-in-from-right">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0B0D10]">
                                <h3 className="text-lg font-bold text-white">Éditer Article</h3>
                                <button onClick={() => setIsBlogModalOpen(false)}><X/></button>
                            </div>
                            <div className="p-6 max-w-2xl mx-auto w-full space-y-4">
                                <input type="text" placeholder="Titre" value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white font-bold" />
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={editingArticle.category} onChange={e => setEditingArticle({...editingArticle, category: e.target.value as any})} className="bg-black border border-gray-700 rounded p-3 text-white">
                                        <option value="News">News</option>
                                        <option value="Tuto">Tuto</option>
                                        <option value="Bon Plan">Bon Plan</option>
                                    </select>
                                    <input type="text" placeholder="Temps lecture (ex: 5 min)" value={editingArticle.readTime} onChange={e => setEditingArticle({...editingArticle, readTime: e.target.value})} className="bg-black border border-gray-700 rounded p-3 text-white" />
                                </div>
                                <input type="text" placeholder="Image URL" value={editingArticle.image} onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" />
                                <textarea placeholder="Contenu / Extrait" value={editingArticle.excerpt} onChange={e => setEditingArticle({...editingArticle, excerpt: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white h-40" />
                                <button onClick={saveArticle} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-500">PUBLIER</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- TAB: MATERIALS --- */}
            {activeTab === 'materials' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Prix Matériaux</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matsList.map(mat => (
                            <div key={mat.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                <div><h4 className="font-bold text-white text-lg">{mat.name}</h4><span className="text-xs text-gray-500 uppercase">{mat.type}</span></div>
                                <div className="flex items-center gap-2"><Coins size={16} className="text-manu-orange" />
                                    <input type="number" step="0.01" defaultValue={mat.cost_per_gram} onBlur={(e) => updateMaterialPrice(mat.id, parseFloat(e.target.value))} className="w-20 bg-black border border-gray-600 rounded p-2 text-white text-right font-mono font-bold" />
                                    <span className="text-gray-400 text-sm">€/g</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB: COUPONS --- */}
            {activeTab === 'coupons' && (
               <div className="space-y-6">
                   <h3 className="text-2xl font-bold text-white mb-4">Codes Promo</h3>
                   <div className="bg-black/30 p-4 rounded border border-gray-700 mb-4">
                       <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase">Nouveau Coupon</h4>
                       <div className="flex gap-2">
                           <input type="text" value={newCouponCode} onChange={e => setNewCouponCode(e.target.value.toUpperCase())} placeholder="CODE" className="flex-1 bg-black border border-gray-700 rounded p-2 text-white uppercase" />
                           <input type="number" value={newCouponValue} onChange={e => setNewCouponValue(Number(e.target.value))} className="w-20 bg-black border border-gray-700 rounded p-2 text-white" />
                           <select value={newCouponType} onChange={e => setNewCouponType(e.target.value as any)} className="bg-black border border-gray-700 rounded p-2 text-white"><option value="percent">%</option><option value="fixed">€</option></select>
                           <button onClick={createCoupon} className="bg-green-600 text-white font-bold rounded p-2 px-4">Créer</button>
                       </div>
                   </div>
                   <div className="space-y-2">
                       {couponsList.map(c => (
                           <div key={c.id} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700">
                               <div><span className="text-green-400 font-bold font-mono">{c.code}</span><span className="text-gray-400 text-xs ml-2">(-{c.value}{c.discount_type === 'percent' ? '%' : '€'})</span></div>
                               <button onClick={() => deleteCoupon(c.id)} className="text-red-500 hover:text-red-300 p-1"><Trash2 size={16}/></button>
                           </div>
                       ))}
                   </div>
               </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTool;
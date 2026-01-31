import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Package, Image as ImageIcon, Sparkles, MessageSquare, Briefcase, Users, Lock, Unlock, Eye, ShoppingCart, Gem, Shield, Star, ExternalLink, Home, RefreshCw, Megaphone, Search, Globe, Instagram, Loader2, Bot, Wand2, Ticket, Trash2, Database, Save, Beaker, Coins, AlertTriangle } from 'lucide-react';
import { HERO_CONTENT, PROMO_CONTENT } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabaseClient';
import { Coupon } from '../types';
import { useLiveContent, PrintingMaterial } from '../LiveContent';
import { useToast } from '../contexts/ToastContext';
import { hashPassword, isHash } from '../utils/security';

// --- MAIN COMPONENT ---
interface AdminToolProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminTool: React.FC<AdminToolProps> = ({ isOpen, onClose }) => {
  const { refreshData, printingMaterials, hero, promo } = useLiveContent();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'home' | 'materials' | 'coupons'>('home');
  const [isSaving, setIsSaving] = useState(false);

  // --- LOCAL STATE FOR EDITING ---
  const [editHero, setEditHero] = useState(hero);
  const [editPromo, setEditPromo] = useState(promo);
  
  // Coupons
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percent'|'fixed'>('percent');
  const [newCouponValue, setNewCouponValue] = useState(10);

  // Materials
  const [matsList, setMatsList] = useState<PrintingMaterial[]>([]);

  useEffect(() => {
     if(isOpen && isAuthenticated) {
         setEditHero(hero);
         setEditPromo(promo);
         setMatsList(printingMaterials);
         fetchCoupons();
     }
  }, [isOpen, isAuthenticated, hero, promo, printingMaterials]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Récupération via import.meta.env (Standard Vite)
    let storedPwd = import.meta.env.VITE_ADMIN_PASSWORD;
    
    // 2. Fallback via Define plugin (Injection directe de la valeur par Vite)
    // Note: On utilise un bloc try/catch car si le remplacement ne se fait pas, 'process' n'existe pas dans le navigateur.
    if (!storedPwd) {
        try {
            // @ts-ignore
            storedPwd = process.env.VITE_ADMIN_PASSWORD;
        } catch (e) {
            // Ignorer l'erreur si process n'est pas défini
        }
    }

    if (!storedPwd) {
        setErrorMsg("Erreur Config : VITE_ADMIN_PASSWORD non trouvé. Redémarrez le serveur.");
        return;
    }

    // 1. Si le .env contient déjà un HASH (Sécurisé)
    if (isHash(storedPwd)) {
        const inputHash = await hashPassword(password);
        if (inputHash === storedPwd) {
            setIsAuthenticated(true);
            setErrorMsg('');
            setSecurityWarning(null);
            fetchCoupons();
        } else {
            setErrorMsg('Mot de passe incorrect.');
        }
    } 
    // 2. Si le .env est encore en CLAIR (Legacy / Non sécurisé)
    else {
        if (password === storedPwd) {
            setIsAuthenticated(true);
            setErrorMsg('');
            
            // Calcul du hash pour aider l'utilisateur à sécuriser
            const secureHash = await hashPassword(password);
            setSecurityWarning(secureHash);
            console.warn("⚠️ SECURITE MANU3D : Votre mot de passe est en clair !");
            console.log("Copiez ce hash dans votre .env (VITE_ADMIN_PASSWORD) :", secureHash);
            
            fetchCoupons();
        } else {
            setErrorMsg('Mot de passe incorrect.');
        }
    }
  };

  const fetchCoupons = async () => {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if(data) setCouponsList(data as Coupon[]);
  };

  const createCoupon = async () => {
      if(!newCouponCode) return;
      const { error } = await supabase.from('coupons').insert({
          code: newCouponCode.toUpperCase(),
          discount_type: newCouponType,
          value: newCouponValue,
          active: true
      });
      if(!error) {
          fetchCoupons();
          setNewCouponCode('');
          toast("Coupon créé !", "success");
      } else {
          toast("Erreur création coupon", "error");
      }
  };

  const deleteCoupon = async (id: number) => {
      if(!confirm("Supprimer ce coupon ?")) return;
      await supabase.from('coupons').delete().eq('id', id);
      fetchCoupons();
      toast("Coupon supprimé", "info");
  };

  // --- SAVE FUNCTIONS (THE REAL DEAL) ---

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
          console.error(err);
          toast("Erreur: Vérifiez les permissions Supabase", "error");
      } finally {
          setIsSaving(false);
      }
  };

  const updateMaterialPrice = async (id: string, newCost: number) => {
      const { error } = await supabase.from('printing_materials').update({ cost_per_gram: newCost }).eq('id', id);
      if(!error) {
          toast("Prix mis à jour", "success");
          refreshData();
      } else {
          toast("Erreur update", "error");
      }
  };

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
      <div className="bg-[#151921] w-full max-w-6xl rounded-2xl border border-manu-orange shadow-2xl flex flex-col h-full max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-manu-orange text-black p-4 flex justify-between items-center flex-shrink-0">
          <h2 className="font-display font-bold text-lg md:text-xl flex items-center gap-2">
            <Unlock size={20} /> CMS Ultimate
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors"><X size={24} /></button>
        </div>

        {/* Security Warning Banner */}
        {securityWarning && (
            <div className="bg-red-900/90 text-white p-3 text-xs md:text-sm flex flex-col md:flex-row items-center justify-between gap-4 border-b border-red-500">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-300 flex-shrink-0" size={20} />
                    <span><strong>SÉCURITÉ :</strong> Votre mot de passe est visible dans le code ! Remplacez la valeur dans le fichier <code>.env</code> par ce HASH :</span>
                </div>
                <div className="flex items-center gap-2 bg-black/50 p-2 rounded font-mono overflow-x-auto max-w-[200px] md:max-w-md">
                    {securityWarning}
                </div>
            </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-16 md:w-56 bg-[#0F1216] border-r border-gray-800 flex flex-col flex-shrink-0 overflow-y-auto p-2 space-y-2">
             <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'home' ? 'bg-manu-orange text-black font-bold' : 'text-gray-400 hover:text-white'}`}>
                <Home size={20} /> <span className="hidden md:block">Accueil & Promo</span>
             </button>
             <button onClick={() => setActiveTab('materials')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'materials' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                <Beaker size={20} /> <span className="hidden md:block">Matériaux</span>
             </button>
             <button onClick={() => setActiveTab('coupons')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'coupons' ? 'bg-green-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                <Ticket size={20} /> <span className="hidden md:block">Coupons</span>
             </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#151921]">
            
            {activeTab === 'home' && (
                <div className="space-y-8 max-w-3xl mx-auto">
                    <div className="bg-black/30 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Megaphone size={20}/> Bandeau Promo</h3>
                        <div className="space-y-4">
                            <input type="text" value={editPromo.text} onChange={e => setEditPromo({...editPromo, text: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" />
                            <label className="flex items-center gap-2 text-white">
                                <input type="checkbox" checked={editPromo.isActive} onChange={e => setEditPromo({...editPromo, isActive: e.target.checked})} />
                                Activer le bandeau
                            </label>
                        </div>
                    </div>

                    <div className="bg-black/30 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Home size={20}/> Hero Section</h3>
                        <div className="space-y-4">
                            <input type="text" value={editHero.badge} onChange={e => setEditHero({...editHero, badge: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" placeholder="Badge (ex: Service Premium)" />
                            <input type="text" value={editHero.titleLine1} onChange={e => setEditHero({...editHero, titleLine1: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white font-bold text-lg" placeholder="Titre Ligne 1" />
                            <input type="text" value={editHero.titleLine2} onChange={e => setEditHero({...editHero, titleLine2: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white font-bold text-lg" placeholder="Titre Ligne 2" />
                            <textarea value={editHero.subtitle} onChange={e => setEditHero({...editHero, subtitle: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" placeholder="Sous-titre" />
                        </div>
                    </div>

                    <button 
                        onClick={saveHomeConfig}
                        disabled={isSaving}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all"
                    >
                        {isSaving ? <Loader2 className="animate-spin"/> : <Save size={20}/>}
                        PUBLIER LES CHANGEMENTS EN DIRECT
                    </button>
                </div>
            )}

            {activeTab === 'materials' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Gestion des Prix Matériaux</h3>
                    <p className="text-gray-400 mb-6">Modifiez le coût au gramme. Le calculateur B2B du site se mettra à jour immédiatement.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matsList.map(mat => (
                            <div key={mat.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-white text-lg">{mat.name}</h4>
                                    <span className="text-xs text-gray-500 uppercase">{mat.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Coins size={16} className="text-manu-orange" />
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        defaultValue={mat.cost_per_gram}
                                        onBlur={(e) => updateMaterialPrice(mat.id, parseFloat(e.target.value))}
                                        className="w-20 bg-black border border-gray-600 rounded p-2 text-white text-right font-mono font-bold"
                                    />
                                    <span className="text-gray-400 text-sm">€/g</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'coupons' && (
               <div className="space-y-6">
                   <h3 className="text-2xl font-bold text-white mb-4">Gestion des Codes Promo</h3>
                   <div className="bg-black/30 p-4 rounded border border-gray-700">
                       <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase">Nouveau Coupon</h4>
                       <div className="flex gap-2 mb-2">
                           <input type="text" value={newCouponCode} onChange={e => setNewCouponCode(e.target.value.toUpperCase())} placeholder="CODE (ex: MANU10)" className="flex-1 bg-black border border-gray-700 rounded p-2 text-white uppercase" />
                           <select value={newCouponType} onChange={e => setNewCouponType(e.target.value as any)} className="bg-black border border-gray-700 rounded p-2 text-white">
                               <option value="percent">% Pourcentage</option>
                               <option value="fixed">€ Montant Fixe</option>
                           </select>
                       </div>
                       <div className="flex gap-2">
                           <input type="number" value={newCouponValue} onChange={e => setNewCouponValue(Number(e.target.value))} className="w-24 bg-black border border-gray-700 rounded p-2 text-white" />
                           <button onClick={createCoupon} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold rounded p-2 transition-colors">Créer le code</button>
                       </div>
                   </div>
                   
                   <div className="space-y-2">
                       {couponsList.map(c => (
                           <div key={c.id} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700">
                               <div>
                                   <span className="text-green-400 font-bold font-mono">{c.code}</span>
                                   <span className="text-gray-400 text-xs ml-2">(-{c.value}{c.discount_type === 'percent' ? '%' : '€'})</span>
                               </div>
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
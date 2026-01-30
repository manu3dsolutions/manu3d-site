import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Package, Image as ImageIcon, Sparkles, MessageSquare, Briefcase, Users, Lock, Unlock, Eye, ShoppingCart, Gem, Shield, Star, ExternalLink, Home, RefreshCw, Megaphone, Search, Globe, Instagram, Loader2, Bot, Wand2, Ticket, Trash2 } from 'lucide-react';
import { HERO_CONTENT, PROMO_CONTENT } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabaseClient';
import { Coupon } from '../types';

// --- CONFIGURATION IA ---
const SYSTEM_INSTRUCTION = `
Tu es l'expert Marketing de "Manu3D", une boutique d'impression 3D haut de gamme (Figurines, Cosplay, Décoration Geek).
Ton ton est : Passionné, Premium, Geek (références Pop Culture subtiles), et Vendeur.
Tu dois toujours générer du texte prêt à être copié-collé.
`;

// --- PREVIEW COMPONENTS ---
const ProductPreview = ({ data }: { data: any }) => {
  return (
    <div className="bg-[#121418] rounded-xl overflow-hidden border border-gray-800 relative flex flex-col w-64 mx-auto shadow-2xl">
      {data.isNew && <span className="absolute top-2 left-2 z-20 bg-manu-orange text-black text-[10px] font-bold px-2 py-1 rounded uppercase">Nouveau</span>}
      <div className="h-40 bg-gray-900 relative">
        <img src={data.image || 'https://via.placeholder.com/400'} className="w-full h-full object-cover opacity-80" alt="Preview" />
      </div>
      <div className="p-4">
        <span className="text-[10px] text-gray-500 uppercase font-bold">{data.category}</span>
        <h3 className="text-white font-bold font-display leading-tight mb-2">{data.title || 'Titre Produit'}</h3>
        <p className="text-gray-400 text-xs line-clamp-2 mb-3">{data.description || 'Description...'}</p>
        <div className="flex justify-between items-center border-t border-gray-800 pt-2">
          <span className="font-bold text-white">{data.price || '0€'}</span>
          <div className="bg-white text-black p-1.5 rounded"><ShoppingCart size={14}/></div>
        </div>
      </div>
    </div>
  );
};

// ... autres previews inchangées pour concision, elles sont toujours utilisées ...
const PromoPreview = ({ data }: { data: any }) => (
    <div className="bg-manu-orange text-black p-4 font-bold text-center">{data.text}</div>
);
const SeoPreview = ({ data }: { data: any }) => (
    <div className="bg-white p-2 text-black text-xs"><h3>{data.title}</h3><p>{data.desc}</p></div>
);
const SocialPreview = ({ data }: { data: any }) => (
    <div className="bg-white p-2 text-black text-xs"><p>{data.text}</p></div>
);
const HeroPreview = ({ data }: { data: any }) => (
    <div className="bg-black text-white p-4"><h1>{data.titleLine1}</h1></div>
);

// --- MAIN COMPONENT ---

interface AdminToolProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminTool: React.FC<AdminToolProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [activeTab, setActiveTab] = useState<'home' | 'promo' | 'seo' | 'social' | 'product' | 'portfolio' | 'partner' | 'review' | 'coupons'>('home');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- STATE FOR HOME (HERO) ---
  const [homeTopic, setHomeTopic] = useState("");
  const [heroBadge, setHeroBadge] = useState(HERO_CONTENT.badge);
  const [heroTitle1, setHeroTitle1] = useState(HERO_CONTENT.titleLine1);
  const [heroTitle2, setHeroTitle2] = useState(HERO_CONTENT.titleLine2);
  const [heroSub, setHeroSub] = useState(HERO_CONTENT.subtitle);
  const [heroCta1, setHeroCta1] = useState(HERO_CONTENT.ctaPrimary);
  const [heroCta2, setHeroCta2] = useState(HERO_CONTENT.ctaSecondary);

  // --- STATE FOR PROMO ---
  const [promoActive, setPromoActive] = useState(PROMO_CONTENT.isActive);
  const [promoText, setPromoText] = useState(PROMO_CONTENT.text);
  const [promoLink, setPromoLink] = useState(PROMO_CONTENT.link);

  // --- STATE FOR SEO ---
  const [seoTitle, setSeoTitle] = useState("Manu3D | Impression 3D & Geek Art Normandie");
  const [seoDesc, setSeoDesc] = useState("Expert en figurine 3D peinte main, objets 3D uniques et impression résine à Montivilliers. Découvrez nos créations Geek & Cosplay.");
  const [seoKeywords, setSeoKeywords] = useState("Figurine, Manga, Impression 3D, Normandie");

  // --- STATE FOR SOCIAL ---
  const [socialTopic, setSocialTopic] = useState("");
  const [socialPlatform, setSocialPlatform] = useState("Instagram");
  const [socialResult, setSocialResult] = useState("");

  // --- STATE FOR PRODUCT ---
  const [prodTitle, setProdTitle] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('Figurine');
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodIsNew, setProdIsNew] = useState(false);

  // --- STATE FOR COUPONS ---
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percent'|'fixed'>('percent');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Sécurité : On récupère le mot de passe depuis les variables d'environnement
    const env = (import.meta as any).env || {};
    const adminPwd = env.VITE_ADMIN_PASSWORD;

    if (adminPwd && password === adminPwd) {
      setIsAuthenticated(true);
      setErrorMsg('');
      fetchCoupons(); 
    } else {
      setErrorMsg('Mot de passe incorrect.');
    }
  };

  const fetchCoupons = async () => {
      setLoadingCoupons(true);
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if(data) setCouponsList(data as Coupon[]);
      setLoadingCoupons(false);
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
      } else {
          alert("Erreur création coupon (Code déjà existant ?)");
      }
  };

  const deleteCoupon = async (id: number) => {
      if(!confirm("Supprimer ce coupon ?")) return;
      await supabase.from('coupons').delete().eq('id', id);
      fetchCoupons();
  };

  const handleAIGenerate = async (task: string) => {
    const env = (import.meta as any).env || {};
    const apiKey = env.API_KEY;
    if(!apiKey || apiKey === 'PLACEHOLDER_API_KEY' || apiKey === '') {
        alert("⛔ Clé API Gemini Manquante !");
        return;
    }
    
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    setIsGenerating(true);
    try {
        let prompt = "";
        
        if (task === 'product_desc') {
            prompt = `Rédige une description produit courte (max 3 phrases), attrayante et technique pour une boutique d'impression 3D. Produit : "${prodTitle}". Catégorie : ${prodCategory}. Inclus des détails sur la qualité (Résine 8k ou PLA). Utilise 2 emojis maximum.`;
        } else if (task === 'seo_meta') {
            prompt = `Génère un objet JSON avec deux clés : "title" (max 60 chars) et "description" (max 150 chars) pour optimiser le SEO d'une page parlant de : "${seoKeywords}". Le ton doit être professionnel mais Geek.`;
        } else if (task === 'social_post') {
            prompt = `Rédige un post pour ${socialPlatform} sur le sujet : "${socialTopic}". Le ton doit être engageant, passionné, avec des emojis et une liste de 5 hashtags pertinents à la fin.`;
        } else if (task === 'home_content') {
            prompt = `Génère un contenu JSON pour la section Hero (Bannière d'accueil) du site Manu3D. Focus / Thème : "${homeTopic}". JSON clés: "badge", "titleLine1", "titleLine2", "subtitle", "ctaPrimary", "ctaSecondary".`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
                responseMimeType: task === 'seo_meta' || task === 'home_content' ? "application/json" : "text/plain"
            }
        });

        const text = response.text;

        if (task === 'product_desc') {
            setProdDesc(text?.trim() || "");
        } else if (task === 'social_post') {
            setSocialResult(text?.trim() || "");
        } else if (task === 'seo_meta' || task === 'home_content') {
             try {
                const json = JSON.parse(text || "{}");
                if (task === 'seo_meta') {
                   if(json.title) setSeoTitle(json.title);
                   if(json.description) setSeoDesc(json.description);
                }
                if (task === 'home_content') {
                   if(json.badge) setHeroBadge(json.badge);
                   if(json.titleLine1) setHeroTitle1(json.titleLine1);
                   if(json.titleLine2) setHeroTitle2(json.titleLine2);
                   if(json.subtitle) setHeroSub(json.subtitle);
                   if(json.ctaPrimary) setHeroCta1(json.ctaPrimary);
                   if(json.ctaSecondary) setHeroCta2(json.ctaSecondary);
                }
             } catch (e) {
                 console.error("JSON Parse Error", e);
             }
        }
    } catch (error) {
        console.error("AI Error", error);
        alert("Erreur lors de la génération IA.");
    } finally {
        setIsGenerating(false);
    }
  };

  const generateCode = () => {
    if (activeTab === 'home') return `HERO_CONTENT = { badge: "${heroBadge}", titleLine1: "${heroTitle1}", ... };`;
    if (activeTab === 'promo') return `PROMO_CONTENT = { text: "${promoText}", isActive: ${promoActive}, ... };`;
    if (activeTab === 'coupons') return "Gestion via Supabase Direct (pas de code à copier)";
    if (activeTab === 'social') return socialResult;
    return `const item = { title: "${prodTitle}", price: "${prodPrice}", ... }`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderPreview = () => {
      if (activeTab === 'product') return <ProductPreview data={{ title: prodTitle, price: prodPrice, category: prodCategory, image: prodImage, description: prodDesc, isNew: prodIsNew }} />;
      if (activeTab === 'promo') return <PromoPreview data={{ text: promoText }} />;
      if (activeTab === 'seo') return <SeoPreview data={{ title: seoTitle, desc: seoDesc }} />;
      if (activeTab === 'social') return <SocialPreview data={{ text: socialResult }} />;
      if (activeTab === 'home') return <HeroPreview data={{ titleLine1: heroTitle1 }} />;
      if (activeTab === 'coupons') return <div className="text-gray-500 text-center italic">Liste des coupons en base</div>;
      return null;
  };

  if (!isAuthenticated) {
     return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#151921] w-full max-w-md p-8 rounded-2xl border border-red-900/50 shadow-2xl relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24}/></button>
              <form onSubmit={handleLogin} className="space-y-4">
                 <h2 className="text-2xl font-bold text-white text-center">Admin Manu3D</h2>
                 <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white text-center" autoFocus placeholder="Mot de passe" />
                 <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded">Entrer</button>
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
            <Unlock size={20} /> <span className="hidden sm:inline">Manu3D</span> Admin
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors"><X size={24} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-16 md:w-56 bg-[#0F1216] border-r border-gray-800 flex flex-col flex-shrink-0 overflow-y-auto p-2 space-y-2">
             <button onClick={() => setActiveTab('coupons')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'coupons' ? 'bg-green-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                <Ticket size={20} /> <span className="hidden md:block">Coupons</span>
             </button>
             <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'home' ? 'bg-manu-orange text-black font-bold' : 'text-gray-400 hover:text-white'}`}>
                <Home size={20} /> <span className="hidden md:block">Accueil</span>
             </button>
             <button onClick={() => setActiveTab('product')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'product' ? 'bg-manu-orange text-black font-bold' : 'text-gray-400 hover:text-white'}`}>
                <Package size={20} /> <span className="hidden md:block">Produits</span>
             </button>
             <button onClick={() => setActiveTab('social')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'social' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                <Instagram size={20} /> <span className="hidden md:block">Social AI</span>
             </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Left: Input */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#151921] border-r border-gray-800">
               
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
                       <div>
                           <div className="flex justify-between items-center mb-2">
                               <h4 className="text-sm font-bold text-gray-400 uppercase">Codes Actifs</h4>
                               <button onClick={fetchCoupons} className="text-xs text-manu-orange hover:text-white flex items-center gap-1"><RefreshCw size={12}/> Actualiser</button>
                           </div>
                           <div className="space-y-2">
                               {loadingCoupons ? <Loader2 className="animate-spin text-manu-orange mx-auto" /> : couponsList.map(c => (
                                   <div key={c.id} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700">
                                       <div>
                                           <span className="text-green-400 font-bold font-mono">{c.code}</span>
                                           <span className="text-gray-400 text-xs ml-2">(-{c.value}{c.discount_type === 'percent' ? '%' : '€'})</span>
                                       </div>
                                       <button onClick={() => deleteCoupon(c.id)} className="text-red-500 hover:text-red-300 p-1"><Trash2 size={16}/></button>
                                   </div>
                               ))}
                               {couponsList.length === 0 && !loadingCoupons && <p className="text-gray-500 text-xs italic">Aucun coupon.</p>}
                           </div>
                       </div>
                   </div>
               )}

               {activeTab === 'home' && (
                 <div className="space-y-4">
                     <input type="text" value={heroTitle1} onChange={e => setHeroTitle1(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white" />
                 </div>
               )}
               {activeTab === 'social' && (
                 <div className="space-y-4">
                     <input type="text" value={socialTopic} onChange={e => setSocialTopic(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white" placeholder="Sujet..." />
                     <button onClick={() => handleAIGenerate('social_post')} className="w-full bg-purple-600 text-white py-3 rounded font-bold">Générer IA</button>
                     <textarea value={socialResult} onChange={e => setSocialResult(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white h-40" />
                 </div>
               )}
            </div>

            {activeTab !== 'coupons' && (
                <div className="w-full lg:w-[45%] bg-[#0B0D10] flex flex-col border-l border-gray-800">
                   <div className="flex-1 p-6 flex items-center justify-center">
                      {renderPreview()}
                   </div>
                   <div className="h-48 bg-black border-t border-gray-800 p-4 relative">
                      <div className="text-green-400 font-mono text-xs overflow-y-auto h-full">{generateCode()}</div>
                      <button onClick={handleCopy} className="absolute top-4 right-4 text-manu-orange"><Copy size={16}/></button>
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
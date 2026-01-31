import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Eye, Filter, User, Brush, X, Sparkles, ChevronRight, Star, Layers, Box, ShieldCheck, Heart, Users, CheckCircle, ExternalLink, Grid, Search, Info, Package, Truck, Clock, Tag, Image as ImageIcon, Zap, ArrowRight } from 'lucide-react';
import { useLiveContent } from '../LiveContent';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext'; // Import du Toast
import { Product } from '../types';

const ProductList: React.FC = () => {
  const { products, creators, shippingMethods } = useLiveContent();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [activeCreator, setActiveCreator] = useState<string | 'Tous'>('Tous');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Pour l'animation d'ajout au panier
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  // Extraction des catégories uniques
  const categories = useMemo(() => {
     const cats = new Set(products.map(p => p.category));
     return ['Tous', ...Array.from(cats)];
  }, [products]);

  // Extraction des tags uniques
  const allTags = useMemo(() => {
     const tags = new Set(products.flatMap(p => p.tags || []));
     return Array.from(tags).sort();
  }, [products]);

  // Reset image index when opening modal AND Update SEO Title
  useEffect(() => {
      if (selectedProduct) {
          setActiveImageIndex(0);
          document.title = `${selectedProduct.title} | Manu3D Boutique`;
      } else {
          document.title = `Boutique | Manu3D - Impression 3D Normandie`;
      }
  }, [selectedProduct]);

  // CROSS-SELLING: Produits similaires (même catégorie, excluant l'actuel)
  const relatedProducts = useMemo(() => {
      if (!selectedProduct) return [];
      return products
          .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
          .sort(() => 0.5 - Math.random()) // Shuffle aléatoire
          .slice(0, 3); // Max 3 produits
  }, [selectedProduct, products]);

  const toggleTag = (tag: string) => {
      setSelectedTags(prev => 
          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
  };

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
      e?.stopPropagation();
      addToCart(product);
      setJustAddedId(product.id);
      toast(`"${product.title}" ajouté au panier !`, 'success');
      setTimeout(() => setJustAddedId(null), 1500); // Reset animation state
  };

  // Filtrage Puissant (Catégorie + Créateur + Recherche Texte + Tags)
  const filteredProducts = products.filter(product => {
     const matchCat = activeCategory === 'Tous' || product.category === activeCategory;
     const matchCreator = activeCreator === 'Tous' || (product.creatorId && creators.find(c => c.name === activeCreator)?.id === product.creatorId);
     const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
     
     const productTags = product.tags || [];
     const matchTags = selectedTags.length === 0 || selectedTags.some(tag => productTags.includes(tag));

     return matchCat && matchCreator && matchSearch && matchTags;
  });

  // Trouver les infos du créateur actif
  const currentCreatorData = activeCreator !== 'Tous' ? creators.find(c => c.name === activeCreator) : null;

  // Préparation de la galerie d'images pour la modale
  const modalGallery = selectedProduct ? [selectedProduct.image, ...(selectedProduct.gallery || [])] : [];

  return (
    <section id="shop" className="bg-[#050505] relative min-h-screen pt-20 pb-24">
      
      {/* --- MODALE QUICK VIEW PREMIUM --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-300">
           {/* Backdrop Flou */}
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
           
           <div className="relative w-full max-w-6xl bg-[#0F1115] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 max-h-[90vh]">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 hover:text-black transition-colors"><X size={20}/></button>
              
              {/* Image Gallery Area */}
              <div className="w-full md:w-[55%] bg-black relative flex flex-col">
                  {/* Main Image */}
                  <div className="flex-1 relative overflow-hidden group flex items-center justify-center p-4">
                      <img 
                        src={modalGallery[activeImageIndex]} 
                        alt={selectedProduct.title} 
                        className="max-w-full max-h-full object-contain transition-all duration-300 drop-shadow-2xl"
                      />
                      {selectedProduct.isNew && <span className="absolute top-4 left-4 bg-manu-orange text-black px-3 py-1 text-xs font-bold uppercase rounded">Nouveau</span>}
                  </div>
                  
                  {/* Thumbnails (Only if more than 1 image) */}
                  {modalGallery.length > 1 && (
                      <div className="flex gap-3 p-4 overflow-x-auto bg-[#0F1115]/50 backdrop-blur-sm border-t border-white/5 justify-center">
                          {modalGallery.map((img, idx) => (
                              <button 
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImageIndex === idx ? 'border-manu-orange opacity-100 ring-2 ring-manu-orange/20' : 'border-transparent opacity-50 hover:opacity-100 hover:border-gray-500'}`}
                              >
                                  <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                              </button>
                          ))}
                      </div>
                  )}
              </div>

              {/* Détails */}
              <div className="w-full md:w-[45%] p-8 md:p-10 flex flex-col overflow-y-auto custom-scrollbar bg-[#0F1115]">
                  <div className="mb-4 flex items-center gap-2">
                     <span className="text-[10px] font-bold text-manu-orange uppercase tracking-widest px-2.5 py-1 bg-manu-orange/10 border border-manu-orange/20 rounded-full">{selectedProduct.category}</span>
                     {selectedProduct.stock && selectedProduct.stock > 0 ? (
                        <span className="text-[10px] text-green-500 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold uppercase"><CheckCircle size={10}/> En Stock</span>
                     ) : (
                        <span className="text-[10px] text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold uppercase"><Clock size={10}/> Sur commande</span>
                     )}
                  </div>

                  <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 leading-tight">{selectedProduct.title}</h2>
                  
                  <div className="flex items-end gap-4 mb-8 pb-8 border-b border-white/5">
                      <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-manu-orange to-amber-200">{selectedProduct.price}</span>
                      <div className="flex gap-0.5 mb-1.5">
                         {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />)}
                         <span className="text-xs text-gray-500 ml-2 font-bold">(4.9)</span>
                      </div>
                  </div>

                  <div className="space-y-6 mb-8 flex-1">
                     <div>
                         <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">Description</h4>
                         <p className="text-gray-300 text-sm leading-relaxed">{selectedProduct.description}</p>
                     </div>
                     
                     <div className="bg-black/40 p-5 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                           <Truck size={16} className="text-blue-400"/> 
                           Livraison France : <span className="text-white font-bold">3-5 jours</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                           <ShieldCheck size={16} className="text-green-400"/> 
                           Garantie casse & conformité
                        </div>
                     </div>

                     {/* CROSS SELLING AREA - KEY FOR INCREASING AOV */}
                     {relatedProducts.length > 0 && (
                        <div className="pt-6 border-t border-white/5">
                            <h4 className="text-xs font-bold text-white uppercase mb-3 flex items-center gap-2">
                                <Sparkles size={12} className="text-manu-orange"/> Complétez votre collection
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                {relatedProducts.map(rel => (
                                    <div 
                                        key={rel.id} 
                                        className="bg-black/40 p-2 rounded-lg border border-gray-800 hover:border-manu-orange/50 cursor-pointer transition-all group/related"
                                        onClick={() => setSelectedProduct(rel)}
                                    >
                                        <div className="aspect-square rounded-md overflow-hidden mb-2">
                                            <img src={rel.image} className="w-full h-full object-cover opacity-80 group-hover/related:scale-110 transition-transform duration-500" alt={rel.title} />
                                        </div>
                                        <div className="text-[10px] text-gray-400 truncate font-bold group-hover/related:text-white">{rel.title}</div>
                                        <div className="text-[10px] text-manu-orange">{rel.price}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     )}
                  </div>

                  <div className="mt-auto pt-4">
                     <button 
                        onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-manu-orange transition-all flex items-center justify-center gap-3 shadow-xl transform hover:scale-[1.02] hover:shadow-manu-orange/20"
                     >
                        <ShoppingCart size={20} /> Ajouter au panier
                     </button>
                  </div>
              </div>
           </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* --- COLONNE GAUCHE : SIDEBAR --- */}
            <aside className="w-full lg:w-72 flex-shrink-0">
                <div className="lg:sticky lg:top-24 space-y-8">
                    
                    <div>
                        <div className="flex items-center gap-2 mb-6 px-2">
                            <Users className="text-manu-orange" size={20} />
                            <h2 className="text-lg font-display font-bold text-white uppercase tracking-wide">Collections</h2>
                        </div>

                        {/* DESKTOP LIST */}
                        <div className="hidden lg:flex flex-col gap-2">
                            <button 
                                onClick={() => setActiveCreator('Tous')}
                                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 text-left group ${activeCreator === 'Tous' ? 'bg-manu-orange text-black font-bold shadow-lg scale-105' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeCreator === 'Tous' ? 'bg-black/20' : 'bg-gray-800'}`}>
                                    <Grid size={16} />
                                </div>
                                <span className="flex-1 text-sm uppercase tracking-wider">Tout Voir</span>
                            </button>
                            
                            <div className="h-px bg-white/5 my-2 mx-2"></div>

                            {creators.map(creator => (
                                <button 
                                    key={creator.id}
                                    onClick={() => setActiveCreator(creator.name)}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 text-left group ${activeCreator === creator.name ? 'bg-white/10 text-white border border-manu-orange/50 shadow-[0_0_15px_rgba(243,156,18,0.1)]' : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'}`}
                                >
                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-gray-800">
                                        <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className={`block text-sm font-bold truncate ${activeCreator === creator.name ? 'text-manu-orange' : ''}`}>{creator.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        {/* MOBILE SLIDER */}
                        <div className="lg:hidden flex overflow-x-auto gap-3 pb-2 hide-scrollbar snap-x">
                            <button 
                                onClick={() => setActiveCreator('Tous')}
                                className={`snap-start flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase border ${activeCreator === 'Tous' ? 'bg-manu-orange text-black border-manu-orange' : 'bg-[#151921] text-white border-gray-700'}`}
                            >
                                Tout Voir
                            </button>
                            {creators.map(creator => (
                                <button 
                                    key={creator.id}
                                    onClick={() => setActiveCreator(creator.name)}
                                    className={`snap-start flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase border flex items-center gap-2 ${activeCreator === creator.name ? 'bg-white text-black border-white' : 'bg-[#151921] text-gray-400 border-gray-700'}`}
                                >
                                    <img src={creator.avatarUrl} className="w-4 h-4 rounded-full" alt="" />
                                    {creator.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Banner Pub Sidebar */}
                    <div className="hidden lg:block relative rounded-2xl overflow-hidden border border-white/10 group">
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900 via-transparent to-transparent opacity-80 z-10"></div>
                        <img src="https://picsum.photos/400/600?random=99" className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" alt="Promo" />
                        <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                            <span className="bg-manu-orange text-black text-[10px] font-bold px-2 py-1 rounded uppercase mb-2 inline-block">Nouveauté</span>
                            <h3 className="text-white font-bold text-xl leading-tight mb-1">Dragon Slayer</h3>
                            <p className="text-gray-300 text-xs mb-3">La collection arrive.</p>
                            <button className="text-xs font-bold text-white border-b border-manu-orange pb-0.5 hover:text-manu-orange transition-colors">Découvrir</button>
                        </div>
                    </div>

                </div>
            </aside>

            {/* --- COLONNE DROITE : PRODUITS --- */}
            <div className="flex-1 min-w-0">
                
                {/* 1. BANNIÈRE CRÉATEUR ACTIF */}
                {currentCreatorData && (
                    <div className="relative rounded-3xl overflow-hidden bg-[#0F1115] border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 group">
                        {/* Background */}
                        <div className="absolute inset-0 z-0">
                             <img src={currentCreatorData.bannerUrl || currentCreatorData.avatarUrl} className="w-full h-full object-cover opacity-20 blur-xl scale-110" alt="Background" />
                             <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115] via-[#0F1115]/90 to-transparent"></div>
                        </div>
                        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#0F1115] shadow-2xl overflow-hidden flex-shrink-0 relative">
                                <img src={currentCreatorData.avatarUrl} alt={currentCreatorData.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tight mb-2">{currentCreatorData.name}</h1>
                                <p className="text-gray-400 text-sm max-w-xl leading-relaxed mb-4 mx-auto md:mx-0">{currentCreatorData.bio || "Artiste partenaire officiel."}</p>
                                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold">
                                    <ShieldCheck size={12} /> Partenaire Certifié
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. FILTRES AVANCÉS */}
                <div className="sticky top-20 z-30 mb-8 pt-2 pb-4 bg-[#050505]/95 backdrop-blur-md space-y-4">
                   
                   <div className="flex flex-col md:flex-row gap-4 justify-between">
                       {/* Search */}
                       <div className="relative flex-1 max-w-lg group">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-manu-orange transition-colors" size={18} />
                           <input 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Rechercher un modèle, une référence..." 
                              className="w-full bg-[#151921] border border-gray-800 rounded-full py-3 pl-12 pr-10 text-sm text-white focus:border-manu-orange focus:bg-black focus:ring-1 focus:ring-manu-orange outline-none transition-all shadow-lg"
                           />
                           {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={16}/></button>}
                       </div>

                       {/* Categories Chips */}
                       <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                          {categories.map(cat => (
                              <button 
                                 key={cat}
                                 onClick={() => setActiveCategory(cat)}
                                 className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-white text-black border-white shadow-md transform scale-105' : 'bg-[#151921] text-gray-500 border-gray-800 hover:border-gray-600 hover:text-white'}`}
                              >
                                 {cat}
                              </button>
                           ))}
                       </div>
                   </div>

                   {/* Tags Chips */}
                   {allTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                         <span className="text-[10px] text-gray-500 uppercase font-bold mr-2 flex items-center gap-1"><Filter size={10} /> Filtres :</span>
                         {allTags.map(tag => (
                            <button
                               key={tag}
                               onClick={() => toggleTag(tag)}
                               className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all border flex items-center gap-1.5 ${
                                  selectedTags.includes(tag) 
                                    ? 'bg-manu-orange/10 text-manu-orange border-manu-orange/50' 
                                    : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600 hover:bg-white/5'
                               }`}
                            >
                               {tag}
                               {selectedTags.includes(tag) && <X size={10} />}
                            </button>
                         ))}
                         {selectedTags.length > 0 && (
                             <button onClick={() => setSelectedTags([])} className="ml-auto text-[10px] text-red-400 hover:text-red-300 underline font-bold">
                                Tout effacer
                             </button>
                         )}
                      </div>
                   )}
                </div>

                {/* 3. GRILLE PRODUITS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                   {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                       <div key={product.id} className="group relative bg-[#0F1115] rounded-2xl overflow-hidden border border-white/5 hover:border-manu-orange/40 transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex flex-col">
                         
                         {/* Image Area */}
                         <div 
                           className="relative aspect-[4/5] overflow-hidden bg-[#050505] cursor-pointer"
                           onClick={() => setSelectedProduct(product)}
                         >
                           {/* Background Glow */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                           
                           <img 
                             src={product.image} 
                             alt={product.title}
                             className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                             loading="lazy"
                           />

                           {/* Badges */}
                           <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                               {product.isNew && (
                                   <span className="bg-manu-orange text-black text-[10px] font-bold px-2.5 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1 animate-in fade-in slide-in-from-left">
                                     <Sparkles size={10} /> New
                                   </span>
                               )}
                           </div>
                           
                           {/* Multi-image indicator */}
                           {product.gallery && product.gallery.length > 0 && (
                               <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-white/10">
                                   <ImageIcon size={10} /> +{product.gallery.length}
                               </div>
                           )}
                           
                           {/* Hover Actions Overlay */}
                           <div className="absolute inset-0 z-20 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[2px]">
                               <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                  className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-manu-orange transition-colors shadow-xl transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                                  title="Aperçu rapide"
                               >
                                  <Eye size={20} />
                               </button>
                           </div>

                           {/* Quick Add Bottom Bar */}
                           <div className="absolute bottom-0 left-0 w-full p-4 z-30 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                               <button 
                                 onClick={(e) => handleAddToCart(product, e)}
                                 className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${justAddedId === product.id ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-manu-orange'}`}
                               >
                                 {justAddedId === product.id ? <><CheckCircle size={18}/> Ajouté !</> : <><ShoppingCart size={18}/> Ajouter</>}
                               </button>
                           </div>
                         </div>
        
                         {/* Info Area */}
                         <div className="p-5 flex-1 flex flex-col relative z-20 bg-[#0F1115]">
                           <div className="mb-2 flex justify-between items-start">
                              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold border border-white/10 px-2 py-0.5 rounded">{product.category}</span>
                              {creators.find(c => c.id === product.creatorId) && (
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                      <Brush size={10} /> {creators.find(c => c.id === product.creatorId)?.name}
                                  </span>
                              )}
                           </div>
                           
                           <h3 
                              className="text-lg font-bold text-white mb-2 font-display leading-tight group-hover:text-manu-orange transition-colors cursor-pointer line-clamp-2"
                              onClick={() => setSelectedProduct(product)}
                           >
                             {product.title}
                           </h3>
                           
                           {/* Tags line */}
                           <div className="flex flex-wrap gap-1 mb-4 h-5 overflow-hidden">
                               {product.tags?.slice(0, 3).map(tag => (
                                   <span key={tag} className="text-[9px] text-gray-500">#{tag}</span>
                               ))}
                           </div>

                           <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between">
                             <div>
                                <span className="block text-xl font-bold text-white">{product.price}</span>
                                <span className="text-[10px] text-gray-500">Prix TTC</span>
                             </div>
                             <div className="flex gap-0.5 mb-1">
                                {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />)}
                             </div>
                           </div>
                         </div>
                       </div>
                   )) : (
                      /* PREMIUM EMPTY STATE */
                      <div className="col-span-full py-32 flex flex-col items-center justify-center text-center px-4">
                         <div className="w-24 h-24 bg-[#151921] rounded-full flex items-center justify-center mb-6 relative border border-gray-800 shadow-2xl">
                             <Search size={40} className="text-gray-600" />
                             <div className="absolute top-0 right-0 w-8 h-8 bg-manu-orange rounded-full flex items-center justify-center animate-bounce">
                                 <span className="text-black font-bold text-lg">?</span>
                             </div>
                         </div>
                         <h3 className="text-2xl font-bold text-white mb-2 font-display">Aucun artefact trouvé</h3>
                         <p className="text-gray-400 max-w-md mb-8">
                             Désolé, nous n'avons rien trouvé pour "<span className="text-white">{searchQuery || activeCategory}</span>". Essayez d'autres mots-clés ou parcourez nos catégories.
                         </p>
                         <button 
                            onClick={() => { setSearchQuery(''); setActiveCategory('Tous'); setActiveCreator('Tous'); setSelectedTags([]); }} 
                            className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-manu-orange transition-all shadow-lg flex items-center gap-2"
                         >
                            <Zap size={18} /> Réinitialiser les filtres
                         </button>
                      </div>
                   )}
                </div>

            </div>

        </div>
      </div>
    </section>
  );
};

export default ProductList;
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Eye, CloudLightning, Filter, User, Brush, Layers, X, Sparkles, ChevronRight, Star } from 'lucide-react';
import { useLiveContent } from '../LiveContent';
import { useCart } from '../contexts/CartContext';

const ProductList: React.FC = () => {
  const { products, usingLive, creators } = useLiveContent();
  const { addToCart } = useCart();
  
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [activeCreator, setActiveCreator] = useState<string | 'Tous'>('Tous');

  // Extraction des catégories uniques
  const categories = useMemo(() => {
     const cats = new Set(products.map(p => p.category));
     return ['Tous', ...Array.from(cats)];
  }, [products]);

  // Filtrage
  const filteredProducts = products.filter(product => {
     const matchCat = activeCategory === 'Tous' || product.category === activeCategory;
     const matchCreator = activeCreator === 'Tous' || (product.creatorId && creators.find(c => c.name === activeCreator)?.id === product.creatorId);
     return matchCat && matchCreator;
  });

  // Trouver les infos du créateur actif
  const currentCreatorInfo = creators.find(c => c.name === activeCreator);

  return (
    <section id="shop" className="bg-[#0B0D10] relative min-h-screen">
      
      {/* --- BANDEAU CRÉATEURS (STYLE IMMERSIF) --- */}
      <div className="relative bg-[#151921] border-b border-gray-800 py-8">
         {/* Texture de fond subtile */}
         <div className="absolute inset-0 bg-[linear-gradient(45deg,#0F1216_25%,transparent_25%,transparent_75%,#0F1216_75%,#0F1216),linear-gradient(45deg,#0F1216_25%,transparent_25%,transparent_75%,#0F1216_75%,#0F1216)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] opacity-20 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0B0D10] to-transparent z-0"></div>

         <div className="max-w-[1600px] mx-auto px-4 relative z-10">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
                 <div className="p-2 bg-manu-orange rounded text-black"><Brush size={20} /></div>
                 <span>Les Artistes</span>
               </h2>
               {activeCreator !== 'Tous' && (
                  <button onClick={() => setActiveCreator('Tous')} className="text-sm text-manu-orange hover:text-white flex items-center gap-2 font-bold bg-black/50 px-3 py-1 rounded-full border border-manu-orange/30">
                     <X size={14}/> Tout Afficher
                  </button>
               )}
            </div>

            {/* Scroll Container */}
            <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x scroll-pl-4">
               
               {/* Carte "TOUS" */}
               <button 
                  onClick={() => setActiveCreator('Tous')}
                  className={`flex-shrink-0 snap-start relative w-40 h-56 md:w-48 md:h-64 rounded-xl overflow-hidden border-2 transition-all duration-300 group ${
                    activeCreator === 'Tous' 
                      ? 'border-manu-orange shadow-[0_0_25px_rgba(243,156,18,0.4)] scale-105 z-10' 
                      : 'border-gray-700 hover:border-gray-500 opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex flex-col items-center justify-center gap-4 p-4">
                     <div className={`p-4 rounded-full border-2 ${activeCreator === 'Tous' ? 'border-manu-orange bg-manu-orange/10 text-manu-orange' : 'border-gray-600 bg-gray-900 text-gray-500'}`}>
                        <Layers size={32} />
                     </div>
                     <div className="text-center">
                        <span className="font-bold text-white uppercase tracking-wider text-lg block">Catalogue</span>
                        <span className="text-xs text-gray-400">Complet</span>
                     </div>
                  </div>
               </button>

               {/* Cartes Artistes avec Images */}
               {creators.map(creator => {
                  const modelCount = products.filter(p => p.creatorId === creator.id).length;
                  return (
                    <button 
                      key={creator.id}
                      onClick={() => setActiveCreator(creator.name)}
                      className={`flex-shrink-0 snap-start relative w-40 h-56 md:w-48 md:h-64 rounded-xl overflow-hidden border-2 transition-all duration-300 group ${
                        activeCreator === creator.name
                          ? 'border-manu-orange shadow-[0_0_25px_rgba(243,156,18,0.4)] scale-105 z-10'
                          : 'border-gray-700 hover:border-gray-500 grayscale hover:grayscale-0 brightness-50 hover:brightness-100'
                      }`}
                    >
                      {/* Image de fond (Avatar en grand) */}
                      <div className="absolute inset-0 bg-gray-900">
                          {creator.avatarUrl ? (
                            <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600"><User size={48}/></div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                      </div>

                      {/* Infos */}
                      <div className="absolute bottom-0 left-0 w-full p-4 text-left">
                          <span className={`block font-display font-bold text-lg uppercase leading-none mb-1 ${activeCreator === creator.name ? 'text-manu-orange' : 'text-white'}`}>
                              {creator.name}
                          </span>
                          <span className="text-xs text-gray-300 font-bold bg-white/10 px-2 py-0.5 rounded-full inline-block backdrop-blur-sm border border-white/5">
                            {modelCount} Modèles
                          </span>
                      </div>

                      {/* Indicateur actif */}
                      {activeCreator === creator.name && (
                          <div className="absolute top-3 right-3 bg-manu-orange text-black p-1 rounded-full shadow-lg animate-in zoom-in">
                            <Star size={12} fill="currentColor" />
                          </div>
                      )}
                    </button>
                  );
               })}
            </div>
         </div>
      </div>

      {/* --- MAIN AREA : PRODUITS --- */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
         
         {/* Filter Bar & Title */}
         <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10 pb-6 border-b border-gray-800/50">
            <div>
               <h3 className="text-2xl md:text-4xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
                  {activeCreator === 'Tous' ? (
                     <>Collections <span className="text-transparent bg-clip-text bg-gradient-to-r from-manu-orange to-yellow-200">Officielles</span></>
                  ) : (
                     <>
                        <span className="text-gray-500 text-xl md:text-2xl">Univers :</span> 
                        <span className="text-manu-orange">{activeCreator}</span>
                     </>
                  )}
               </h3>
               <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                  <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-xs font-bold">{filteredProducts.length}</span> artefacts disponibles
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                  Peints à la main ou Kit brut
               </p>
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-3 bg-[#151921] px-5 py-3 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors">
               <Filter size={16} className="text-manu-orange"/>
               <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Catégorie</span>
                  <select 
                    value={activeCategory} 
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none cursor-pointer font-bold uppercase tracking-wide appearance-none pr-6"
                  >
                      {categories.map(cat => <option key={cat} value={cat} className="bg-black text-gray-300">{cat}</option>)}
                  </select>
               </div>
               <ChevronRight size={16} className="text-gray-500 rotate-90 ml-auto" />
            </div>
         </div>

         {/* GRILLE PRODUITS */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {filteredProducts.length > 0 ? filteredProducts.map((product) => {
             const creator = creators.find(c => c.id === product.creatorId);
             
             return (
               <div key={product.id} className="group bg-[#121418] rounded-2xl overflow-hidden border border-gray-800 hover:border-manu-orange/50 transition-all duration-300 relative flex flex-col hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:-translate-y-2">
                 
                 {/* Badges Flottants */}
                 <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                     {product.isNew && (
                       <span className="bg-manu-orange text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg flex items-center gap-1">
                         <Sparkles size={10} /> New
                       </span>
                     )}
                 </div>

                 {/* Image */}
                 <div className="relative h-72 overflow-hidden bg-gray-900">
                   <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-transparent to-transparent opacity-60 z-10" />
                   <img 
                     src={product.image} 
                     alt={product.title}
                     className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                     loading="lazy"
                     onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Non+Trouvée'; }}
                   />
                   
                   {/* Bouton Aperçu Rapide */}
                   <div className="absolute bottom-4 right-4 z-20 translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
                      <button className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur text-white hover:text-manu-orange rounded-full border border-white/10 hover:border-manu-orange transition-all text-xs font-bold uppercase">
                         <Eye size={14} /> Aperçu
                      </button>
                   </div>
                 </div>

                 {/* Contenu */}
                 <div className="p-6 flex-grow flex flex-col">
                   <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold border border-gray-700 px-2 py-1 rounded">
                         {product.category}
                      </span>
                      {creator && activeCreator === 'Tous' && (
                         <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Brush size={10} className="text-gray-400" /> {creator.name}
                         </span>
                      )}
                   </div>
                   
                   <h3 className="text-lg font-bold text-white mb-2 font-display leading-tight group-hover:text-manu-orange transition-colors">
                     {product.title}
                   </h3>
                   
                   <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed font-light">
                     {product.description}
                   </p>
                   
                   <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-800/50">
                     <div className="flex flex-col">
                        <span className="text-xl font-bold font-display text-white">{product.price}</span>
                     </div>
                     <button 
                         onClick={() => addToCart(product)}
                         className="flex items-center gap-2 bg-white text-black hover:bg-manu-orange px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 hover:shadow-[0_0_15px_rgba(243,156,18,0.4)] transform hover:-translate-y-0.5"
                     >
                       <ShoppingCart size={16} />
                       Looter
                     </button>
                   </div>
                 </div>
               </div>
             );
           }) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-[#121418]/30 rounded-3xl border border-gray-800 border-dashed animate-in fade-in">
                 <Filter size={64} className="mb-6 opacity-20 text-manu-orange" />
                 <p className="font-bold text-xl text-gray-300">Aucun artefact trouvé.</p>
                 <p className="text-sm mb-6">Essayez de changer de filtre ou d'artiste.</p>
                 <button onClick={() => { setActiveCategory('Tous'); setActiveCreator('Tous'); }} className="px-8 py-3 bg-gray-800 hover:bg-white hover:text-black rounded-full text-sm font-bold transition-all">
                    Réinitialiser les filtres
                 </button>
              </div>
           )}
         </div>

      </div>
    </section>
  );
};

export default ProductList;
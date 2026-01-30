import React, { useState, useMemo } from 'react';
import { ShoppingCart, Eye, Filter, User, Brush, X, Sparkles, ChevronRight, Star, Layers, Box, ShieldCheck } from 'lucide-react';
import { useLiveContent } from '../LiveContent';
import { useCart } from '../contexts/CartContext';

const ProductList: React.FC = () => {
  const { products, creators } = useLiveContent();
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

  return (
    <section id="shop" className="bg-[#0B0D10] relative min-h-screen">
      
      {/* --- BANDEAU VIGNETTES CRÉATEURS (FILTRE VISUEL) --- */}
      <div className="relative bg-[#151921] border-b border-gray-800 pt-12 pb-16">
         {/* Texture de fond */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-4 relative z-10">
            
            <div className="text-center mb-10">
               <h2 className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-widest mb-2">
                 Nos <span className="text-manu-orange">Créateurs</span>
               </h2>
               <p className="text-gray-400 text-sm font-light">
                 Sélectionnez un univers pour filtrer le catalogue
               </p>
            </div>

            {/* GRILLE DE VIGNETTES */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
               
               {/* BOUTON 'TOUS' */}
               <button 
                  onClick={() => setActiveCreator('Tous')}
                  className="group flex flex-col items-center gap-3 transition-all duration-300"
               >
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative overflow-hidden ${activeCreator === 'Tous' ? 'border-manu-orange bg-manu-orange text-black shadow-[0_0_20px_rgba(243,156,18,0.4)] scale-110' : 'border-gray-700 bg-gray-800 text-gray-400 group-hover:border-gray-500 group-hover:text-white'}`}>
                      <Layers size={32} />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${activeCreator === 'Tous' ? 'text-manu-orange' : 'text-gray-500 group-hover:text-white'}`}>
                    Tout Voir
                  </span>
               </button>

               {/* LISTE DES CRÉATEURS */}
               {creators.map(creator => {
                  const isActive = activeCreator === creator.name;
                  return (
                    <button 
                      key={creator.id}
                      onClick={() => setActiveCreator(creator.name)}
                      className="group flex flex-col items-center gap-3 transition-all duration-300"
                    >
                      {/* Avatar Cercle */}
                      <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-2 p-1 transition-all duration-500 relative ${isActive ? 'border-manu-orange scale-110 shadow-[0_0_20px_rgba(243,156,18,0.3)]' : 'border-gray-700 group-hover:border-gray-500'}`}>
                          <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                            {creator.avatarUrl ? (
                                <img 
                                  src={creator.avatarUrl} 
                                  alt={creator.name} 
                                  className={`w-full h-full object-cover transition-all duration-500 ${isActive ? 'filter-none' : 'filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-600">
                                   <User size={24} />
                                </div>
                            )}
                          </div>
                          
                          {/* Indicateur Actif */}
                          {isActive && (
                            <div className="absolute -bottom-1 -right-1 bg-manu-orange text-black p-1 rounded-full shadow-lg border-2 border-[#151921] animate-in zoom-in">
                               <Star size={12} fill="currentColor" />
                            </div>
                          )}
                      </div>

                      {/* Nom */}
                      <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-manu-orange' : 'text-gray-500 group-hover:text-white'}`}>
                        {creator.name}
                      </span>
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
               <h3 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
                  {activeCreator === 'Tous' ? (
                     <>Catalogue <span className="text-transparent bg-clip-text bg-gradient-to-r from-manu-orange to-yellow-200">Complet</span></>
                  ) : (
                     <>
                        <span className="text-gray-500 text-xl">Collection :</span> 
                        <span className="text-manu-orange">{activeCreator}</span>
                     </>
                  )}
               </h3>
               <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                  <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-xs font-bold">{filteredProducts.length}</span> artefacts disponibles
                  {activeCreator !== 'Tous' && <span className="text-green-500 text-xs flex items-center gap-1"><ShieldCheck size={12}/> Licence Officielle</span>}
               </p>
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-3 bg-[#151921] px-5 py-3 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors">
               <Filter size={16} className="text-manu-orange"/>
               <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Type</span>
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
                      {creator && (
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
                 <Box size={64} className="mb-6 opacity-20 text-manu-orange" />
                 <p className="font-bold text-xl text-gray-300">La salle des coffres est vide pour ce filtre.</p>
                 <p className="text-sm mb-6 text-gray-500">Essayez de sélectionner "Tout Voir" ou une autre catégorie.</p>
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
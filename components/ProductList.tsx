import React, { useState, useMemo } from 'react';
import { ShoppingCart, Eye, Filter, User, Brush, X, Sparkles, ChevronRight, Star, Layers, Box, ShieldCheck, Heart } from 'lucide-react';
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
    <section id="shop" className="bg-[#050505] relative min-h-screen pb-24">
      
      {/* --- BANDEAU CRÉATEURS --- */}
      <div className="relative bg-[#0F1115] border-b border-white/5 pt-16 pb-20 overflow-hidden">
         {/* Background Glow */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-manu-orange/5 blur-3xl rounded-full pointer-events-none" />

         <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-widest mb-10">
              Nos <span className="text-gradient">Collections</span>
            </h2>

            {/* SLIDER CRÉATEURS */}
            <div className="flex flex-wrap justify-center gap-8">
               <button 
                  onClick={() => setActiveCreator('Tous')}
                  className={`group flex flex-col items-center gap-4 transition-all duration-300 ${activeCreator === 'Tous' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
               >
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border transition-all duration-300 relative overflow-hidden ${activeCreator === 'Tous' ? 'border-manu-orange bg-manu-orange text-black shadow-lg shadow-manu-orange/20 rotate-3' : 'border-white/10 bg-white/5 text-gray-400 group-hover:border-white/30'}`}>
                      <Layers size={28} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Tout Voir</span>
               </button>

               {creators.map(creator => {
                  const isActive = activeCreator === creator.name;
                  return (
                    <button 
                      key={creator.id}
                      onClick={() => setActiveCreator(creator.name)}
                      className={`group flex flex-col items-center gap-4 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                    >
                      <div className={`w-20 h-20 rounded-2xl p-1 transition-all duration-500 relative ${isActive ? 'bg-gradient-to-br from-manu-orange to-yellow-500 shadow-lg rotate-3' : 'bg-white/5 border border-white/10 group-hover:border-white/30'}`}>
                          <img 
                            src={creator.avatarUrl} 
                            alt={creator.name} 
                            className="w-full h-full object-cover rounded-xl filter"
                          />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-white">{creator.name}</span>
                    </button>
                  );
               })}
            </div>
         </div>
      </div>

      {/* --- PRODUITS --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
         
         {/* Filter Bar */}
         <div className="sticky top-24 z-30 glass-panel rounded-2xl p-4 mb-12 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl animate-fade-up">
            <div className="flex items-center gap-3 pl-2">
               <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded">{filteredProducts.length}</span>
               <span className="text-sm font-bold text-gray-300 uppercase tracking-wide">Artefacts Disponibles</span>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
               {categories.map(cat => (
                  <button 
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-manu-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                  >
                     {cat}
                  </button>
               ))}
            </div>
         </div>

         {/* GRILLE */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {filteredProducts.length > 0 ? filteredProducts.map((product) => (
               <div key={product.id} className="group relative bg-[#0F1115] rounded-3xl overflow-hidden border border-white/5 hover:border-manu-orange/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                 
                 {/* Image Container */}
                 <div className="relative aspect-[4/5] overflow-hidden bg-[#050505]">
                   <img 
                     src={product.image} 
                     alt={product.title}
                     className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                     loading="lazy"
                   />
                   
                   {/* Overlay Gradient */}
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-transparent to-transparent opacity-80" />

                   {/* Badges */}
                   <div className="absolute top-4 left-4 flex flex-col gap-2">
                     {product.isNew && (
                       <span className="bg-manu-orange text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 w-fit">
                         <Sparkles size={10} /> New
                       </span>
                     )}
                   </div>

                   {/* Quick Actions (Reveal on Hover) */}
                   <div className="absolute top-4 right-4 translate-x-10 group-hover:translate-x-0 transition-transform duration-300 flex flex-col gap-2">
                      <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                         <Heart size={18} />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                         <Eye size={18} />
                      </button>
                   </div>
                 </div>

                 {/* Content */}
                 <div className="absolute bottom-0 left-0 w-full p-6">
                   <div className="mb-2">
                      <span className="text-[10px] text-manu-orange font-bold uppercase tracking-widest">{product.category}</span>
                   </div>
                   
                   <h3 className="text-xl font-bold text-white mb-2 font-display leading-none group-hover:text-manu-orange transition-colors">
                     {product.title}
                   </h3>
                   
                   <div className="flex items-center justify-between mt-4">
                     <span className="text-lg font-bold text-white">{product.price}</span>
                     
                     <button 
                         onClick={() => addToCart(product)}
                         className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-manu-orange transition-all hover:scale-110 shadow-lg"
                     >
                       <ShoppingCart size={18} />
                     </button>
                   </div>
                 </div>
               </div>
           )) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-gray-500 bg-[#0F1115] rounded-3xl border border-dashed border-gray-800">
                 <Box size={48} className="mb-4 text-gray-700" />
                 <p className="font-bold text-gray-400">La salle des coffres est vide.</p>
                 <button onClick={() => { setActiveCategory('Tous'); setActiveCreator('Tous'); }} className="mt-4 px-6 py-2 bg-white/5 hover:bg-white hover:text-black rounded-full text-sm font-bold transition-all">
                    Reset Filtres
                 </button>
              </div>
           )}
         </div>

      </div>
    </section>
  );
};

export default ProductList;
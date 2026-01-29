import React, { useState, useMemo } from 'react';
import { ShoppingCart, Eye, Sparkles, Gem, Shield, Star, CloudLightning, Filter, User } from 'lucide-react';
import { useLiveContent } from '../LiveContent';
import { useCart } from '../contexts/CartContext';

const ProductList: React.FC = () => {
  const { products, usingLive, creators } = useLiveContent();
  const { addToCart } = useCart();
  
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [activeCreator, setActiveCreator] = useState('Tous');

  // Extraction des catégories uniques
  const categories = useMemo(() => {
     const cats = new Set(products.map(p => p.category));
     return ['Tous', ...Array.from(cats)];
  }, [products]);

  // Filtrage
  const filteredProducts = products.filter(product => {
     const matchCat = activeCategory === 'Tous' || product.category === activeCategory;
     // Si creators est vide (local), on ignore le filtre créateur
     const matchCreator = activeCreator === 'Tous' || (product.creatorId && creators.find(c => c.name === activeCreator)?.id === product.creatorId);
     return matchCat && matchCreator;
  });

  return (
    <section id="shop" className="py-24 bg-gradient-to-b from-manu-black to-manu-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-manu-orange/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="w-12 h-1 bg-manu-orange rounded-full"></span>
               <span className="text-manu-orange font-bold uppercase tracking-widest text-sm">Le Loot Shop</span>
               {usingLive && <span className="ml-2 px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-500 text-[10px] rounded-full flex items-center gap-1 font-bold animate-pulse"><CloudLightning size={10} /> LIVE</span>}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white font-display uppercase leading-none">
              Nos Créations <span className="text-transparent bg-clip-text bg-gradient-to-r from-manu-orange to-yellow-300">Exclusives</span>
            </h2>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center bg-[#151921] p-2 rounded-lg border border-gray-800">
             <div className="flex items-center gap-2 px-3 text-gray-500 text-sm uppercase font-bold border-r border-gray-700">
                <Filter size={14} /> Filtres
             </div>
             
             {/* Catégories */}
             <select 
               value={activeCategory} 
               onChange={(e) => setActiveCategory(e.target.value)}
               className="bg-black text-white text-sm px-3 py-2 rounded border border-gray-700 focus:border-manu-orange outline-none"
             >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </select>

             {/* Créateurs */}
             {creators.length > 0 && (
                <select 
                  value={activeCreator} 
                  onChange={(e) => setActiveCreator(e.target.value)}
                  className="bg-black text-white text-sm px-3 py-2 rounded border border-gray-700 focus:border-manu-orange outline-none"
                >
                   <option value="Tous">Tous les Créateurs</option>
                   {creators.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
             )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? filteredProducts.map((product) => {
            const creator = creators.find(c => c.id === product.creatorId);
            
            return (
              <div key={product.id} className="group bg-[#121418] rounded-xl overflow-hidden border border-gray-800 hover:border-manu-orange/50 transition-all duration-300 relative flex flex-col hover:shadow-lg">
                
                {/* Badges */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 items-start">
                    {product.isNew && (
                      <span className="bg-manu-orange text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">
                        Nouveau
                      </span>
                    )}
                    {creator && (
                        <span className="bg-black/80 backdrop-blur-md text-white border border-gray-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                           <User size={10} className="text-gray-400" /> {creator.name}
                        </span>
                    )}
                </div>
                
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden bg-gray-900">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121418] to-transparent opacity-60 z-10" />
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Non+Trouvée'; }}
                  />
                  
                  {/* Quick Action Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 flex justify-center">
                     <button className="flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide transition-all border border-white/20">
                       <Eye size={14} /> Aperçu Rapide
                     </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col relative">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                    {product.category}
                  </span>
                  
                  <h3 className="text-lg font-bold text-white mb-3 font-display leading-tight group-hover:text-manu-orange transition-colors">
                    {product.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-gray-800 pt-4">
                    <span className="text-xl font-bold font-display text-white group-hover:text-manu-orange transition-colors">{product.price}</span>
                    <button 
                        onClick={() => addToCart(product)}
                        className="flex items-center gap-2 bg-white text-black hover:bg-manu-orange px-4 py-2 rounded text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:shadow-[0_0_15px_rgba(243,156,18,0.4)] transform hover:-translate-y-0.5"
                    >
                      <ShoppingCart size={16} />
                      <span className="hidden sm:inline">Looter</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
             <div className="col-span-full text-center py-20 text-gray-500">
                <p className="text-lg">Aucun artefact trouvé dans cette catégorie.</p>
                <button onClick={() => { setActiveCategory('Tous'); setActiveCreator('Tous'); }} className="mt-4 text-manu-orange underline">Réinitialiser les filtres</button>
             </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductList;
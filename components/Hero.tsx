import React, { useState } from 'react';
import { Printer, ShoppingCart, ArrowRight, Hammer, Sparkles } from 'lucide-react';
import { useLiveContent } from '../LiveContent';

interface HeroProps {
  setView: (view: 'atelier' | 'shop') => void;
}

const Hero: React.FC<HeroProps> = ({ setView }) => {
  const { hero, assets } = useLiveContent();
  const [hoveredSide, setHoveredSide] = useState<'none' | 'left' | 'right'>('none');

  return (
    <div id="home" className="relative h-screen w-full overflow-hidden flex bg-[#0F1216]">
      
      {/* Background Video Global - Bandeau principal */}
      <div className="absolute inset-0 z-0">
         {/* Overlay assombrissant léger pour la lisibilité du texte */}
         <div className="absolute inset-0 bg-black/50 z-10" />
         <video 
            className="w-full h-full object-cover opacity-90"
            autoPlay loop muted playsInline
            key={assets.heroVideo} // Force refresh si la source change via Supabase
            poster="https://picsum.photos/1920/1080?blur=5"
          >
            <source src={assets.heroVideo} type="video/mp4" />
          </video>
      </div>

      <div className="relative z-20 w-full h-full flex flex-col md:flex-row">
        
        {/* COTÉ ATELIER (GAUCHE) */}
        <div 
          className={`relative flex-1 flex flex-col justify-center items-center p-8 transition-all duration-700 ease-in-out border-b md:border-b-0 md:border-r border-gray-800/30 cursor-pointer group ${hoveredSide === 'left' ? 'flex-[1.5] bg-manu-orange/10 backdrop-blur-sm' : hoveredSide === 'right' ? 'flex-[0.8] opacity-60' : 'flex-1'}`}
          onMouseEnter={() => setHoveredSide('left')}
          onMouseLeave={() => setHoveredSide('none')}
          onClick={() => setView('atelier')}
        >
           <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-blue-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           
           <div className="relative z-10 text-center transform group-hover:-translate-y-2 transition-transform duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#151921]/80 backdrop-blur border border-blue-500/30 text-blue-400 mb-6 group-hover:scale-110 group-hover:border-blue-500 transition-all shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                 <Printer size={40} />
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 uppercase tracking-tight drop-shadow-lg">
                L'Atelier <span className="text-blue-500">3D</span>
              </h2>
              <p className="text-gray-200 max-w-sm mx-auto mb-8 font-light h-12 drop-shadow-md">
                Impression sur mesure, devis en ligne et services techniques pour vos projets.
              </p>
              <button className="px-8 py-3 rounded-full border border-blue-500/50 bg-black/40 backdrop-blur text-blue-400 font-bold uppercase tracking-widest text-xs hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2 mx-auto">
                <Hammer size={14} />
                Configurer mon projet
              </button>
           </div>
        </div>

        {/* COTÉ BOUTIQUE (DROITE) */}
        <div 
          className={`relative flex-1 flex flex-col justify-center items-center p-8 transition-all duration-700 ease-in-out cursor-pointer group ${hoveredSide === 'right' ? 'flex-[1.5] bg-manu-orange/10 backdrop-blur-sm' : hoveredSide === 'left' ? 'flex-[0.8] opacity-60' : 'flex-1'}`}
          onMouseEnter={() => setHoveredSide('right')}
          onMouseLeave={() => setHoveredSide('none')}
          onClick={() => setView('shop')}
        >
           <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-l from-manu-orange/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           
           <div className="relative z-10 text-center transform group-hover:-translate-y-2 transition-transform duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#151921]/80 backdrop-blur border border-manu-orange/30 text-manu-orange mb-6 group-hover:scale-110 group-hover:border-manu-orange transition-all shadow-[0_0_30px_rgba(243,156,18,0.1)]">
                 <ShoppingCart size={40} />
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 uppercase tracking-tight drop-shadow-lg">
                La <span className="text-manu-orange">Boutique</span>
              </h2>
              <p className="text-gray-200 max-w-sm mx-auto mb-8 font-light h-12 drop-shadow-md">
                Figurines peintes, décorations Geek et créations exclusives prêtes à expédier.
              </p>
              <button className="px-8 py-3 rounded-full border border-manu-orange/50 bg-black/40 backdrop-blur text-manu-orange font-bold uppercase tracking-widest text-xs hover:bg-manu-orange hover:text-black transition-all flex items-center gap-2 mx-auto">
                <Sparkles size={14} />
                Voir les produits
              </button>
           </div>
        </div>

      </div>

      {/* Badge Central */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none hidden md:block">
         <div className="bg-[#0F1216]/90 backdrop-blur border border-gray-800 text-gray-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">
            Ou
         </div>
      </div>

    </div>
  );
};

export default Hero;
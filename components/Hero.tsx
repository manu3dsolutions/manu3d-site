import React, { useState } from 'react';
import { Printer, ShoppingCart, Hammer, Sparkles, Image as ImageIcon, Send, ChevronDown } from 'lucide-react';
import { useLiveContent } from '../LiveContent';

interface HeroProps {
  setView: (view: 'atelier' | 'shop') => void;
}

const Hero: React.FC<HeroProps> = ({ setView }) => {
  const { assets } = useLiveContent();
  const [hoveredSide, setHoveredSide] = useState<'none' | 'left' | 'right'>('none');

  return (
    <div id="home" className="relative h-screen w-full overflow-hidden flex bg-[#050505] pt-16 lg:pt-0">
      
      {/* Background Video Global */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10" />
         <video 
            className="w-full h-full object-cover opacity-60 scale-105"
            autoPlay loop muted playsInline
            key={assets.heroVideo}
            poster="https://picsum.photos/1920/1080?blur=5"
          >
            <source src={assets.heroVideo} type="video/mp4" />
          </video>
      </div>

      <div className="relative z-20 w-full h-full flex flex-col md:flex-row">
        
        {/* --- PARTIE GAUCHE : L'ATELIER --- */}
        <div 
          className={`relative flex-1 flex flex-col justify-center items-center p-8 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer group border-b md:border-b-0 md:border-r border-white/5 ${
            hoveredSide === 'left' ? 'md:flex-[1.5] bg-black/40 backdrop-blur-sm' : hoveredSide === 'right' ? 'md:flex-[0.6] opacity-40 grayscale' : 'md:flex-1'
          }`}
          onMouseEnter={() => setHoveredSide('left')}
          onMouseLeave={() => setHoveredSide('none')}
          onClick={() => setView('atelier')} 
        >
           {/* Glow Effect */}
           <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-duration-700 pointer-events-none" />
           
           <div className="relative z-10 text-center transform transition-transform duration-500 group-hover:scale-105">
              <span className="inline-block py-1 px-3 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4 animate-fade-up">
                 Service Premium
              </span>
              <h2 className="text-4xl md:text-7xl font-display font-bold text-white mb-4 uppercase tracking-tight drop-shadow-2xl">
                L'Atelier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">3D</span>
              </h2>
              <p className={`text-gray-300 max-w-sm mx-auto mb-8 font-light leading-relaxed transition-all duration-500 ${hoveredSide === 'right' ? 'opacity-0 h-0' : 'opacity-100 h-auto'}`}>
                Concrétisez vos projets les plus fous. Impression résine haute définition, peinture artistique et modélisation.
              </p>
              
              <div className={`flex gap-4 justify-center transition-all duration-500 ${hoveredSide === 'right' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                  <button className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2">
                    <Send size={14} /> Demander un devis
                  </button>
              </div>
           </div>
        </div>

        {/* --- PARTIE DROITE : LA BOUTIQUE --- */}
        <div 
          className={`relative flex-1 flex flex-col justify-center items-center p-8 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer group ${
            hoveredSide === 'right' ? 'md:flex-[1.5] bg-black/40 backdrop-blur-sm' : hoveredSide === 'left' ? 'md:flex-[0.6] opacity-40 grayscale' : 'md:flex-1'
          }`}
          onMouseEnter={() => setHoveredSide('right')}
          onMouseLeave={() => setHoveredSide('none')}
          onClick={() => setView('shop')}
        >
           {/* Glow Effect */}
           <div className="absolute inset-0 bg-gradient-to-bl from-manu-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-duration-700 pointer-events-none" />
           
           <div className="relative z-10 text-center transform transition-transform duration-500 group-hover:scale-105">
              <span className="inline-block py-1 px-3 rounded-full border border-manu-orange/30 bg-manu-orange/10 text-manu-orange text-[10px] font-bold uppercase tracking-widest mb-4 animate-fade-up">
                 Collection Exclusive
              </span>
              <h2 className="text-4xl md:text-7xl font-display font-bold text-white mb-4 uppercase tracking-tight drop-shadow-2xl">
                Le <span className="text-transparent bg-clip-text bg-gradient-to-r from-manu-orange to-yellow-300">Shop</span>
              </h2>
              <p className={`text-gray-300 max-w-sm mx-auto mb-8 font-light leading-relaxed transition-all duration-500 ${hoveredSide === 'left' ? 'opacity-0 h-0' : 'opacity-100 h-auto'}`}>
                Découvrez nos éditions limitées. Figurines peintes main, décors immersifs et artefacts de pop-culture.
              </p>
              
              <div className={`flex gap-4 justify-center transition-all duration-500 ${hoveredSide === 'left' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                  <button className="px-8 py-3 rounded-full bg-manu-orange hover:bg-white text-black font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-manu-orange/30 flex items-center gap-2">
                    <ShoppingCart size={14} /> Voir le catalogue
                  </button>
              </div>
           </div>
        </div>

      </div>

      {/* Badge Central "VS" Style */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none hidden md:flex items-center justify-center w-16 h-16 rounded-full glass-panel border border-white/10 shadow-2xl">
         <span className="font-display font-bold text-gray-400 text-lg">OU</span>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 animate-bounce text-gray-500 hidden md:block">
         <ChevronDown size={24} />
      </div>

    </div>
  );
};

export default Hero;
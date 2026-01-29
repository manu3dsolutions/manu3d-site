import React, { useState } from 'react';
import { useLiveContent } from '../LiveContent';
import { ArrowRight, MessageSquarePlus, Share2, Check } from 'lucide-react';

const Portfolio: React.FC = () => {
  const { portfolio } = useLiveContent();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleShare = async (item: typeof portfolio[0]) => {
    const shareData = {
      title: `Manu3D - ${item.title}`,
      text: `Regarde cette réalisation incroyable de Manu3D : ${item.title}. ${item.description}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.debug('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  return (
    <section id="portfolio" className="py-24 bg-[#0F1216] relative border-t border-gray-900 overflow-hidden">
       {/* Texture de fond subtile style 'Atelier' */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
       }} />
       
       <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0F1216] to-transparent z-10 pointer-events-none" />

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center mb-20">
            <span className="text-manu-orange/80 uppercase tracking-[0.2em] text-sm font-semibold mb-2 block">Galerie Exclusive</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display tracking-tight">
              L'Atelier des <span className="text-transparent bg-clip-text bg-gradient-to-r from-manu-orange to-amber-200">Créations</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-manu-orange to-transparent mx-auto mb-6 opacity-50"></div>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Plongez dans notre collection de projets d'exception. Chaque pièce raconte une histoire, sculptée dans la résine et sublimée par le pinceau.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {portfolio.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-xl h-[28rem] bg-[#151921] border border-white/5 hover:border-manu-orange/30 transition-all duration-500 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(243,156,18,0.1)]">
                
                {/* Filigrane de protection style Signature */}
                <div className="absolute top-6 left-6 z-30 pointer-events-none select-none opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="font-display font-bold text-white/10 text-lg tracking-[0.3em] uppercase drop-shadow-md">
                    MANU3D
                  </span>
                </div>

                <button
                  onClick={() => handleShare(item)}
                  className="absolute top-6 right-6 z-30 p-3 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-manu-orange hover:text-black transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 border border-white/10"
                  aria-label="Partager ce projet"
                  title="Partager ce projet"
                >
                  {copiedId === item.id ? <Check size={18} /> : <Share2 size={18} />}
                </button>

                <div className="w-full h-full overflow-hidden bg-black relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100 filter grayscale-[10%] group-hover:grayscale-0"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Projet'; }}
                  />
                  {/* Vignette effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151921] via-[#151921]/40 to-transparent opacity-90 transition-opacity duration-300" />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    {/* Decorative line */}
                    <div className="w-12 h-0.5 bg-manu-orange mb-4 origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100" />
                    
                    <h3 className="text-3xl font-bold text-white font-display mb-3 tracking-wide drop-shadow-lg">{item.title}</h3>
                    <p className="text-gray-400 line-clamp-2 group-hover:text-gray-200 transition-colors mb-6 font-light leading-relaxed text-sm md:text-base mix-blend-plus-lighter">
                      {item.description}
                    </p>
                    <a href="#contact" className="inline-flex items-center gap-2 text-manu-orange font-bold uppercase text-xs tracking-[0.15em] hover:text-white transition-colors group/link">
                      <MessageSquarePlus size={16} className="group-hover/link:scale-110 transition-transform" />
                      Commander ce modèle
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
             <a href="#contact" className="inline-flex items-center gap-3 bg-white/5 border border-white/10 text-white hover:bg-manu-orange hover:text-black hover:border-manu-orange px-10 py-4 rounded-sm font-display font-bold uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_20px_rgba(243,156,18,0.3)] backdrop-blur-sm">
               Démarrer un projet
               <ArrowRight size={18} />
             </a>
          </div>
       </div>
    </section>
  )
}

export default Portfolio;
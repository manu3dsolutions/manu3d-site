import React from 'react';
import { Brush, Gamepad2, Swords, ArrowRight, Cuboid, Zap } from 'lucide-react';

const ServiceCard: React.FC<{ icon: React.ReactNode, title: string, text: string, delay: string, colorClass: string }> = ({ icon, title, text, delay, colorClass }) => (
  <div className={`group relative p-8 rounded-3xl bg-[#0F1115] border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${delay}`}>
    
    {/* Background Gradient on Hover */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${colorClass}`} />
    
    <div className="relative z-10 flex flex-col h-full">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-500 border border-white/5 shadow-inner">
            {icon}
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-3 font-display tracking-wide">{title}</h3>
        
        <p className="text-gray-400 leading-relaxed font-light text-sm mb-6 flex-grow">
            {text}
        </p>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity text-white">
            <span className="w-8 h-[1px] bg-white"></span>
            Découvrir
        </div>
    </div>
  </div>
);

const Services: React.FC = () => {
  return (
    <section id="services" className="py-32 bg-[#050505] relative overflow-hidden">
      {/* Background Noise/Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
                <span className="text-manu-orange font-bold uppercase tracking-widest text-xs mb-4 block flex items-center gap-2">
                    <Zap size={14} /> Expertises
                </span>
                <h2 className="text-4xl md:text-6xl font-bold text-white font-display leading-tight">
                    L'Artisanat 3D <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-manu-orange to-amber-200">Nouvelle Génération</span>
                </h2>
            </div>
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed border-l border-gray-800 pl-6">
                Nous combinons les technologies d'impression les plus avancées avec un savoir-faire artistique traditionnel pour créer des objets uniques.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServiceCard 
            icon={<Brush size={28} />}
            title="Peinture Art"
            text="Nos artistes donnent vie à la matière. Techniques d'aérographie, lavis, brossage à sec et pigments naturels pour un réalisme saisissant."
            delay="delay-0"
            colorClass="from-purple-500 to-blue-500"
          />
          <ServiceCard 
            icon={<Gamepad2 size={28} />}
            title="Déco & Gaming"
            text="Transformez votre setup. Supports de manettes, enseignes lumineuses, dioramas et accessoires exclusifs introuvables ailleurs."
            delay="delay-100"
            colorClass="from-manu-orange to-red-500"
          />
          <ServiceCard 
            icon={<Swords size={28} />}
            title="Cosplay Pro"
            text="De la modélisation à l'assemblage final. Accessoires légers, résistants et détaillés pour vos costumes les plus ambitieux."
            delay="delay-200"
            colorClass="from-green-500 to-emerald-500"
          />
        </div>
        
        {/* Banner Bottom */}
        <div className="mt-6 p-8 rounded-3xl bg-[#0F1115] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Cuboid size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Besoin de Prototypage ?</h3>
                    <p className="text-gray-400 text-sm">Service rapide pour les pros et designers.</p>
                </div>
            </div>
            <button className="relative z-10 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-lg flex items-center gap-2">
                Accès Atelier Pro <ArrowRight size={16}/>
            </button>
        </div>

      </div>
    </section>
  );
};

export default Services;
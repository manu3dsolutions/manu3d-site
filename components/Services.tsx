import React from 'react';
import { Brush, Gamepad2, Swords, ArrowRight } from 'lucide-react';

const ServiceCard: React.FC<{ icon: React.ReactNode, title: string, text: string }> = ({ icon, title, text }) => (
  <div className="relative p-8 rounded-2xl bg-[#151921] border border-gray-800 group hover:border-manu-orange/50 transition-all duration-500 overflow-hidden hover:shadow-[0_10px_30px_-10px_rgba(243,156,18,0.15)] flex flex-col h-full">
    
    {/* Gradient Glow Effect */}
    <div className="absolute -right-10 -top-10 w-32 h-32 bg-manu-orange/10 rounded-full blur-3xl group-hover:bg-manu-orange/20 transition-all duration-500" />

    <div className="text-manu-orange mb-6 transform group-hover:scale-110 transition-transform duration-500 relative z-10">
      <div className="p-3 bg-manu-orange/10 rounded-lg inline-block border border-manu-orange/20">
        {icon}
      </div>
    </div>
    
    <h3 className="text-2xl font-bold text-white mb-4 font-display group-hover:text-manu-orange transition-colors duration-300 relative z-10">
      {title}
    </h3>
    
    <p className="text-gray-400 leading-relaxed mb-6 flex-grow relative z-10 font-light">
      {text}
    </p>

    <div className="relative z-10 pt-4 mt-auto border-t border-gray-800 group-hover:border-manu-orange/30 transition-colors">
       <span className="text-sm font-bold text-white group-hover:text-manu-orange flex items-center gap-2 transition-all">
         En savoir plus <ArrowRight size={16} className="transform group-hover:translate-x-2 transition-transform duration-300" />
       </span>
    </div>
  </div>
);

const Services: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-manu-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <span className="text-manu-orange uppercase tracking-[0.2em] text-xs font-bold mb-4 block animate-pulse">
            Savoir-Faire Artisanal & Numérique
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
            L'Atelier <span className="text-manu-orange">Manu3D</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Spécialiste de l'impression 3D sur mesure en Normandie. Nous transformons vos fichiers numériques et vos idées les plus folles en objets d'exception.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          <ServiceCard 
            icon={<Brush size={32} />}
            title="Peinture Figurines"
            text="Service de peinture professionnel (Miniature & Grand Format). Nous donnons vie à vos héros avec des techniques avancées (Aérographie, Lavis, Brossage)."
          />
          <ServiceCard 
            icon={<Gamepad2 size={32} />}
            title="Décoration Geek"
            text="Création d'objets uniques pour votre Setup Gaming. Cartouches géantes, Enseignes lumineuses, Supports de manettes et Goodies personnalisés."
          />
          <ServiceCard 
            icon={<Swords size={32} />}
            title="Cosplay Maker"
            text="Fabrication d'accessoires (Props) pour Cosplay. Impression PLA/Résine haute fidélité, assemblage et post-traitement pour un rendu réaliste."
          />
        </div>
      </div>
    </section>
  );
};

export default Services;
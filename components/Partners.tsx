import React from 'react';
import { ExternalLink, ShieldCheck, Ticket, Calendar, Megaphone } from 'lucide-react';
import { useLiveContent } from '../LiveContent';

const SPONSORS = [
  { name: "Normandie Geek Festival", type: "Convention", date: "Partenaire 2024" },
  { name: "LH 3D Makers", type: "FabLab", date: "Soutien Technique" },
  { name: "Café du Meeple", type: "Bar à Jeux", date: "Point de retrait" },
];

const Partners: React.FC = () => {
  const { partners } = useLiveContent();

  return (
    <section id="partners" className="py-20 bg-[#0F1216] border-y border-gray-900 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION 1: DESIGNERS & LICENCES */}
        <div className="text-center mb-12">
           <div className="inline-flex items-center gap-2 text-gray-500 uppercase tracking-[0.2em] text-xs font-bold mb-3">
              <ShieldCheck size={16} className="text-manu-orange" />
              Certifications
           </div>
           <h3 className="text-2xl md:text-3xl font-display font-bold text-white">
             Licences & <span className="text-manu-orange">Guildes Officielles</span>
           </h3>
           <p className="text-gray-400 text-sm mt-2">Nous sommes revendeurs agréés pour ces créateurs de talent.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-10 items-center justify-items-center mb-20">
          {partners.map((partner, index) => (
            <a 
              key={partner.id || index} 
              href={partner.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center"
              title={`Visiter le Patreon/Thangs de ${partner.name}`}
            >
              <div className="relative w-28 h-28 md:w-32 md:h-32 flex items-center justify-center p-4 bg-[#1A1E26] border border-gray-800 rounded-2xl hover:border-manu-orange/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(243,156,18,0.15)] transform hover:-translate-y-1 group-hover:bg-[#1A1E26]/80 backdrop-blur-sm">
                <div className="absolute top-2 right-2 text-manu-orange opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100 duration-300">
                  <ExternalLink size={14} />
                </div>
                <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center p-2 bg-black/20">
                   <img 
                      src={partner.logoUrl} 
                      alt={partner.name} 
                      className="max-w-full max-h-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=' + partner.name.charAt(0); }}
                   />
                </div>
              </div>
              <div className="mt-4 text-center">
                <h4 className="text-white text-sm font-bold group-hover:text-manu-orange transition-colors duration-300">
                  {partner.name}
                </h4>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mt-1">
                  {partner.description}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* SECTION 2: SPONSORS & EVENTS */}
        <div className="relative border-t border-gray-800 pt-16">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0F1216] px-4 text-gray-500 text-xs font-mono uppercase tracking-widest">
            Réseau Local & Events
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
            <div className="text-center md:text-right md:w-1/3">
              <h3 className="text-xl font-bold text-white font-display mb-2">Sponsors & Partenaires</h3>
              <p className="text-sm text-gray-400">
                Manu3D soutient la scène Geek locale. Retrouvez notre stand lors des événements majeurs en Normandie.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:w-2/3">
              {SPONSORS.map((sponsor, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-[#151921] border border-gray-800 px-6 py-4 rounded-lg hover:border-gray-600 transition-colors group">
                  <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center text-manu-orange group-hover:scale-110 transition-transform">
                     {sponsor.type === 'Convention' ? <Ticket size={20} /> : sponsor.type === 'FabLab' ? <Megaphone size={20} /> : <Calendar size={20} />}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white text-sm">{sponsor.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">{sponsor.type} • {sponsor.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Partners;
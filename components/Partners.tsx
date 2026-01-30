import React from 'react';
import { ExternalLink, ShieldCheck, Ticket, Calendar, Megaphone, MapPin, Users, Award } from 'lucide-react';
import { useLiveContent } from '../LiveContent';

const SPONSORS = [
  { name: "Normandie Geek Festival", type: "Convention", date: "Partenaire 2024" },
  { name: "LH 3D Makers", type: "FabLab", date: "Soutien Technique" },
  { name: "Café du Meeple", type: "Bar à Jeux", date: "Point de retrait" },
];

const EVENTS = [
  { name: "Japan Expo", date: "Juillet 2024", location: "Paris", desc: "Stand Exposant - Hall 3" },
  { name: "Normannia", date: "Février 2024", location: "Rouen", desc: "Démonstration Peinture" },
  { name: "Art To Play", date: "Novembre 2024", location: "Nantes", desc: "Concours Cosplay" },
];

const Partners: React.FC = () => {
  const { partners } = useLiveContent();

  return (
    <div className="bg-[#0B0D10] min-h-screen">
      
      {/* --- PAGE 1: LICENCES & CREATEURS --- */}
      <section id="licenses" className="py-20 border-b border-gray-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-manu-orange/10 rounded-lg text-manu-orange">
                  <ShieldCheck size={24} />
              </div>
              <div>
                  <h2 className="text-3xl font-bold text-white font-display uppercase">Licences Officielles</h2>
                  <p className="text-gray-400 text-sm">Revendeur agréé (Merchant Tier)</p>
              </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-10">
            {partners.map((partner, index) => (
              <a 
                key={partner.id || index} 
                href={partner.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center"
              >
                <div className="relative w-full aspect-square flex items-center justify-center p-6 bg-[#151921] border border-gray-800 rounded-2xl hover:border-manu-orange/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(243,156,18,0.1)]">
                  <div className="absolute top-3 right-3 text-manu-orange opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={16} />
                  </div>
                  <img 
                      src={partner.logoUrl} 
                      alt={partner.name} 
                      className="w-full h-full object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=' + partner.name.charAt(0); }}
                   />
                </div>
                <div className="mt-4 text-center">
                  <h4 className="text-white text-lg font-bold group-hover:text-manu-orange transition-colors">
                    {partner.name}
                  </h4>
                  <span className="text-xs text-gray-500 uppercase tracking-widest block mt-1">
                    {partner.description}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* --- PAGE 2: SPONSORS LOCAUX --- */}
      <section id="sponsors" className="py-20 bg-[#0F1216] border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                      <Users size={24} />
                  </div>
                  <div>
                      <h2 className="text-3xl font-bold text-white font-display uppercase">Sponsors & Amis</h2>
                      <p className="text-gray-400 text-sm">L'écosystème Geek Normand</p>
                  </div>
               </div>
               <button className="hidden md:block px-6 py-2 border border-gray-700 rounded-full text-sm font-bold text-gray-400 hover:text-white hover:border-white transition-all">
                  Devenir Partenaire
               </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SPONSORS.map((sponsor, idx) => (
                <div key={idx} className="flex items-center gap-5 bg-[#1A1E26] p-6 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-colors group">
                  <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-blue-500 border border-gray-700 group-hover:scale-110 transition-transform">
                     {sponsor.type === 'Convention' ? <Ticket size={24} /> : sponsor.type === 'FabLab' ? <Megaphone size={24} /> : <Award size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{sponsor.name}</h4>
                    <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">{sponsor.type}</div>
                    <div className="text-xs text-gray-500">{sponsor.date}</div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- PAGE 3: EVENTS --- */}
      <section id="events" className="py-20 bg-gradient-to-b from-[#0B0D10] to-[#151921]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <span className="text-manu-orange uppercase tracking-[0.2em] text-xs font-bold mb-2 block">On The Road</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display">Agenda <span className="text-transparent bg-clip-text bg-gradient-to-r from-manu-orange to-red-500">Events</span></h2>
              <div className="w-20 h-1 bg-manu-orange mx-auto opacity-50"></div>
           </div>

           <div className="relative border-l-2 border-gray-800 ml-4 md:ml-0 md:pl-0 space-y-12">
              {EVENTS.map((event, idx) => (
                 <div key={idx} className="relative flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center group">
                    {/* Dot */}
                    <div className="absolute -left-[9px] md:left-1/2 md:-ml-[9px] w-4 h-4 rounded-full bg-gray-800 border-2 border-black group-hover:bg-manu-orange transition-colors z-10"></div>
                    
                    {/* Date (Left on Desktop) */}
                    <div className="pl-8 md:pl-0 md:w-1/2 md:text-right md:pr-12">
                       <span className="text-2xl font-bold text-white font-display block group-hover:text-manu-orange transition-colors">{event.name}</span>
                       <span className="text-sm text-gray-500 flex items-center gap-2 md:justify-end mt-1">
                          <Calendar size={14} /> {event.date}
                       </span>
                    </div>

                    {/* Info (Right on Desktop) */}
                    <div className="pl-8 md:pl-12 md:w-1/2">
                       <div className="bg-[#1A1E26] p-4 rounded-lg border border-gray-800 group-hover:border-manu-orange/30 transition-all">
                          <p className="text-gray-300 font-bold mb-1 flex items-center gap-2">
                             <MapPin size={16} className="text-manu-orange" /> {event.location}
                          </p>
                          <p className="text-sm text-gray-500">{event.desc}</p>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>

    </div>
  );
};

export default Partners;
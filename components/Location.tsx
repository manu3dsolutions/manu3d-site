import React from 'react';
import { MapPin, Navigation, Calendar, Clock, ArrowRight, Phone } from 'lucide-react';

const Location: React.FC = () => {
  return (
    <section className="py-24 bg-[#0F1216] relative border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-manu-orange/10 text-manu-orange border border-manu-orange/20 text-xs font-bold uppercase tracking-widest mb-4">
            <MapPin size={14} />
            Localisation
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
            Visiter <span className="text-manu-orange">L'Atelier</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
            Venez discuter de votre projet, voir les matériaux en vrai ou récupérer votre commande directement à Montivilliers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* COLONNE GAUCHE : CARTE & ITINERAIRE */}
          <div className="space-y-6">
            <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl group">
              {/* Overlay interactif pour le style */}
              <div className="absolute inset-0 bg-manu-orange/5 pointer-events-none z-10 group-hover:bg-transparent transition-colors duration-300" />
              
              {/* Google Maps Iframe */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20706.77284708764!2d0.1764676579294273!3d49.54668582736735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e028fdc3ec555b%3A0x40c14484fb65f20!2s76290%20Montivilliers!5e0!3m2!1sfr!2sfr!4v1709214485572!5m2!1sfr!2sfr" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="group-hover:filter-none transition-all duration-500"
                title="Carte Montivilliers"
              ></iframe>

              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 z-20 flex justify-between items-center">
                 <div>
                    <h4 className="text-white font-bold">Montivilliers (76290)</h4>
                    <p className="text-xs text-gray-400">Normandie, France</p>
                 </div>
                 <a 
                   href="https://www.google.com/maps/dir//Montivilliers" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-manu-orange text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-white transition-colors"
                 >
                   <Navigation size={16} />
                   Itinéraire
                 </a>
              </div>
            </div>
            
            <div className="flex gap-4 items-start p-4 bg-[#151921] rounded-xl border border-gray-800">
               <div className="p-3 bg-gray-800 rounded-full text-manu-orange">
                  <Phone size={20} />
               </div>
               <div>
                  <h4 className="text-white font-bold text-sm">Une question sur l'itinéraire ?</h4>
                  <p className="text-gray-400 text-xs mb-2">Appelez-nous pour vous guider.</p>
                  <p className="text-white font-mono font-bold">+33 6 00 00 00 00</p>
               </div>
            </div>
          </div>

          {/* COLONNE DROITE : RENDEZ-VOUS */}
          <div className="bg-[#151921] rounded-2xl border border-gray-800 p-8 flex flex-col h-full shadow-lg relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-manu-orange/5 rounded-full blur-3xl pointer-events-none" />

             <h3 className="text-2xl font-bold text-white font-display mb-2 flex items-center gap-2">
                <Calendar className="text-manu-orange" />
                Prendre Rendez-vous
             </h3>
             <p className="text-gray-400 text-sm mb-8">
               L'atelier n'est pas une boutique classique. Pour vous assurer un accueil de qualité et une étude approfondie de votre projet, nous recevons <strong>uniquement sur rendez-vous</strong>.
             </p>

             <div className="space-y-4 mb-8">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Horaires d'ouverture</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                   {[
                     { day: "Lundi", hours: "Fermé" },
                     { day: "Mardi - Vendredi", hours: "10h00 - 19h00" },
                     { day: "Samedi", hours: "14h00 - 18h00" },
                     { day: "Dimanche", hours: "Fermé" },
                   ].map((slot, idx) => (
                     <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800/50 last:border-0">
                        <span className="text-gray-300 font-medium">{slot.day}</span>
                        <span className={slot.hours.includes('Fermé') ? "text-red-400 font-bold text-xs" : "text-manu-orange font-mono"}>
                           {slot.hours}
                        </span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="mt-auto bg-black/40 p-6 rounded-xl border border-dashed border-gray-700 text-center">
                <Clock className="mx-auto text-gray-500 mb-3" size={32} />
                <h4 className="text-white font-bold mb-2">Réserver un créneau (30 min)</h4>
                <p className="text-xs text-gray-400 mb-6">
                   Consultation gratuite. Apportez vos fichiers ou vos idées.
                </p>
                <a 
                   href="#contact" // Dans une app réelle, lien vers Calendly ou modal
                   className="w-full inline-flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded-lg hover:bg-manu-orange transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(243,156,18,0.4)]"
                >
                   Réserver maintenant
                   <ArrowRight size={18} />
                </a>
                <p className="text-[10px] text-gray-600 mt-3">
                   Via notre formulaire de contact ou par téléphone.
                </p>
             </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
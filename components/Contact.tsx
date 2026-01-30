import React from 'react';
import { Mail, MapPin, Instagram, Facebook, Shield, Settings } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import { useLiveContent } from '../LiveContent';

interface ContactProps {
  onOpenLegal: (section: string) => void;
  onOpenAdmin: () => void;
}

const Contact: React.FC<ContactProps> = ({ onOpenLegal, onOpenAdmin }) => {
  const { assets } = useLiveContent();
  
  return (
    <footer id="contact" className="bg-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          <div>
            {/* Logo Image */}
            <div className="mb-8 group inline-block cursor-pointer">
               <a href="#home" className="block">
                 <img 
                   src={assets.logo} 
                   alt="Manu3D" 
                   className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                   onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.parentElement!.innerHTML = '<h2 class="text-4xl font-bold font-display tracking-wider text-manu-orange hover:text-white transition-colors glitch" data-text="MANU3D">MANU3D</h2>';
                   }}
                 />
               </a>
            </div>

            <h2 className="text-4xl font-bold font-display mb-6">
              Un projet <span className="text-manu-orange">unique</span> ?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Vous avez une idée, une figurine introuvable ou un besoin spécifique pour votre Cosplay ? 
              Manu3D réalise vos impressions sur mesure.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-manu-orange">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Localisation</h4>
                  <p className="text-gray-400">{CONTACT_INFO.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-manu-orange">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Email</h4>
                  <a href={`mailto:${CONTACT_INFO.email}`} className="text-gray-400 hover:text-manu-orange transition-colors">
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <a 
                href="#" 
                className="w-12 h-12 rounded-full bg-[#151921] border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-tr hover:from-[#fd5949] hover:to-[#d6249f] hover:border-transparent transition-all duration-300 transform hover:scale-110 shadow-lg group"
                aria-label="Instagram"
              >
                <Instagram size={22} className="transition-transform group-hover:rotate-12" />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 rounded-full bg-[#151921] border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1877F2] hover:border-transparent transition-all duration-300 transform hover:scale-110 shadow-lg group"
                aria-label="Facebook"
              >
                <Facebook size={22} className="transition-transform group-hover:-rotate-12" />
              </a>
            </div>

            {/* Bouton Dédié Documentation Légale */}
            <button 
              onClick={() => onOpenLegal('cgv')} 
              className="mt-12 flex items-center gap-3 px-5 py-3 rounded-lg border border-gray-800 bg-[#151921] text-gray-400 hover:text-white hover:border-manu-orange hover:bg-manu-orange/10 transition-all duration-300 group w-full sm:w-auto"
            >
              <Shield size={18} className="text-manu-orange group-hover:scale-110 transition-transform" />
              <div className="text-left">
                 <span className="block text-xs font-bold uppercase tracking-wider text-manu-orange">Documents Légaux</span>
                 <span className="block text-xs">CGV, RGPD & Copyright</span>
              </div>
            </button>
          </div>

          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
            <h3 className="text-2xl font-bold font-display mb-6">Contactez-nous</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nom</label>
                <input type="text" className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-manu-orange transition-colors" placeholder="Votre nom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input type="email" className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-manu-orange transition-colors" placeholder="votre@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                <textarea rows={4} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-manu-orange transition-colors" placeholder="Décrivez votre projet..." />
              </div>
              <p className="text-[10px] text-gray-400">
                En envoyant ce formulaire, vous acceptez que vos données soient utilisées pour traiter votre demande conformément à notre <button onClick={() => onOpenLegal('privacy')} className="text-manu-orange underline hover:text-white">politique de confidentialité</button>.
              </p>
              <button className="w-full bg-manu-orange text-black font-bold py-4 rounded-lg hover:bg-white transition-colors duration-300 uppercase tracking-wide">
                Envoyer ma demande
              </button>
            </form>
          </div>

        </div>
        
        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left relative">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Manu3D. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm text-gray-400 flex-wrap justify-center">
             <button onClick={() => onOpenLegal('mentions')} className="hover:text-manu-orange transition-colors">Mentions Légales</button>
             <button onClick={() => onOpenLegal('cgv')} className="hover:text-manu-orange transition-colors">CGV / CGU</button>
             <button onClick={() => onOpenLegal('privacy')} className="hover:text-manu-orange transition-colors">Données (RGPD)</button>
             <button onClick={() => onOpenLegal('ip')} className="hover:text-manu-orange transition-colors">Propriété Intellectuelle</button>
          </div>

          {/* Bouton Admin Caché en bas à droite */}
          <button 
            onClick={onOpenAdmin}
            className="absolute bottom-0 right-0 p-3 text-gray-600 hover:text-manu-orange transition-colors opacity-70 hover:opacity-100 hover:rotate-90 duration-500"
            title="Outil Admin"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
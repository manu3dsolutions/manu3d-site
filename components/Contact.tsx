import React from 'react';
import { Mail, MapPin, Instagram, Facebook, Shield, Truck, Lock, Headphones, Sparkles } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import { useLiveContent } from '../LiveContent';

interface ContactProps {
  onOpenLegal: (section: string) => void;
}

const Contact: React.FC<ContactProps> = ({ onOpenLegal }) => {
  const { assets } = useLiveContent();
  const [logoError, setLogoError] = React.useState(false);
  
  return (
    <footer id="contact" className="bg-black text-white border-t border-gray-800 relative z-10">
      
      {/* --- TRUST BAR (REASSURANCE) --- */}
      <div className="border-b border-gray-800 bg-[#0F1115]">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               
               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-300">
                     <Truck size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-white text-sm uppercase tracking-wide">Expédition Blindée</h4>
                     <p className="text-gray-400 text-xs">Emballage anti-casse garanti.</p>
                  </div>
               </div>

               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform duration-300">
                     <Lock size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-white text-sm uppercase tracking-wide">Paiement Sécurisé</h4>
                     <p className="text-gray-400 text-xs">CB, PayPal. Données chiffrées.</p>
                  </div>
               </div>

               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-manu-orange/10 flex items-center justify-center text-manu-orange group-hover:scale-110 transition-transform duration-300">
                     <Sparkles size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-white text-sm uppercase tracking-wide">Finition Artisanale</h4>
                     <p className="text-gray-400 text-xs">Pas de travail à la chaîne.</p>
                  </div>
               </div>

               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform duration-300">
                     <Headphones size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-white text-sm uppercase tracking-wide">Support Français</h4>
                     <p className="text-gray-400 text-xs">Basé en Normandie (76).</p>
                  </div>
               </div>

            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          <div>
            {/* Logo Image */}
            <div className="mb-8 group inline-block cursor-pointer">
               <a href="#home" className="block">
                 {!logoError ? (
                   <img 
                     src={assets.logo} 
                     alt="Manu3D" 
                     className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                     onError={() => setLogoError(true)}
                   />
                 ) : (
                   <h2 className="text-4xl font-bold font-display tracking-wider text-manu-orange hover:text-white transition-colors">MANU3D</h2>
                 )}
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
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-manu-orange border border-gray-800">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Localisation</h4>
                  <p className="text-gray-400">{CONTACT_INFO.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-manu-orange border border-gray-800">
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
              <a href="#" className="w-12 h-12 rounded-full bg-[#151921] border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-tr hover:from-[#fd5949] hover:to-[#d6249f] hover:border-transparent transition-all duration-300 transform hover:scale-110 shadow-lg group">
                <Instagram size={22} className="transition-transform group-hover:rotate-12" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-[#151921] border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1877F2] hover:border-transparent transition-all duration-300 transform hover:scale-110 shadow-lg group">
                <Facebook size={22} className="transition-transform group-hover:-rotate-12" />
              </a>
            </div>

            <button onClick={() => onOpenLegal('cgv')} className="mt-12 flex items-center gap-3 px-5 py-3 rounded-lg border border-gray-800 bg-[#151921] text-gray-400 hover:text-white hover:border-manu-orange hover:bg-manu-orange/10 transition-all duration-300 group w-full sm:w-auto">
              <Shield size={18} className="text-manu-orange group-hover:scale-110 transition-transform" />
              <div className="text-left">
                 <span className="block text-xs font-bold uppercase tracking-wider text-manu-orange">Documents Légaux</span>
                 <span className="block text-xs">CGV, RGPD & Copyright</span>
              </div>
            </button>
          </div>

          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-manu-orange/5 rounded-full blur-3xl"></div>
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
              <button className="w-full bg-manu-orange text-black font-bold py-4 rounded-lg hover:bg-white transition-colors duration-300 uppercase tracking-wide shadow-lg">
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
        </div>
      </div>
    </footer>
  );
};

export default Contact;
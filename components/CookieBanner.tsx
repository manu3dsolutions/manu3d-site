import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const CookieBanner: React.FC<{ onOpenPrivacy: () => void }> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('manu3d_cookie_consent');
    if (!consent) {
      // Petite temporisation pour ne pas agresser l'utilisateur dès l'arrivée
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('manu3d_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('manu3d_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 p-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="max-w-4xl mx-auto bg-[#151921] border border-manu-orange/30 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 backdrop-blur-md">
        
        <div className="flex items-start gap-4 flex-1">
          <div className="p-2 bg-manu-orange/10 rounded-full text-manu-orange flex-shrink-0">
            <Cookie size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-1">On utilise des Cookies (mais pas ceux qu'on mange)</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Nous utilisons des cookies essentiels pour le bon fonctionnement du site et des statistiques anonymes pour améliorer votre expérience. 
              En continuant, vous acceptez notre <button onClick={onOpenPrivacy} className="text-manu-orange hover:underline">Politique de Confidentialité</button>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleDecline}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-gray-600 text-gray-400 text-xs font-bold hover:bg-white/5 hover:text-white transition-colors whitespace-nowrap"
          >
            Refuser
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2 rounded-lg bg-manu-orange text-black text-xs font-bold hover:bg-white transition-colors shadow-lg whitespace-nowrap"
          >
            Accepter & Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

export default CookieBanner;
import React from 'react';
import { useLiveContent } from '../LiveContent';
import { X, Megaphone } from 'lucide-react';

const PromoBanner: React.FC = () => {
  const { promo, loading } = useLiveContent();
  const [isVisible, setIsVisible] = React.useState(true);

  // Reset visibility when promo text changes (new promo loaded)
  React.useEffect(() => {
    setIsVisible(true);
  }, [promo.text]);

  if (!isVisible || !promo.isActive) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-manu-orange to-red-600 text-white text-xs md:text-sm font-bold py-2 px-4 relative z-[60] shadow-lg animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex-1 text-center flex items-center justify-center gap-2">
           <Megaphone size={16} className="animate-bounce hidden sm:block" />
           <a href={promo.link} className="hover:underline decoration-white decoration-2 underline-offset-4">
             {loading ? "Chargement des promos..." : promo.text}
           </a>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-4 p-1 hover:bg-black/20 rounded-full transition-colors"
          aria-label="Fermer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;
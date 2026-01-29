import React, { useState } from 'react';
import { Menu, X, ShoppingBag, Hammer, Store, Home } from 'lucide-react';
import { useLiveContent } from '../LiveContent';
import { useCart } from '../contexts/CartContext';

interface NavigationProps {
  currentView: 'home' | 'atelier' | 'shop';
  setView: (view: 'home' | 'atelier' | 'shop') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, setIsCartOpen } = useCart();
  const { assets } = useLiveContent();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Styles dynamiques selon la vue active
  const getLinkStyle = (viewName: string) => {
    const isActive = currentView === viewName;
    return `relative px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 group flex items-center gap-2 rounded-lg ${
      isActive 
        ? 'text-black bg-manu-orange shadow-[0_0_15px_rgba(243,156,18,0.4)]' 
        : 'text-gray-300 hover:text-white hover:bg-white/5'
    }`;
  };

  const handleNav = (view: 'home' | 'atelier' | 'shop') => {
    setView(view);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed w-full z-50 bg-[#0F1216]/95 backdrop-blur-md border-b border-white/5 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo - Retour Accueil */}
          <div 
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer group select-none"
            onClick={() => handleNav('home')}
          >
              <img 
                src={assets.logo} 
                alt="Manu3D" 
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl font-bold font-display tracking-wider text-manu-orange hover:text-white transition-colors duration-300">MANU3D</span>';
                }}
              />
          </div>
          
          {/* Menu Desktop Central */}
          <div className="hidden md:flex items-center bg-black/30 p-1 rounded-xl border border-white/5">
             <button onClick={() => handleNav('home')} className={getLinkStyle('home')}>
                <Home size={16} /> Accueil
             </button>
             <button onClick={() => handleNav('atelier')} className={getLinkStyle('atelier')}>
                <Hammer size={16} /> L'Atelier (Sur-Mesure)
             </button>
             <button onClick={() => handleNav('shop')} className={getLinkStyle('shop')}>
                <Store size={16} /> La Boutique
             </button>
          </div>

          {/* Actions Droite */}
          <div className="flex items-center gap-4">
              {/* Panier (Toujours visible) */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2 transition-colors ${totalItems > 0 ? 'text-manu-orange' : 'text-gray-300 hover:text-white'}`}
              >
                  <ShoppingBag size={24} />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-manu-orange text-black text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg animate-in zoom-in">
                      {totalItems}
                    </span>
                  )}
              </button>

              <a href="#contact" className="hidden lg:block bg-white/5 border border-white/10 text-white hover:bg-manu-orange hover:text-black hover:border-manu-orange px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300">
                Contact
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-manu-orange hover:bg-white/5 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>
          
        </div>
      </div>

      {/* Menu Mobile Déroulant */}
      {isOpen && (
        <div className="md:hidden bg-[#0F1216] border-b border-gray-800 animate-in slide-in-from-top-5 duration-200">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <button onClick={() => handleNav('home')} className="w-full text-left text-gray-300 hover:text-manu-orange hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium">Accueil</button>
            <button onClick={() => handleNav('atelier')} className="w-full text-left text-manu-orange hover:text-white hover:bg-manu-orange/10 block px-3 py-3 rounded-md text-base font-bold border-l-2 border-manu-orange pl-4">L'Atelier 3D</button>
            <button onClick={() => handleNav('shop')} className="w-full text-left text-gray-300 hover:text-manu-orange hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium">La Boutique</button>
            <a href="#contact" onClick={() => setIsOpen(false)} className="mt-4 block w-full text-center bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700">Contact</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
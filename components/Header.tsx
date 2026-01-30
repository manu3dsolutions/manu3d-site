import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Hammer, Store, Home, Users, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { useLiveContent } from '../LiveContent';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  currentView: 'home' | 'shop' | 'atelier' | 'partners' | 'blog';
  setView: (view: 'home' | 'shop' | 'atelier' | 'partners' | 'blog') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, setIsCartOpen } = useCart();
  const { assets } = useLiveContent();
  const [scrolled, setScrolled] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Animation du panier au changement de quantité
  useEffect(() => {
    if (totalItems > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (view: 'home' | 'shop' | 'atelier' | 'partners' | 'blog') => {
    setView(view);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => handleNav(view as any)}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 group overflow-hidden ${
          isActive ? 'text-black bg-manu-orange' : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
      >
        <Icon size={16} className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="relative z-10">{label}</span>
      </button>
    );
  };

  return (
    <>
      {/* HEADER DESKTOP FLOTTANT (ISLAND) */}
      <nav className={`fixed top-4 left-0 w-full z-50 transition-all duration-500 hidden lg:flex justify-center items-start px-4`}>
        <div className={`glass-panel rounded-full px-2 py-2 flex items-center gap-2 shadow-2xl transition-all duration-500 ${scrolled ? 'mt-0 bg-[#050505]/90 border-white/5' : 'mt-2 border-white/10'}`}>
            
            {/* Logo */}
            <div 
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center cursor-pointer hover:rotate-12 transition-transform border border-white/10 ml-1"
              onClick={() => handleNav('home')}
            >
               <img src={assets.logo} className="w-6 h-6 object-contain" alt="M" />
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-white/10 mx-2"></div>

            {/* Menu Items */}
            <NavItem view="home" icon={Home} label="Accueil" />
            <NavItem view="shop" icon={Store} label="Boutique" />
            <NavItem view="atelier" icon={Hammer} label="L'Atelier" />
            <NavItem view="blog" icon={BookOpen} label="Journal" />
            <NavItem view="partners" icon={Users} label="Club" />

            {/* Separator */}
            <div className="w-px h-6 bg-white/10 mx-2"></div>

            {/* Cart & Actions */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-all duration-300 group ${animateCart ? 'bg-manu-orange/20 scale-110' : ''}`}
            >
               <ShoppingBag size={18} className={`transition-colors duration-300 ${animateCart ? 'text-manu-orange' : 'text-gray-300 group-hover:text-white'}`} />
               {totalItems > 0 && (
                 <span className={`absolute -top-1 -right-1 w-5 h-5 bg-manu-orange text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black transition-transform duration-300 ${animateCart ? 'scale-125' : 'scale-100'}`}>
                   {totalItems}
                 </span>
               )}
            </button>

            <a href="#contact" className="ml-2 px-5 py-2 rounded-full bg-white text-black text-sm font-bold uppercase hover:bg-manu-orange transition-colors flex items-center gap-2">
               <span>Contact</span>
               <ArrowRight size={14} />
            </a>

        </div>
      </nav>

      {/* HEADER MOBILE (SIMPLE & EFFICACE) */}
      <nav className="fixed top-0 left-0 w-full z-50 lg:hidden glass-panel border-b border-white/5 bg-[#050505]/95 backdrop-blur-md">
         <div className="flex justify-between items-center px-4 h-16">
            <div onClick={() => handleNav('home')} className="flex items-center gap-2">
               <img src={assets.logo} className="h-8 w-auto" alt="Logo" />
               <span className="font-display font-bold text-xl tracking-wider text-white">MANU<span className="text-manu-orange">3D</span></span>
            </div>

            <div className="flex items-center gap-4">
               <button onClick={() => setIsCartOpen(true)} className={`relative text-white transition-transform ${animateCart ? 'scale-110' : ''}`}>
                  <ShoppingBag size={24} className={animateCart ? 'text-manu-orange' : ''} />
                  {totalItems > 0 && (
                     <span className="absolute -top-2 -right-2 w-4 h-4 bg-manu-orange text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                       {totalItems}
                     </span>
                   )}
               </button>
               <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                  {isOpen ? <X size={28} /> : <Menu size={28} />}
               </button>
            </div>
         </div>

         {/* Mobile Menu Dropdown */}
         {isOpen && (
            <div className="absolute top-16 left-0 w-full bg-[#050505] border-b border-gray-800 animate-in slide-in-from-top-5">
               <div className="flex flex-col p-4 space-y-2">
                  {[
                    { id: 'home', label: 'Accueil', icon: Home },
                    { id: 'shop', label: 'Boutique', icon: Store },
                    { id: 'atelier', label: 'Atelier Sur-Mesure', icon: Hammer },
                    { id: 'blog', label: 'Le Journal', icon: BookOpen },
                    { id: 'partners', label: 'Communauté', icon: Users },
                  ].map((item) => (
                     <button 
                        key={item.id}
                        onClick={() => handleNav(item.id as any)}
                        className={`flex items-center gap-4 p-4 rounded-xl text-lg font-bold transition-all ${currentView === item.id ? 'bg-manu-orange text-black' : 'bg-white/5 text-gray-300'}`}
                     >
                        <item.icon size={20} /> {item.label}
                     </button>
                  ))}
                  <a href="#contact" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-xl bg-white text-black text-lg font-bold mt-4 justify-center">
                     Contactez-nous
                  </a>
               </div>
            </div>
         )}
      </nav>
    </>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Services from './components/Services';
import Partners from './components/Partners';
import ProductList from './components/ProductList';
import Contact from './components/Contact';
import Portfolio from './components/Portfolio';
import B2BService from './components/B2BService';
import LegalDocs from './components/LegalDocs';
import CookieBanner from './components/CookieBanner';
import Testimonials from './components/Testimonials';
import Location from './components/Location';
import AdminTool from './components/AdminTool'; 
import PromoBanner from './components/PromoBanner'; 
import CartSidebar from './components/CartSidebar';
import { LiveContentProvider, useLiveContent } from './LiveContent';
import { CartProvider } from './contexts/CartContext';
import { Database, AlertTriangle, CheckCircle, WifiOff } from 'lucide-react';

const ConnectionStatus = () => {
  const { usingLive, error, loading } = useLiveContent();
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-4 z-[90] animate-in slide-in-from-bottom duration-500 hidden md:block">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg backdrop-blur-md text-xs font-bold uppercase tracking-wide cursor-pointer hover:scale-105 transition-transform ${
        loading ? 'bg-blue-900/80 border-blue-500 text-white' :
        error ? 'bg-red-900/90 border-red-500 text-white' :
        usingLive ? 'bg-green-900/90 border-green-500 text-white' :
        'bg-gray-800/90 border-gray-600 text-gray-400'
      }`} onClick={() => setVisible(false)}>
        {loading ? <Database className="animate-bounce" size={14} /> :
         error ? <AlertTriangle size={14} /> :
         usingLive ? <CheckCircle size={14} /> :
         <WifiOff size={14} />}
        <span>{loading ? 'Connexion...' : error ? 'Erreur BDD' : usingLive ? 'Système Online' : 'Mode Local'}</span>
      </div>
    </div>
  );
};

function AppContent() {
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalSection, setLegalSection] = useState('mentions');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // State principal de navigation
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'atelier'>('home');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openLegal = (section: string) => {
    setLegalSection(section);
    setIsLegalOpen(true);
  };

  return (
    <div className="min-h-screen bg-manu-black text-white font-sans selection:bg-manu-orange selection:text-black pt-0">
      <PromoBanner />
      
      <Navigation currentView={currentView} setView={setCurrentView} />
      
      <CartSidebar />
      
      <main className="min-h-screen">
        {/* VIEW: HOME (Landing Split) */}
        {currentView === 'home' && (
          <Hero setView={setCurrentView} />
        )}

        {/* VIEW: ATELIER (Services) */}
        {currentView === 'atelier' && (
          <div className="animate-in fade-in duration-500 pt-20">
             {/* Header Section Atelier */}
             <div className="bg-[#0F1216] border-b border-gray-800 py-12 px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 uppercase">
                   L'Atelier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Sur-Mesure</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                   Configurateur en ligne, impression technique et services professionnels.
                </p>
             </div>
             
             {/* On remonte le calculateur B2B pour la conversion immédiate */}
             <B2BService />
             <Services />
             <Portfolio />
             <Testimonials />
             <Location />
          </div>
        )}

        {/* VIEW: SHOP (E-commerce) */}
        {currentView === 'shop' && (
          <div className="animate-in fade-in duration-500 pt-20">
              {/* Header Section Boutique */}
              <div className="bg-[#0F1216] border-b border-gray-800 py-12 px-4 text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-manu-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 uppercase relative z-10">
                   Le Loot <span className="text-manu-orange">Shop</span>
                 </h1>
                 <p className="text-gray-400 max-w-2xl mx-auto relative z-10">
                   Figurines peintes à la main, décorations rares et goodies. Stock limité.
                 </p>
              </div>

              <ProductList />
              <Partners />
          </div>
        )}
      </main>
      
      <Contact onOpenLegal={openLegal} onOpenAdmin={() => setIsAdminOpen(true)} />
      
      <LegalDocs 
        isOpen={isLegalOpen} 
        onClose={() => setIsLegalOpen(false)} 
        initialSection={legalSection} 
      />
      <CookieBanner onOpenPrivacy={() => openLegal('privacy')} />
      <AdminTool isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      <ConnectionStatus />
    </div>
  );
}

function App() {
  return (
    <LiveContentProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </LiveContentProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Partners from './components/Partners';
import ProductList from './components/ProductList';
import Contact from './components/Contact';
import Portfolio from './components/Portfolio';
import AtelierRequest from './components/AtelierRequest'; // Nouveau composant
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
  
  // NAVIGATION SIMPLIFIÉE : 'custom' supprimé
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'atelier' | 'partners'>('home');

  useEffect(() => {
    // Log de version pour débogage Vercel
    console.log("MANU3D BUILD: V2.1 (Atelier Request Form - No Configurator)");

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
      
      <Header currentView={currentView} setView={setCurrentView} />
      
      <CartSidebar />
      
      <main className="min-h-screen">
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <Hero setView={setCurrentView} />
        )}

        {/* VIEW: ATELIER (Complet : Showcase + Formulaire de demande) */}
        {currentView === 'atelier' && (
          <div className="animate-in fade-in duration-500 pt-20">
             <div className="bg-[#0F1216] border-b border-gray-800 py-16 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 uppercase relative z-10">
                   L'Atelier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Créatif</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto relative z-10 text-lg">
                   Donnons vie à vos idées. Impression 3D Sur-Mesure, Peinture & Prototypage.
                </p>
             </div>
             
             {/* Le formulaire de demande est maintenant prioritaire en haut de l'Atelier */}
             <AtelierRequest />

             <Services />
             <Portfolio />
             <Testimonials />
             <Location />
          </div>
        )}

        {/* VIEW: SHOP */}
        {currentView === 'shop' && (
          <div className="animate-in fade-in duration-500 pt-20">
              <ProductList />
          </div>
        )}

        {/* VIEW: PARTNERS */}
        {currentView === 'partners' && (
          <div className="animate-in fade-in duration-500 pt-20">
              <div className="bg-[#0F1216] border-b border-gray-800 py-12 px-4 text-center">
                 <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 uppercase">
                   La <span className="text-manu-orange">Communauté</span>
                 </h1>
                 <p className="text-gray-400 max-w-2xl mx-auto">
                   Nos partenaires officiels, nos sponsors locaux et l'agenda des conventions.
                 </p>
              </div>
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
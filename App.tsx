import React, { useState, useEffect } from 'react';
import Header from './components/Header';
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
  
  // NOUVELLE NAVIGATION : Ajout de 'custom' pour le configurateur
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'atelier' | 'custom' | 'partners'>('home');

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
      
      <Header currentView={currentView} setView={setCurrentView} />
      
      <CartSidebar />
      
      <main className="min-h-screen">
        {/* VIEW: HOME (Landing Split) */}
        {currentView === 'home' && (
          <Hero setView={setCurrentView} />
        )}

        {/* VIEW: ATELIER (Showcase / Visuel / Services) */}
        {/* On retire le configurateur d'ici pour alléger la page */}
        {currentView === 'atelier' && (
          <div className="animate-in fade-in duration-500 pt-20">
             <div className="bg-[#0F1216] border-b border-gray-800 py-16 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 uppercase relative z-10">
                   L'Atelier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Créatif</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto relative z-10 text-lg">
                   Découvrez notre savoir-faire, nos réalisations d'exception et notre localisation.
                </p>
             </div>
             
             <Services />
             <Portfolio />
             <Testimonials />
             <Location />
          </div>
        )}

        {/* VIEW: CUSTOM (Configurateur Technique Seul) */}
        {/* Page dédiée à l'outil pour éviter les distractions */}
        {currentView === 'custom' && (
          <div className="animate-in fade-in duration-500 pt-20 min-h-screen bg-[#0B0D10]">
             <div className="bg-[#0B0D10] border-b border-gray-800 py-12 px-4 text-center">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 uppercase">
                   Impression <span className="text-manu-orange">Sur-Mesure</span>
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                   Configurateur technique instantané. Importez vos fichiers STL, choisissez vos matériaux et obtenez votre devis en temps réel.
                </p>
             </div>
             <B2BService />
             {/* Petit rappel de rassurance en bas du configurateur */}
             <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center opacity-70">
                 <div className="p-4 border border-gray-800 rounded-lg">
                    <h4 className="text-white font-bold mb-1">Qualité Pro</h4>
                    <p className="text-xs text-gray-500">Imprimantes 8K & 12K</p>
                 </div>
                 <div className="p-4 border border-gray-800 rounded-lg">
                    <h4 className="text-white font-bold mb-1">Suivi Humain</h4>
                    <p className="text-xs text-gray-500">Vérification manuelle des fichiers</p>
                 </div>
                 <div className="p-4 border border-gray-800 rounded-lg">
                    <h4 className="text-white font-bold mb-1">Expédition Rapide</h4>
                    <p className="text-xs text-gray-500">Emballage sécurisé anti-casse</p>
                 </div>
             </div>
          </div>
        )}

        {/* VIEW: SHOP (E-commerce) */}
        {currentView === 'shop' && (
          <div className="animate-in fade-in duration-500 pt-20">
              <ProductList />
          </div>
        )}

        {/* VIEW: PARTNERS (Community) */}
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
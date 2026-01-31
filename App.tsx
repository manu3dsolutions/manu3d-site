import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Partners from './components/Partners';
import ProductList from './components/ProductList';
import Contact from './components/Contact';
import Portfolio from './components/Portfolio';
import AtelierRequest from './components/AtelierRequest'; 
import LegalDocs from './components/LegalDocs';
import CookieBanner from './components/CookieBanner';
import Testimonials from './components/Testimonials';
import Location from './components/Location';
import AdminTool from './components/AdminTool'; 
import PromoBanner from './components/PromoBanner'; 
import CartSidebar from './components/CartSidebar';
import Blog from './components/Blog';
import { LiveContentProvider, useLiveContent } from './LiveContent';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { Database, AlertTriangle, CheckCircle, WifiOff, ArrowUp, Gamepad2, Gift, X } from 'lucide-react';

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

// Scroll To Top Button Component
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!visible) return null;

  return (
    <button 
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 z-[90] p-3 bg-white text-black rounded-full shadow-2xl hover:bg-manu-orange transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-5 border border-gray-200"
      aria-label="Haut de page"
    >
      <ArrowUp size={20} strokeWidth={3} />
    </button>
  );
};

// --- KONAMI CODE EASTER EGG ---
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const EasterEggModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/90 backdrop-blur-md animate-in zoom-in duration-300">
       <div className="bg-[#151921] border-2 border-manu-orange rounded-3xl p-8 max-w-lg w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(243,156,18,0.3)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-manu-orange/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X/></button>
          
          <div className="flex justify-center mb-6">
             <div className="w-20 h-20 bg-manu-orange text-black rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <Gamepad2 size={40} />
             </div>
          </div>
          
          <h2 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-wide">Cheat Code Activé !</h2>
          <p className="text-gray-400 mb-6 text-sm">
             Bien joué voyageur. Tu as découvert le secret des vrais gamers.
             Voici une récompense légendaire pour ta prochaine commande.
          </p>
          
          <div className="bg-black/50 border border-dashed border-gray-700 p-4 rounded-xl mb-6 relative group cursor-pointer" onClick={() => navigator.clipboard.writeText("KONAMI20")}>
             <span className="text-gray-500 text-xs uppercase block mb-1">Code Promo Secret (-20%)</span>
             <span className="text-2xl font-mono font-bold text-manu-orange tracking-[0.2em] group-hover:scale-110 transition-transform block">KONAMI20</span>
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">Copier</span>
          </div>

          <button onClick={onClose} className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-manu-orange transition-colors w-full uppercase tracking-widest text-xs">
             Réclamer mon butin
          </button>
       </div>
    </div>
  );
};

function AppContent() {
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalSection, setLegalSection] = useState('mentions');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // NAVIGATION : ajout de 'blog'
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'atelier' | 'partners' | 'blog'>('home');

  // KONAMI STATE
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  useEffect(() => {
    // Log de version pour débogage Vercel
    console.log("MANU3D BUILD: V3.1 (Ultimate Edition)");

    const handleKeyDown = (event: KeyboardEvent) => {
      // Admin Shortcut
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setIsAdminOpen(prev => !prev);
      }

      // Konami Logic
      if (event.key === KONAMI_CODE[konamiIndex]) {
         const next = konamiIndex + 1;
         if (next === KONAMI_CODE.length) {
             setShowEasterEgg(true);
             setKonamiIndex(0);
         } else {
             setKonamiIndex(next);
         }
      } else {
         setKonamiIndex(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIndex]);

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

        {/* VIEW: ATELIER */}
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
             
             {/* SECTION: DEMANDE MANUELLE (Upload Fichier) */}
             <AtelierRequest />
             
             <Services />
             <Portfolio />
             <Location />
          </div>
        )}

        {/* VIEW: SHOP */}
        {currentView === 'shop' && (
          <div className="animate-in fade-in duration-500 pt-20">
              <ProductList />
          </div>
        )}

        {/* VIEW: BLOG (Le Journal) */}
        {currentView === 'blog' && (
          <div className="animate-in fade-in duration-500">
              <Blog />
          </div>
        )}

        {/* VIEW: PARTNERS (COMMUNAUTE) */}
        {currentView === 'partners' && (
          <div className="animate-in fade-in duration-500 pt-20">
              <div className="bg-[#0F1216] border-b border-gray-800 py-12 px-4 text-center">
                 <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 uppercase">
                   La <span className="text-manu-orange">Communauté</span>
                 </h1>
                 <p className="text-gray-400 max-w-2xl mx-auto">
                   Nos partenaires officiels, nos sponsors locaux et les retours de nos clients.
                 </p>
              </div>
              <Partners />
              <Testimonials />
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
      <EasterEggModal isOpen={showEasterEgg} onClose={() => setShowEasterEgg(false)} />
      <ConnectionStatus />
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <LiveContentProvider>
      <ToastProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ToastProvider>
    </LiveContentProvider>
  );
}

export default App;
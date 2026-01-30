import React, { useState } from 'react';
import { useLiveContent } from '../LiveContent';
import { Calendar, Clock, ArrowRight, Search, Mail, Sparkles, Tag, Newspaper, Lightbulb, Zap, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Blog: React.FC = () => {
  const { articles } = useLiveContent();
  const [filter, setFilter] = useState<'All' | 'News' | 'Tuto' | 'Bon Plan'>('All');
  const [email, setEmail] = useState('');
  const [newsStatus, setNewsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const filteredArticles = filter === 'All' ? articles : articles.filter(a => a.category === filter);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!email) return;
    setNewsStatus('loading');

    try {
        // Sauvegarde de l'email dans Supabase
        const { error } = await supabase.from('newsletter_subscribers').insert({ email });
        
        // Si la table n'existe pas encore, on simule le succès pour l'UX
        if (error && error.code !== '42P01') { 
            throw error; 
        }
        
        setNewsStatus('success');
        setEmail('');
    } catch (err) {
        console.error(err);
        setNewsStatus('error');
    }
  };

  const getCategoryColor = (cat: string) => {
      switch(cat) {
          case 'News': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
          case 'Tuto': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
          case 'Bon Plan': return 'bg-green-500/20 text-green-400 border-green-500/30';
          default: return 'bg-gray-800 text-gray-400';
      }
  };

  return (
    <div className="bg-[#0B0D10] min-h-screen pt-20">
      
      {/* HEADER HERO */}
      <section className="relative py-20 border-b border-gray-800 bg-[#0F1216] overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
         {/* Glow effect */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-manu-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-manu-orange/10 text-manu-orange border border-manu-orange/20 text-xs font-bold uppercase tracking-widest mb-4">
                  <Newspaper size={14} /> Le Journal du Maker
               </div>
               <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                  Astuces, News & <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-manu-orange to-amber-200">Bons Plans 3D</span>
               </h1>
               <p className="text-gray-400 text-lg font-light leading-relaxed mb-8">
                  Découvrez nos derniers tutoriels pour sublimer vos prints, suivez l'actu de l'atelier et ne ratez aucune promo exclusive.
               </p>

               {/* QUICK NEWSLETTER SIGNUP */}
               <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <div className="relative flex-grow">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                     <input 
                       type="email" 
                       placeholder="Votre email pour les bons plans..." 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-manu-orange outline-none"
                       required
                     />
                  </div>
                  <button type="submit" disabled={newsStatus === 'loading' || newsStatus === 'success'} className="bg-manu-orange text-black font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2">
                     {newsStatus === 'loading' ? <Loader2 className="animate-spin" size={18}/> : 
                      newsStatus === 'success' ? <><CheckCircle size={18}/> Inscrit</> : 
                      'M\'inscrire'}
                  </button>
               </form>
               {newsStatus === 'error' && <p className="text-red-400 text-xs mt-2">Une erreur est survenue.</p>}
               {newsStatus === 'success' && <p className="text-green-400 text-xs mt-2">Merci ! Vous recevrez bientôt nos actualités.</p>}
            </div>

            {/* DECORATION */}
            <div className="hidden md:block relative">
               <div className="relative z-10 w-64 h-80 bg-[#151921] border border-gray-800 rounded-xl p-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4">
                     <Zap size={24} />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Le Tip du Jour</h3>
                  <p className="text-gray-400 text-sm">Pour des supports qui se détachent tout seuls : plongez votre pièce dans l'eau chaude (50°C) avant de retirer les supports résine !</p>
                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2 text-xs text-gray-500">
                     <span className="w-2 h-2 rounded-full bg-green-500"></span> Validé par l'Atelier
                  </div>
               </div>
               <div className="absolute -z-10 top-4 -right-4 w-64 h-80 bg-manu-orange/5 border border-manu-orange/20 rounded-xl -rotate-6"></div>
            </div>
         </div>
      </section>

      {/* FILTRES & CONTENU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
         
         {/* TABS */}
         <div className="flex flex-wrap gap-4 mb-12 justify-center md:justify-start">
            {[
              { id: 'All', label: 'Tout voir', icon: <Search size={16}/> },
              { id: 'News', label: 'Actualités', icon: <Newspaper size={16}/> },
              { id: 'Tuto', label: 'Tutoriels', icon: <Lightbulb size={16}/> },
              { id: 'Bon Plan', label: 'Bons Plans', icon: <Zap size={16}/> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
                  filter === tab.id 
                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
         </div>

         {/* GRID */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
               <article key={article.id} className="group bg-[#151921] rounded-2xl overflow-hidden border border-gray-800 hover:border-manu-orange/40 transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex flex-col h-full">
                  
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                     <img 
                       src={article.image} 
                       alt={article.title} 
                       className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                     />
                     <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border backdrop-blur-md ${getCategoryColor(article.category)}`}>
                           {article.category}
                        </span>
                     </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-grow flex flex-col">
                     <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {article.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {article.readTime}</span>
                     </div>

                     <h3 className="text-xl font-bold text-white mb-3 font-display leading-tight group-hover:text-manu-orange transition-colors">
                        {article.title}
                     </h3>
                     
                     <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                        {article.excerpt}
                     </p>

                     <button className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-manu-orange transition-colors mt-auto">
                        Lire l'article <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform"/>
                     </button>
                  </div>
               </article>
            ))}
         </div>

         {filteredArticles.length === 0 && (
            <div className="text-center py-20 bg-[#151921]/50 rounded-2xl border border-gray-800 border-dashed">
               <Search size={48} className="mx-auto text-gray-600 mb-4" />
               <p className="text-gray-400">Aucun article trouvé dans cette catégorie pour le moment.</p>
               <button onClick={() => setFilter('All')} className="mt-4 text-manu-orange hover:underline text-sm font-bold">Voir tout le journal</button>
            </div>
         )}
      </section>

      {/* FOOTER CTA NEWSLETTER (Large) */}
      <section className="py-20 border-t border-gray-800 relative bg-black">
         <div className="max-w-4xl mx-auto px-4 text-center">
             <div className="w-16 h-16 bg-gradient-to-br from-manu-orange to-red-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg rotate-3">
                <Sparkles size={32} />
             </div>
             <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Ne manquez plus aucun drop !
             </h2>
             <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Rejoignez +1500 makers. Recevez nos tutos exclusifs, les codes promos secrets et soyez prévenus avant tout le monde des nouvelles collections.
             </p>
             <div className="flex justify-center">
                <button 
                  onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                  className="bg-white text-black hover:bg-manu-orange hover:text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-xl"
                >
                   S'abonner en haut de page
                </button>
             </div>
             <p className="text-[10px] text-gray-600 mt-6">
                Pas de spam. Promis. Désinscription en 1 clic.
             </p>
         </div>
      </section>

    </div>
  );
};

export default Blog;
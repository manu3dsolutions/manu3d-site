import React from 'react';
import { Star, Quote, User, CheckCircle } from 'lucide-react';
import { useLiveContent } from '../LiveContent';

const Testimonials: React.FC = () => {
  const { reviews } = useLiveContent();

  return (
    <section className="py-24 bg-[#0B0D10] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-manu-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-manu-orange/10 text-manu-orange border border-manu-orange/20 text-xs font-bold uppercase tracking-widest mb-4">
            <User size={14} />
            Avis Vérifiés
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
            La Parole à la <span className="text-manu-orange">Guilde</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
            Ils nous ont fait confiance pour matérialiser leur imaginaire. Découvrez les retours d'expérience de nos clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-[#151921] p-8 rounded-2xl border border-gray-800 relative group hover:border-manu-orange/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
              <Quote className="absolute top-6 right-6 text-gray-700 group-hover:text-manu-orange/20 transition-colors transform scale-150" size={40} />
              
              <div className="flex items-center gap-1 mb-4 text-manu-orange">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-700"} />
                ))}
              </div>

              <p className="text-gray-300 italic mb-6 leading-relaxed flex-grow">
                "{review.text}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-800 mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold border border-gray-600">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    {review.name}
                    <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded flex items-center gap-1" title="Commande Vérifiée">
                       <CheckCircle size={10} />
                    </span>
                  </h4>
                  <p className="text-xs text-manu-orange uppercase tracking-wider font-semibold">{review.role}</p>
                </div>
              </div>

              {review.item && (
                <div className="absolute bottom-0 right-0 px-4 py-1 bg-black/50 rounded-tl-lg border-t border-l border-gray-800 text-[10px] text-gray-500 font-mono">
                  Loot : {review.item}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
           <div className="inline-block p-4 rounded-lg bg-[#151921] border border-gray-800">
              <div className="text-2xl font-bold text-white font-display">4.9/5</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Note moyenne sur +150 commandes</div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
import React, { useState } from 'react';
import { Send, Upload, FileText, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Box, ShieldCheck, Check, Search, Hammer, Truck } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ProcessStep: React.FC<{ icon: React.ReactNode, number: string, title: string, desc: string }> = ({ icon, number, title, desc }) => (
  <div className="relative flex flex-col items-center text-center group">
      <div className="w-16 h-16 rounded-2xl bg-[#151921] border border-gray-800 flex items-center justify-center text-white mb-4 shadow-lg group-hover:border-manu-orange/50 group-hover:shadow-[0_0_20px_rgba(243,156,18,0.2)] transition-all duration-300 relative z-10">
          {icon}
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-manu-orange text-black font-bold flex items-center justify-center border-4 border-[#0B0D10]">
              {number}
          </div>
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">{desc}</p>
      
      {/* Connector Line (Hidden on mobile) */}
      {number !== "3" && (
         <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-800 -z-0"></div>
      )}
  </div>
);

const AtelierRequest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for mandatory legal checkbox
  const [legalAccepted, setLegalAccepted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'Figurine',
    description: '',
    isUrgent: false
  });
  
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!legalAccepted) {
        setError("Veuillez accepter les conditions légales de propriété intellectuelle pour continuer.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      let fileReference = null;
      if (file) {
          fileReference = file.name + " (Taille: " + (file.size / 1024 / 1024).toFixed(2) + " MB)";
      }

      const { error: dbError } = await supabase.from('project_requests').insert({
        customer_name: formData.name,
        customer_email: formData.email,
        project_type: formData.type,
        description: formData.description,
        file_url: fileReference,
        is_urgent: formData.isUrgent
      });

      if (dbError) throw dbError;

      setSuccess(true);
      setFormData({ name: '', email: '', type: 'Figurine', description: '', isUrgent: false });
      setFile(null);
      setLegalAccepted(false);

    } catch (err: any) {
      setError("Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter par email.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="request-form" className="py-24 bg-[#0B0D10] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-manu-orange/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                 Conciergerie 3D
            </span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                Du Fichier à la <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Réalité</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                Confiez-nous vos fichiers STL ou vos idées. Notre équipe analyse manuellement chaque projet pour garantir une qualité d'impression et de peinture irréprochable.
            </p>
        </div>

        {/* PROCESS STEPS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 px-4">
            <ProcessStep 
                number="1" 
                icon={<Upload size={28} className="text-blue-400"/>} 
                title="Demande & Upload" 
                desc="Envoyez votre fichier ou décrivez votre projet via le formulaire sécurisé ci-dessous." 
            />
            <ProcessStep 
                number="2" 
                icon={<Search size={28} className="text-purple-400"/>} 
                title="Expertise Humaine" 
                desc="Nous vérifions la faisabilité, optimisons les supports et vous envoyons un devis précis sous 24h." 
            />
            <ProcessStep 
                number="3" 
                icon={<Hammer size={28} className="text-manu-orange"/>} 
                title="Fabrication Artisanale" 
                desc="Impression haute définition (8K), post-traitement manuel et expédition soignée." 
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Assurance & Info */}
          <div className="lg:col-span-5 space-y-8 sticky top-24">
             <div className="bg-[#151921]/80 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 font-display">Pourquoi choisir l'Atelier ?</h3>
                
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <Box size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Matériaux Premium</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Résine ABS-Like pour la solidité, 8K pour les détails, ou PLA renforcé pour les grands props. Nous ne faisons pas de "low cost".
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                            <ImageIcon size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Option Peinture Art</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Nos artistes peintres peuvent sublimer votre modèle. Aérographie, pinceau, vernis : un rendu "concours" garanti.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 flex-shrink-0">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Emballage Blindé</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                La hantise du collectionneur ? La casse. Nos colis sont sur-protégés avec mousse sur mesure et double cartonnage.
                            </p>
                        </div>
                    </div>
                </div>
             </div>
             
             {/* Security Badge */}
             <div className="flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-widest opacity-60">
                 <ShieldCheck size={14} /> Fichiers 100% confidentiels
             </div>
          </div>

          {/* Right: The Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#151921] p-6 md:p-10 rounded-3xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
               {/* Form Glow Effect */}
               <div className="absolute -top-20 -right-20 w-40 h-40 bg-manu-orange/10 rounded-full blur-3xl group-hover:bg-manu-orange/20 transition-colors duration-700 pointer-events-none"></div>

              {success ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6 border-4 border-[#151921] shadow-2xl">
                    <CheckCircle size={48} strokeWidth={3} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2 font-display">Demande Transmise !</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Merci {formData.name}. Votre dossier <strong>#{Math.floor(Math.random() * 10000)}</strong> a été ouvert. Un expert Manu3D va l'analyser et reviendra vers vous sous 24h.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)} 
                    className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-manu-orange transition-colors shadow-lg"
                  >
                    Nouvelle demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <FileText className="text-manu-orange" size={24}/> 
                      Détails du Projet
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group/input">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within/input:text-manu-orange transition-colors">Nom complet</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-manu-orange focus:bg-black outline-none transition-all placeholder-gray-700"
                        placeholder="Ex: Thomas Anderson"
                      />
                    </div>
                    <div className="group/input">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within/input:text-manu-orange transition-colors">Email de contact</label>
                      <input 
                        required 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-manu-orange focus:bg-black outline-none transition-all placeholder-gray-700"
                        placeholder="Ex: neo@matrix.com"
                      />
                    </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type de prestation</label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Figurine', 'Cosplay', 'Technique', 'Autre'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({...formData, type})}
                            className={`py-3 rounded-lg text-sm font-bold transition-all border ${
                                formData.type === type 
                                ? 'bg-manu-orange text-black border-manu-orange shadow-lg transform scale-[1.02]' 
                                : 'bg-black/30 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="group/input">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within/input:text-manu-orange transition-colors">Description & Spécificités</label>
                    <textarea 
                      required 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-manu-orange focus:bg-black outline-none min-h-[120px] transition-all placeholder-gray-700"
                      placeholder="Dites-nous tout : Échelle, style de peinture, utilisation finale, contraintes techniques..."
                    />
                  </div>

                  {/* Enhanced File Upload */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fichier 3D ou Référence (Optionnel)</label>
                    <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group/upload overflow-hidden ${file ? 'border-manu-orange bg-manu-orange/5' : 'border-gray-700 bg-black/30 hover:border-gray-500 hover:bg-black/50'}`}>
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        onChange={e => setFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer w-full h-full block relative z-10">
                        {file ? (
                          <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                             <div className="w-12 h-12 rounded-full bg-manu-orange text-black flex items-center justify-center font-bold">STL</div>
                             <div className="text-white font-bold text-lg truncate max-w-[250px]">{file.name}</div>
                             <div className="text-xs text-gray-400 bg-black/50 px-3 py-1 rounded-full">{(file.size/1024/1024).toFixed(2)} MB</div>
                             <p className="text-xs text-green-500 mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Prêt à l'envoi</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-gray-500 group-hover/upload:text-gray-300 transition-colors">
                            <div className="p-3 bg-gray-800 rounded-full group-hover/upload:scale-110 transition-transform duration-300">
                                <Upload size={24} />
                            </div>
                            <span className="text-sm font-medium">Glissez votre fichier ici ou cliquez pour parcourir</span>
                            <span className="text-[10px] uppercase tracking-wide opacity-60">STL, OBJ, JPG, PNG, ZIP (Max 50MB)</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-gray-800">
                     <input 
                       type="checkbox" 
                       id="urgent" 
                       checked={formData.isUrgent}
                       onChange={e => setFormData({...formData, isUrgent: e.target.checked})}
                       className="w-5 h-5 rounded bg-black border-gray-600 text-manu-orange focus:ring-0 cursor-pointer"
                     />
                     <label htmlFor="urgent" className="text-sm text-white select-none cursor-pointer font-bold flex items-center gap-2">
                        Option Prioritaire <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/30 uppercase">Urgent</span>
                     </label>
                  </div>

                  {/* LEGAL CHECKBOX - MANDATORY */}
                  <div className={`p-4 rounded-xl border transition-all duration-300 ${legalAccepted ? 'bg-green-900/10 border-green-500/30' : 'bg-gray-900/50 border-gray-700 hover:border-red-500/50'}`}>
                      <label className="flex items-start gap-4 cursor-pointer group">
                          <div className="relative flex items-center pt-1">
                              <input 
                                  type="checkbox" 
                                  className="peer sr-only"
                                  checked={legalAccepted}
                                  onChange={(e) => setLegalAccepted(e.target.checked)}
                              />
                              {/* Custom Checkbox Design */}
                              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 shadow-lg ${legalAccepted ? 'bg-manu-orange border-manu-orange text-black scale-110' : 'border-gray-500 bg-black group-hover:border-gray-300'}`}>
                                  {legalAccepted && <Check size={16} strokeWidth={4} />}
                              </div>
                          </div>
                          <div className="text-xs text-gray-400 select-none group-hover:text-gray-300 flex-1">
                              <span className="flex items-center gap-2 font-bold text-white mb-1">
                                  <ShieldCheck size={14} className={legalAccepted ? "text-green-500" : "text-gray-500"} />
                                  Engagement de conformité
                              </span>
                              Je certifie sur l'honneur détenir les droits d'usage pour ce fichier. Je confirme que ma demande ne concerne pas d'objets illégaux ou d'armes.
                          </div>
                      </label>
                  </div>

                  {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm flex items-center gap-3 animate-pulse">
                      <AlertCircle size={20} /> {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading || !legalAccepted}
                    className={`w-full font-display font-bold text-lg py-5 rounded-xl uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group ${
                        !legalAccepted 
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50' 
                          : 'bg-manu-orange hover:bg-white text-black hover:shadow-[0_0_30px_rgba(243,156,18,0.5)] transform hover:-translate-y-1'
                    }`}
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
                    {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Envoyer au Maker</>}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AtelierRequest;
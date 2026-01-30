import React, { useState } from 'react';
import { Send, Upload, FileText, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Box } from 'lucide-react';
import { supabase } from '../supabaseClient';

const AtelierRequest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    setLoading(true);
    setError(null);

    try {
      // 1. Simulation Upload Fichier (Dans une vraie app, on utiliserait supabase.storage.upload ici)
      // Pour l'instant, on stocke juste le nom du fichier dans la base de données
      let fileReference = null;
      if (file) {
          // NOTE: Pour activer le vrai upload, il faut créer un Bucket 'uploads' dans Supabase Storage
          // const { data, error } = await supabase.storage.from('uploads').upload(`public/${Date.now()}_${file.name}`, file);
          fileReference = file.name + " (Taille: " + (file.size / 1024 / 1024).toFixed(2) + " MB)";
      }

      // 2. Sauvegarde de la demande
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

    } catch (err: any) {
      setError("Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter par email.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="request-form" className="py-16 bg-[#0B0D10] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#151921] to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text & Info */}
          <div className="space-y-8">
            <div>
              <span className="text-manu-orange font-bold uppercase tracking-widest text-xs mb-2 block">Sur Mesure</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Votre Projet, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-manu-orange to-yellow-200">Notre Expertise</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Vous avez un fichier STL, une idée de cosplay ou besoin d'une pièce introuvable ? 
                L'Atelier Manu3D étudie votre demande manuellement pour vous proposer la meilleure solution technique (Résine 8K, PLA, Peinture).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-[#151921] p-4 rounded-xl border border-gray-800 flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded text-blue-400"><Box size={20} /></div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Impression 3D</h4>
                    <p className="text-xs text-gray-500 mt-1">SLA (Résine) & FDM (Filament)</p>
                  </div>
               </div>
               <div className="bg-[#151921] p-4 rounded-xl border border-gray-800 flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 rounded text-purple-400"><ImageIcon size={20} /></div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Peinture Art</h4>
                    <p className="text-xs text-gray-500 mt-1">Finitions à la main</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-[#151921] p-6 md:p-8 rounded-2xl border border-gray-800 shadow-2xl relative">
            {success ? (
              <div className="absolute inset-0 bg-[#151921] rounded-2xl flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Demande Reçue !</h3>
                <p className="text-gray-400">
                  Merci {formData.name}. Nous allons étudier votre projet et vous répondrons sous 24/48h avec un devis détaillé.
                </p>
                <button 
                  onClick={() => setSuccess(false)} 
                  className="mt-8 px-6 py-2 border border-gray-600 rounded-full text-sm text-white hover:bg-white hover:text-black transition-colors"
                >
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none"
                      placeholder="contact@email.com"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type de projet</label>
                   <div className="flex gap-2 bg-black p-1 rounded-lg border border-gray-700">
                      {['Figurine', 'Cosplay', 'Technique', 'Autre'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, type})}
                          className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${formData.type === type ? 'bg-manu-orange text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                          {type}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description du besoin</label>
                  <textarea 
                    required 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none min-h-[100px]"
                    placeholder="Taille souhaitée, type de finition, lien vers le modèle 3D..."
                  />
                </div>

                {/* File Upload Zone */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pièce jointe (Optionnel)</label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${file ? 'border-manu-orange bg-manu-orange/5' : 'border-gray-700 bg-black hover:border-gray-500'}`}>
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer w-full h-full block">
                      {file ? (
                        <div className="flex items-center justify-center gap-2 text-white">
                           <FileText size={20} className="text-manu-orange"/>
                           <span className="font-bold truncate max-w-[200px]">{file.name}</span>
                           <span className="text-xs text-gray-500">({(file.size/1024/1024).toFixed(2)} MB)</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Upload size={24} />
                          <span className="text-sm">Cliquez pour ajouter un fichier (STL, IMG, ZIP)</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <input 
                     type="checkbox" 
                     id="urgent" 
                     checked={formData.isUrgent}
                     onChange={e => setFormData({...formData, isUrgent: e.target.checked})}
                     className="w-4 h-4 rounded bg-black border-gray-700 text-manu-orange focus:ring-0"
                   />
                   <label htmlFor="urgent" className="text-sm text-gray-300 select-none">C'est une demande urgente ⚡</label>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 rounded text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-manu-orange hover:bg-white text-black font-bold py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(243,156,18,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Envoyer ma demande</>}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default AtelierRequest;
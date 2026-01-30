import React, { useState } from 'react';
import { X, Shield, FileText, Lock, Copyright, AlertTriangle, Gavel, Scale } from 'lucide-react';

interface LegalDocsProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

const LegalDocs: React.FC<LegalDocsProps> = ({ isOpen, onClose, initialSection = 'mentions' }) => {
  const [activeTab, setActiveTab] = useState(initialSection);

  if (!isOpen) return null;

  const tabs = [
    { id: 'mentions', label: 'Mentions Légales', icon: <Shield size={16} /> },
    { id: 'cgv', label: 'CGV / CGU', icon: <FileText size={16} /> },
    { id: 'privacy', label: 'Confidentialité (RGPD)', icon: <Lock size={16} /> },
    { id: 'ip', label: 'Propriété Intellectuelle', icon: <Copyright size={16} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'mentions':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">1. Identité de l'entreprise</h3>
            <p><strong>Nom commercial :</strong> Manu3D</p>
            <p><strong>Statut Juridique :</strong> Micro-entreprise (Auto-entrepreneur)</p>
            <p><strong>Siège social :</strong> Montivilliers (76290), France</p>
            <p><strong>Email :</strong> contact@manu3d.fr</p>
            <p><strong>Directeur de la publication :</strong> Manu3D</p>
            
            <h3 className="text-xl font-bold text-white mt-8 mb-4">2. Hébergement</h3>
            <p>Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133 Walnut, CA 91789, USA.</p>
            
            <h3 className="text-xl font-bold text-white mt-8 mb-4">3. Médiation de la consommation</h3>
            <p>Conformément aux articles L.616-1 et R.616-1 du code de la consommation, nous proposons un dispositif de médiation de la consommation. En cas de litige, vous pouvez déposer votre réclamation sur le site : <a href="https://www.cnpm-mediation-consommation.eu" target="_blank" rel="noopener noreferrer" className="text-manu-orange underline">CNPM - MEDIATION DE LA CONSOMMATION</a>.</p>
          </div>
        );
      case 'cgv':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Conditions Générales de Vente (CGV)</h3>
            
            <h4 className="text-lg font-bold text-manu-orange">Article 1 : Objet</h4>
            <p>Les présentes CGV régissent les relations contractuelles entre Manu3D et son client, les deux parties les acceptant sans réserve.</p>

            <h4 className="text-lg font-bold text-manu-orange">Article 2 : Produits & Rétractation</h4>
            <ul className="list-disc pl-5 text-gray-400">
                <li><strong>Produits personnalisés (Sur-Mesure) :</strong> Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux produits confectionnés selon les spécifications du consommateur (ex: impression d'un fichier STL fourni, peinture spécifique).</li>
                <li><strong>Produits en stock (Standard) :</strong> Pour les produits non personnalisés, vous disposez d'un délai de 14 jours pour exercer votre droit de rétractation à compter de la réception. Les frais de retour sont à la charge du client.</li>
            </ul>

            <h4 className="text-lg font-bold text-manu-orange">Article 3 : Tarifs et Paiement</h4>
            <p>Le paiement est exigible immédiatement à la commande. Le règlement s'effectue par Carte Bancaire ou PayPal via une plateforme sécurisée.</p>

            <h4 className="text-lg font-bold text-manu-orange">Article 4 : Livraison</h4>
            <p>Les produits sont livrés à l'adresse indiquée. Manu3D ne saurait être tenu responsable des retards de livraison dus aux transporteurs.</p>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Politique de Confidentialité (RGPD)</h3>
            <p>Manu3D s'engage à protéger la vie privée de ses utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD).</p>

            <h4 className="text-lg font-bold text-manu-orange">1. Données collectées</h4>
            <p>Nom, Email, Adresse, Téléphone, Fichiers 3D (pour les commandes sur-mesure). Conservation : 5 ans (obligation légale facturation).</p>

            <h4 className="text-lg font-bold text-manu-orange">2. Démarchage téléphonique (Bloctel)</h4>
            <p>Nous collectons votre numéro de téléphone uniquement pour le suivi de livraison. Nous ne faisons aucun démarchage téléphonique. Vous avez la possibilité de vous inscrire gratuitement sur la liste d'opposition au démarchage téléphonique <strong>Bloctel</strong> (www.bloctel.gouv.fr).</p>

            <h4 className="text-lg font-bold text-manu-orange">3. Vos Droits</h4>
            <p>Droit d'accès, rectification, suppression : contact@manu3d.fr.</p>
          </div>
        );
      case 'ip':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Propriété Intellectuelle & Sécurité</h3>
            
            <div className="bg-orange-900/10 border border-orange-500/30 p-4 rounded-lg">
                <p className="text-manu-orange font-bold mb-2 flex items-center gap-2"><Gavel size={18} /> Clause de Non-Responsabilité</p>
                <p>Manu3D agit en qualité de prestataire technique. Nous ne vendons pas les fichiers numériques (STL) fournis par le client, mais un service de transformation.</p>
            </div>

            <div className="mt-6 border border-red-500/30 bg-red-500/5 p-4 rounded-lg">
               <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2"><AlertTriangle size={18} /> Objets Interdits</h4>
               <p className="text-sm text-gray-300">Nous refusons strictement l'impression d'armes réelles, de pièces détachées d'armes à feu, ou de tout objet illégal.</p>
            </div>

            <h4 className="text-lg font-bold text-manu-orange mt-6">Garantie du Client</h4>
            <p>Le client certifie détenir les droits d'usage des fichiers transmis pour impression.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 backdrop-blur-sm bg-black/80">
      <div className="bg-[#151921] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0F1216]">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Scale size={24} className="text-manu-orange" /> Informations Légales
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          <div className="w-full md:w-64 bg-[#0F1216] border-b md:border-b-0 md:border-r border-gray-800 p-2 overflow-y-auto">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-manu-orange text-black font-bold shadow-md' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {tab.icon} <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[#151921]">
             <div className="prose prose-invert prose-orange max-w-none text-sm md:text-base leading-relaxed text-gray-300">
               {renderContent()}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDocs;
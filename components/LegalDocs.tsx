import React, { useState } from 'react';
import { X, Shield, FileText, Lock, Copyright, AlertTriangle, Gavel } from 'lucide-react';

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
    { id: 'ip', label: 'Propriété Intellectuelle & Sécurité', icon: <Copyright size={16} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'mentions':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">1. Identité de l'entreprise</h3>
            <p><strong>Nom commercial :</strong> Manu3D</p>
            <p><strong>Statut Juridique :</strong> Micro-entreprise (Auto-entrepreneur)</p>
            <p><strong>Siège social :</strong> Montivilliers (76), France</p>
            <p><strong>Email :</strong> contact@manu3d.fr</p>
            <p><strong>Directeur de la publication :</strong> Manu3D</p>
            
            <h3 className="text-xl font-bold text-white mt-8 mb-4">2. Hébergement</h3>
            <p>Le site est hébergé par Google Sites / Vercel (selon déploiement), dont les serveurs sont situés en Union Européenne ou aux États-Unis (avec certification Privacy Shield).</p>
          </div>
        );
      case 'cgv':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Conditions Générales de Vente (CGV)</h3>
            
            <h4 className="text-lg font-bold text-manu-orange">Article 1 : Objet</h4>
            <p>Les présentes CGV régissent les relations contractuelles entre Manu3D et son client, les deux parties les acceptant sans réserve. Elles prévalent sur tout autre document.</p>

            <h4 className="text-lg font-bold text-manu-orange">Article 2 : Produits & Services sur mesure</h4>
            <p>Manu3D propose des services d'impression 3D à la demande et de peinture de figurines. S'agissant de produits confectionnés selon les spécifications du consommateur ou nettement personnalisés, <strong>le droit de rétractation ne s'applique pas</strong>, conformément à l'article L221-28 du Code de la consommation.</p>

            <h4 className="text-lg font-bold text-manu-orange">Article 3 : Tarifs et Paiement</h4>
            <p>Les prix figurant sur les devis sont valables 30 jours. Le paiement est exigible à la commande. Aucun escompte ne sera accordé en cas de paiement anticipé.</p>

            <h4 className="text-lg font-bold text-manu-orange">Article 4 : Livraison</h4>
            <p>Les délais de livraison sont donnés à titre indicatif. Manu3D ne pourra être tenu responsable des conséquences dues à un retard d'acheminement n'étant pas de son fait.</p>

            <h4 className="text-lg font-bold text-manu-orange">Article 5 : Responsabilité et Force Majeure</h4>
            <p>La responsabilité de Manu3D ne saurait être engagée en cas de non-exécution du contrat due à un cas de force majeure. En cas de défaut de conformité avéré, la responsabilité de Manu3D est strictement limitée au montant de la commande.</p>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Politique de Confidentialité (RGPD)</h3>
            <p>Manu3D s'engage à protéger la vie privée de ses utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD).</p>

            <h4 className="text-lg font-bold text-manu-orange">1. Données collectées</h4>
            <p>Nous collectons uniquement les données nécessaires au traitement de votre commande et à la communication (Nom, Email, Adresse de livraison, Fichiers 3D). Ces données sont conservées pour une durée légale de 5 ans (facturation).</p>

            <h4 className="text-lg font-bold text-manu-orange">2. Utilisation des données</h4>
            <p>Vos données ne sont jamais vendues à des tiers. Elles servent exclusivement à :</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li>Gérer et expédier vos commandes.</li>
                <li>Établir les factures et devis.</li>
                <li>Vous contacter concernant l'avancement de votre projet.</li>
            </ul>

            <h4 className="text-lg font-bold text-manu-orange">3. Vos Droits</h4>
            <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer, contactez : contact@manu3d.fr.</p>
          </div>
        );
      case 'ip':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Propriété Intellectuelle & Sécurité</h3>
            
            <div className="bg-orange-900/10 border border-orange-500/30 p-4 rounded-lg">
                <p className="text-manu-orange font-bold mb-2 flex items-center gap-2">
                  <Gavel size={18} />
                  Clause de Non-Responsabilité
                </p>
                <p>Manu3D agit en qualité de prestataire technique de service d'impression. Nous ne vendons pas les fichiers numériques (STL) fournis par le client, nous vendons un service de transformation de matière et de peinture.</p>
            </div>

            <div className="mt-6 border border-red-500/30 bg-red-500/5 p-4 rounded-lg">
               <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                 <AlertTriangle size={18} />
                 Politique de Sécurité : Objets Interdits
               </h4>
               <p className="text-sm text-gray-300 mb-2">
                 Pour des raisons légales et éthiques, Manu3D refuse systématiquement l'impression de :
               </p>
               <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-400">
                  <li><strong>Armes à feu fonctionnelles</strong> ou pièces détachées essentielles (receivers, chargeurs, etc.).</li>
                  <li><strong>Armes blanches dangereuses</strong> (couteaux dissimulés, poings américains...). Seules les répliques émoussées pour Cosplay sont acceptées.</li>
                  <li>Symboles incitant à la haine raciale, religieuse ou discriminatoire.</li>
                  <li>Dispositifs de skimming ou de piratage physique.</li>
               </ul>
            </div>

            <h4 className="text-lg font-bold text-manu-orange mt-6">1. Garantie du Client (Copyright)</h4>
            <p>En transmettant un fichier numérique à Manu3D pour impression, le Client garantit expressément :</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>Être le créateur original du fichier, OU</li>
                <li>Posséder une licence valide (commerciale ou personnelle selon l'usage) autorisant la reproduction de l'œuvre, OU</li>
                <li>Que l'œuvre est tombée dans le domaine public.</li>
            </ul>

            <h4 className="text-lg font-bold text-manu-orange mt-4">2. Indemnisation</h4>
            <p>Le Client s'engage à défendre, indemniser et dégager de toute responsabilité Manu3D contre toute réclamation, action en justice ou demande de dommages-intérêts émanant d'un tiers invoquant une violation de droits de propriété intellectuelle liée à l'exécution de la commande.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 backdrop-blur-sm bg-black/60">
      <div className="bg-[#151921] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0F1216]">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Scale size={24} className="text-manu-orange" />
            Informations Légales & Sécurité
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Layout */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-[#0F1216] border-b md:border-b-0 md:border-r border-gray-800 p-2 overflow-y-auto">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-manu-orange text-black font-bold shadow-md' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-8 px-4 text-xs text-gray-600">
               Document mis à jour le {new Date().toLocaleDateString('fr-FR')}.
            </div>
          </div>

          {/* Content Area */}
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

// Simple Icon component helper if Scale is needed inside this file specifically
const Scale: React.FC<{size?: number, className?: string}> = ({size, className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
);

export default LegalDocs;
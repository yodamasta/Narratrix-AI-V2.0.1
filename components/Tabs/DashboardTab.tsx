

import React from 'react';
import { BibleData } from '../../types';
import { SectionTitle, Paragraph, createDefaultMessage } from './TabContentUtils';
import Card from '../UI/Card';
import Button from '../UI/Button'; // Using Button for shortcuts for now, could be Cards
import { toolCardsConfig, LabTool } from './LaboratoireIATab/toolConfig'; // To get tool details

interface DashboardTabProps {
  bibleData: BibleData | null;
  bibleTitle?: string; // From commonProps, might not be needed if bibleData is always present
  onTabChange: (tabId: string) => void;
  onSetActiveToolId: (toolId: string | null) => void;
  isGeminiKeyAvailable: boolean;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ 
    bibleData, 
    onTabChange, 
    onSetActiveToolId,
    isGeminiKeyAvailable
}) => {
  if (!bibleData) {
    return (
      <div className="p-4">
        {createDefaultMessage("Veuillez charger une Bible pour afficher le Tableau de Bord.")}
      </div>
    );
  }

  const { projectInfo, pitchSection, personnagesSection, environnementsSection, chronologieSection, universSection } = bibleData;

  const stats = {
    personnages: (personnagesSection?.heros ? 1 : 0) + (personnagesSection?.personnagesPrincipaux?.length || 0),
    lieux: (environnementsSection?.laVille ? 1 : 0) + (environnementsSection?.lieux?.length || 0),
    evenements: chronologieSection?.evenements?.length || 0,
    conceptsUniques: universSection?.elementsUniques?.length || 0,
  };

  const featuredAITools: LabTool[] = toolCardsConfig.filter(tool => 
    ['visualGenerator', 'conceptDeveloper', 'etSiBrainstormer'].includes(tool.id) && tool.status !== 'construction'
  ).slice(0, 3);

  const handleToolShortcutClick = (toolId: string) => {
    onTabChange('laboratoire_ia');
    onSetActiveToolId(toolId);
  };

  return (
    <div className="p-4">
      <SectionTitle title="Tableau de Bord" icon="space_dashboard" />
      <Paragraph content={`Bienvenue dans votre univers, ${projectInfo.author || 'Créateur/Créatrice'} ! Voici un aperçu rapide de "${projectInfo.title}". Utilisez les raccourcis pour plonger directement dans la création assistée par IA.`} />

      <div id="dashboard-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Aperçu du Projet */}
        <Card title="Aperçu du Projet" icon="info" additionalClasses="md:col-span-2 bg-teal-50 border-teal-200">
          <h4 className="text-xl font-semibold text-teal-700">{projectInfo.title}</h4>
          {/* Removed redundant display of projectInfo.subtitle here */}
          {projectInfo.subtitle && <Paragraph content={`<strong>Tagline:</strong> ${projectInfo.subtitle}`} className="text-sm text-teal-600" />}
        </Card>

        {/* Statistiques Clés */}
        <Card title="Statistiques Clés" icon="monitoring">
          <ul className="space-y-2 text-sm">
            <li><strong>Personnages:</strong> {stats.personnages}</li>
            <li><strong>Lieux:</strong> {stats.lieux}</li>
            <li><strong>Événements (Chronologie):</strong> {stats.evenements}</li>
            <li><strong>Concepts Uniques:</strong> {stats.conceptsUniques}</li>
          </ul>
        </Card>

        {/* Raccourcis Outils IA */}
        {isGeminiKeyAvailable && featuredAITools.length > 0 && (
          <Card title="Raccourcis IA" icon="auto_awesome">
            <div className="space-y-3">
              {featuredAITools.map(tool => (
                <Button
                  key={tool.id}
                  onClick={() => handleToolShortcutClick(tool.id)}
                  variant="light"
                  icon={tool.icon}
                  className="w-full justify-start text-left hover:bg-teal-100"
                >
                  {tool.title}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
      
       {!isGeminiKeyAvailable && (
         <Card title="Accès aux Outils IA" icon="vpn_key_off" additionalClasses="mt-6 md:col-span-2 bg-amber-50 border-amber-300">
           <Paragraph content="Une clé API Gemini est nécessaire pour utiliser les outils d'assistance IA. Veuillez configurer votre clé pour débloquer ces fonctionnalités." className="text-sm text-amber-700"/>
         </Card>
       )}
    </div>
  );
};

export default DashboardTab;

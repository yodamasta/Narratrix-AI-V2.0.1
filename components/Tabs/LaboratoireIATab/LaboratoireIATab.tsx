import React, { useState, useMemo, useCallback } from 'react';
import { LaboratoireIASection as LaboratoireIASectionType, BibleData } from '../../../types';
import { SectionTitle, Paragraph, renderSectionShell } from '../TabContentUtils';
import { getCharacterOptions } from './common';
import ToolCard from './ToolCard';
import { toolCardsConfig, LabTool } from './toolConfig'; 
import CharacterArcDeveloper from './CharacterArcDeveloper';
import StoryboardGenerator from './StoryboardGenerator';
import VisualGenerator from './VisualGenerator';
import DialogueGenerator from './DialogueGenerator';
import EtSiBrainstormer from './EtSiBrainstormer';
import ConceptDeveloper from './ConceptDeveloper';
import NameConceptGenerator from './NameConceptGenerator';
import ScriptAnalyzer from './ScriptAnalyzer'; 
import EmotionSparkTool from './HumorSparkTool'; 
import CharacterRelationshipWeaver from './CharacterRelationshipWeaver';
import MoodBoardGenerator from './MoodBoardGenerator'; // Added MoodBoardGenerator

interface LaboratoireIATabProps {
  data?: LaboratoireIASectionType;
  bibleData: BibleData | null;
  bibleTitle?: string;
  onSetStatusMessageGlobal: (message: string, isError?: boolean) => void;
  activeToolId: string | null; 
  onSetActiveToolId: (toolId: string | null) => void; 
}

const LaboratoireIATab: React.FC<LaboratoireIATabProps> = ({ 
    data, 
    bibleData, 
    bibleTitle, 
    onSetStatusMessageGlobal,
    activeToolId,
    onSetActiveToolId
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState('');

  const characterOptions = useMemo(() => {
    return getCharacterOptions(bibleData?.personnagesSection);
  }, [bibleData?.personnagesSection]);

  const openImageLightbox = (url: string) => {
    setLightboxImageUrl(url);
    setIsLightboxOpen(true);
  };
  
  const closeImageLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxImageUrl('');
  };

  const handleToolCardClick = (toolId: string) => {
    onSetActiveToolId(toolId);
  };

  const handleBackToTools = () => {
    onSetActiveToolId(null);
  };

  const activeTool: LabTool | undefined = useMemo(() => {
    if (!activeToolId) return undefined;
    return toolCardsConfig.find(tool => tool.id === activeToolId);
  }, [activeToolId]);

  const renderToolContent = () => {
    if (!activeTool || !bibleData) {
      return <Paragraph content="Veuillez sélectionner un outil ou charger une Bible." />;
    }
  
    const toolProps = {
      bibleData: bibleData,
      characterOptions: characterOptions, 
      onSetStatusMessage: onSetStatusMessageGlobal,
      onOpenImageLightbox: openImageLightbox, 
      onBack: handleBackToTools,
    };
  
    const ToolComponent = activeTool.component;
    return <ToolComponent {...toolProps} />;
  };


  return renderSectionShell(
    "laboratoire_ia",
    data,
    data?.titre || "Laboratoire IA",
    "science",
    bibleTitle,
    "Configuration du Laboratoire IA non disponible.",
    <>
      {!activeToolId ? (
        <>
          <Paragraph content={data?.introduction || "Explorez une suite d'outils créatifs assistés par IA pour enrichir votre univers. Nécessite une clé API Gemini."} />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {toolCardsConfig.map((tool) => (
              <ToolCard
                key={tool.id}
                id={tool.id}
                title={tool.title}
                icon={tool.icon}
                description={tool.description}
                gradientClasses={tool.gradientClasses}
                isNew={tool.isNew}
                status={tool.status}
                onClick={handleToolCardClick}
              />
            ))}
          </div>
        </>
      ) : (
        renderToolContent()
      )}

      {isLightboxOpen && lightboxImageUrl && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 dark:bg-black/90 flex items-center justify-center p-4 z-[60] transition-opacity duration-300 ease-in-out"
            onClick={closeImageLightbox}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lightbox-title"
            >
            <div
                className="bg-white dark:bg-slate-800 p-2 sm:p-4 rounded-lg shadow-xl max-w-[90vw] max-h-[90vh] relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id="lightbox-title" className="sr-only">Image en grand</h3>
                <img 
                    src={lightboxImageUrl} 
                    alt="Visualisation générée en grand format" 
                    className="block max-w-full max-h-[calc(90vh-3rem)] object-contain"
                />
                <button
                    onClick={closeImageLightbox}
                    className="absolute top-0 right-0 mt-1 mr-1 sm:mt-2 sm:mr-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-bold text-xs sm:text-sm p-1 rounded-full leading-none w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center"
                    title="Fermer la vue agrandie"
                    aria-label="Fermer la vue agrandie"
                >
                    &times;
                </button>
            </div>
        </div>
      )}
       <style>{`
        .material-icons-outlined {
            font-size: inherit; 
        }
      `}</style>
    </>
  );
};

export default LaboratoireIATab;
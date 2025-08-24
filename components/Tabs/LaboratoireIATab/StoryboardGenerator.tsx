import React, { useState } from 'react';
import { BibleData, StoryboardShot, StoryboardData as StoryboardDataType } from '../../../types';
import { CharacterOption, AIToolSection, buildCharacterContextForPrompt, AIOutputDisplay } from './common';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { generateStoryboardShots, generateImage, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';
import { copyTextToClipboard } from '../../../services/bibleUtils';

interface StoryboardGeneratorProps {
  bibleData: BibleData | null;
  characterOptions: CharacterOption[];
  onOpenImageLightbox: (url: string) => void;
  onSetStatusMessage: (message: string, isError?: boolean) => void;
  onBack?: () => void; 
}

const StoryboardGenerator: React.FC<StoryboardGeneratorProps> = ({ bibleData, characterOptions, onOpenImageLightbox, onSetStatusMessage, onBack }) => {
  const [sceneDescription, setSceneDescription] = useState('');
  const [char1, setChar1] = useState('');
  const [char2, setChar2] = useState('');
  const [storyboardData, setStoryboardData] = useState<StoryboardDataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('');
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const handleGenerateStoryboard = async () => {
    if (!bibleData) {
      onSetStatusMessage("Chargez une Bible pour utiliser cet outil.", true);
      return;
    }
    if (!isApiKeyAvail) {
        onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
        return;
    }
    if (!sceneDescription.trim()) {
      onSetStatusMessage("Veuillez décrire la scène.", true);
      return;
    }

    setIsLoading(true);
    setStoryboardData(null);
    setCurrentLoadingMessage("Génération des descriptions des plans...");
    onSetStatusMessage("Génération du storyboard en cours...", false);

    const charContext = buildCharacterContextForPrompt(char1, char2, bibleData.personnagesSection);

    try {
      const shots = await generateStoryboardShots(
        sceneDescription, 
        charContext, 
        bibleData.pitchSection?.pitchGlobal || '', 
        bibleData.pitchSection?.ambianceSpecifique || ''
      );
      
      const initialShotsData: StoryboardDataType = {
        sceneDescription,
        char1Name: char1,
        char2Name: char2,
        shotsDetails: shots.slice(0,6).map(s => ({...s, imageLoading: true})) 
      };
      setStoryboardData(initialShotsData);
      onSetStatusMessage("Descriptions des plans générées. Génération des images...", false);

      
      const updatedShotsDetails = await Promise.all(
        initialShotsData.shotsDetails.map(async (shot, index) => {
          setCurrentLoadingMessage(`Génération image plan ${index + 1}/${initialShotsData.shotsDetails.length}...`);
          let imagePrompt = `Style visuel: ${bibleData.pitchSection?.ambianceSpecifique || 'cinematic, detailed'}. Format image: 16:9. Plan de storyboard: ${shot.type_plan || ''}. Action/Dialogue: "${shot.action_dialogue || ''}". Description visuelle et ambiance: "${shot.elements_visuels_ambiance || ''}".`;
          
          const charsInShotDetails: string[] = [];
          [char1, char2].forEach(charName => {
              if(charName){
                  const charOpt = characterOptions.find(opt => opt.value === charName);
                  if(charOpt && (shot.type_plan.includes(charName) || shot.action_dialogue.includes(charName) || shot.elements_visuels_ambiance.includes(charName))){
                      charsInShotDetails.push(`${charName}: ${charOpt.promptDescription || 'apparence selon la bible'}`);
                  }
              }
          });
          if(charsInShotDetails.length > 0) imagePrompt += ` Personnages présents: ${charsInShotDetails.join('; ')}.`;
          
          shot.imagePromptForImagen = imagePrompt;

          try {
            const imageUrl = await generateImage(imagePrompt);
            return { ...shot, imageUrl, imageLoading: false };
          } catch (imgError: any) {
            console.error(`Erreur image plan ${index + 1}:`, imgError);
            return { ...shot, imageError: `Erreur API: ${imgError.message?.substring(0,50) || ' inconnue'}`, imageLoading: false };
          }
        })
      );
      setStoryboardData(prev => prev ? ({ ...prev, shotsDetails: updatedShotsDetails }) : null);
      onSetStatusMessage("Storyboard généré avec images !", false);

    } catch (error: any) {
      console.error("Erreur génération storyboard:", error);
      onSetStatusMessage(`Erreur storyboard: ${error.message}`, true);
    } finally {
      setIsLoading(false);
      setCurrentLoadingMessage('');
    }
  };
  
  const regenerateShotImage = async (shotIndex: number) => {
      if (!storyboardData || !storyboardData.shotsDetails[shotIndex] || !bibleData || !isApiKeyAvail) return;
      
      const shotToUpdate = storyboardData.shotsDetails[shotIndex];
      if (!shotToUpdate.imagePromptForImagen) {
          onSetStatusMessage(`Prompt manquant pour le plan ${shotIndex + 1}. Impossible de régénérer.`, true);
          return;
      }

      setStoryboardData(prev => {
          if (!prev) return null;
          const newShots = [...prev.shotsDetails];
          newShots[shotIndex] = { ...newShots[shotIndex], imageLoading: true, imageError: undefined, imageUrl: undefined };
          return { ...prev, shotsDetails: newShots };
      });
      setCurrentLoadingMessage(`Régénération image plan ${shotIndex + 1}...`);

      try {
          const imageUrl = await generateImage(shotToUpdate.imagePromptForImagen);
          setStoryboardData(prev => {
              if (!prev) return null;
              const newShots = [...prev.shotsDetails];
              newShots[shotIndex] = { ...newShots[shotIndex], imageUrl, imageLoading: false };
              return { ...prev, shotsDetails: newShots };
          });
          onSetStatusMessage(`Image du plan ${shotIndex+1} régénérée.`, false);
      } catch (imgError: any) {
           setStoryboardData(prev => {
              if (!prev) return null;
              const newShots = [...prev.shotsDetails];
              newShots[shotIndex] = { ...newShots[shotIndex], imageError: `Erreur API: ${imgError.message?.substring(0,50) || ' inconnue'}`, imageLoading: false };
              return { ...prev, shotsDetails: newShots };
          });
          onSetStatusMessage(`Erreur régénération image plan ${shotIndex+1}.`, true);
      } finally {
          setCurrentLoadingMessage('');
      }
  };

  const getShotTextForCopy = (shot: StoryboardShot): string => {
    return `Plan: ${shot.type_plan}\nAction/Dialogue: ${shot.action_dialogue}\nVisuel/Ambiance: ${shot.elements_visuels_ambiance}${shot.imagePromptForImagen ? `\nPrompt Image: ${shot.imagePromptForImagen}` : ''}`;
  };

  const inputTextAreaClasses = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 min-h-[80px] mb-3 disabled:opacity-60 dark:disabled:bg-slate-700/50";
  const selectClasses = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 disabled:opacity-60 dark:disabled:bg-slate-700/50";


  return (
    <AIToolSection title="Générateur de Storyboard (6 Plans) 🎬" onBack={onBack}>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Décrivez une scène, l'IA la décompose en 6 plans et peut générer des images.</p>
      <textarea
        value={sceneDescription}
        onChange={(e) => setSceneDescription(e.target.value)}
        placeholder="Décrivez la scène en détail..."
        className={inputTextAreaClasses}
        disabled={isLoading || !isApiKeyAvail}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <select value={char1} onChange={(e) => setChar1(e.target.value)} className={selectClasses} disabled={isLoading || !isApiKeyAvail}>
          {characterOptions.map(opt => <option key={`sbc1-${opt.value}`} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={char2} onChange={(e) => setChar2(e.target.value)} className={selectClasses} disabled={isLoading || !isApiKeyAvail}>
          {characterOptions.map(opt => <option key={`sbc2-${opt.value}`} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <Button onClick={handleGenerateStoryboard} isLoading={isLoading} disabled={isLoading || !bibleData || !isApiKeyAvail} icon="movie_filter" variant="primary" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400">
        Générer Storyboard
      </Button>
      {!isApiKeyAvail && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{API_KEY_ERROR_MESSAGE}</p>}

      {isLoading && currentLoadingMessage && <Loader message={currentLoadingMessage} size="sm" />}
      
      {storyboardData && storyboardData.shotsDetails.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {storyboardData.shotsDetails.map((shot, index) => (
            <div key={index} className="bg-slate-50 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-lg p-4 shadow relative">
              <div className="absolute top-2 right-2 flex gap-1 z-10">
                 <button 
                    title="Copier les détails du plan"
                    onClick={() => {
                        copyTextToClipboard(getShotTextForCopy(shot))
                        .then(() => onSetStatusMessage(`Détails du plan ${index+1} copiés.`, false))
                        .catch(() => onSetStatusMessage(`Erreur copie détails plan ${index+1}.`, true));
                    }}
                    className="bg-purple-400 dark:bg-purple-600 hover:bg-purple-500 dark:hover:bg-purple-500 text-white p-1 rounded-full text-xs"
                >
                   <span className="material-icons-outlined text-sm leading-none">content_copy</span>
                </button>
              </div>
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 text-sm mb-1">Plan {index + 1}: {shot.type_plan}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-0.5"><strong>Action/Dialogue:</strong> {shot.action_dialogue}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2"><strong>Visuel/Ambiance:</strong> {shot.elements_visuels_ambiance}</p>
              
              <div className="storyboard-image-container aspect-video bg-slate-200 dark:bg-slate-600 rounded flex items-center justify-center">
                {shot.imageLoading && <Loader message="Chargement image..." size="sm" />}
                {shot.imageError && <p className="text-xs text-red-500 dark:text-red-400 p-2 text-center">{shot.imageError}</p>}
                {shot.imageUrl && <img src={shot.imageUrl} alt={`Visualisation du plan ${index + 1}`} onClick={() => onOpenImageLightbox(shot.imageUrl!)} className="w-full h-full object-cover rounded cursor-pointer" />}
                {!shot.imageLoading && !shot.imageUrl && !shot.imageError && <span className="text-xs italic text-slate-400 dark:text-slate-500">Image non générée</span>}
              </div>
               <div className="mt-2 flex gap-2 justify-center">
                  <Button size="sm" variant="light" icon="refresh" onClick={() => regenerateShotImage(index)} disabled={shot.imageLoading || !isApiKeyAvail}>Régénérer</Button>
                  {shot.imageUrl && 
                    <a href={shot.imageUrl} download={`storyboard_plan_${index + 1}.png`} className="inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-1 px-2 rounded-md text-xs transition dark:bg-emerald-600 dark:hover:bg-emerald-700">
                       <span className="material-icons-outlined text-sm mr-1">download</span>Télécharger
                    </a>
                  }
              </div>
            </div>
          ))}
        </div>
      )}
    </AIToolSection>
  );
};

export default StoryboardGenerator;
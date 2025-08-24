import React, { useState } from 'react';
import { BibleData } from '../../../types';
import { CharacterOption, AIToolSection, AIPromptDisplay, AIOutputDisplay, buildCharacterContextForPrompt } from './common';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { generateImage, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';
import { copyTextToClipboard } from '../../../services/bibleUtils';


interface VisualGeneratorProps {
  bibleData: BibleData | null;
  characterOptions: CharacterOption[];
  onOpenImageLightbox: (url: string) => void;
  onSetStatusMessage: (message: string, isError?: boolean) => void;
  onBack?: () => void; 
}

const VisualGenerator: React.FC<VisualGeneratorProps> = ({ bibleData, characterOptions, onOpenImageLightbox, onSetStatusMessage, onBack }) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [char1, setChar1] = useState('');
  const [char2, setChar2] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [finalPromptUsed, setFinalPromptUsed] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null); // New state for local error
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const handleGenerateImage = async () => {
    if (!bibleData) {
      onSetStatusMessage("Chargez une Bible pour utiliser cet outil.", true);
      return;
    }
    if (!isApiKeyAvail) {
        onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
        setGenerationError(API_KEY_ERROR_MESSAGE);
        return;
    }
    if (!userPrompt.trim() && !char1 && !char2) {
      onSetStatusMessage("Entrez une description ou choisissez au moins un personnage.", true);
      setGenerationError("Entrez une description ou choisissez au moins un personnage.");
      return;
    }

    setIsLoading(true);
    setGeneratedImageUrl(null);
    setFinalPromptUsed(null);
    setGenerationError(null); // Clear previous errors
    onSetStatusMessage("Génération de l'image en cours...", false);
    
    const charContext = buildCharacterContextForPrompt(char1, char2, bibleData.personnagesSection);
    const finalPrompt = `Style visuel général: ${bibleData.pitchSection?.ambianceSpecifique || 'cinematic, detailed, high quality'}. Format image: 16:9. ${charContext} Scène ou sujet: ${userPrompt}`;
    setFinalPromptUsed(finalPrompt);

    try {
      const imageUrl = await generateImage(finalPrompt);
      setGeneratedImageUrl(imageUrl);
      onSetStatusMessage("Image générée avec succès !", false);
    } catch (error: any) {
      console.error("Erreur génération image:", error);
      const errMsg = error.message || "Une erreur inconnue est survenue lors de la génération de l'image.";
      onSetStatusMessage(`Erreur image: ${errMsg}`, true);
      setGenerationError(errMsg); // Set local error
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputClasses = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 disabled:opacity-60 dark:disabled:bg-slate-700/50";
  const selectClasses = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 disabled:opacity-60 dark:disabled:bg-slate-700/50";

  return (
    <AIToolSection title="Générateur Visuel 🖼️" onBack={onBack}>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Décrivez une image. Sélectionnez des personnages (optionnel) pour influencer leur apparence.</p>
      <input
        type="text"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="Décrivez l'image ici..."
        className={`${inputClasses} mb-3`}
        disabled={isLoading || !isApiKeyAvail}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <select value={char1} onChange={(e) => setChar1(e.target.value)} className={selectClasses} disabled={isLoading || !isApiKeyAvail}>
          {characterOptions.map(opt => <option key={`vg_c1-${opt.value}`} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={char2} onChange={(e) => setChar2(e.target.value)} className={selectClasses} disabled={isLoading || !isApiKeyAvail}>
          {characterOptions.map(opt => <option key={`vg_c2-${opt.value}`} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <Button onClick={handleGenerateImage} isLoading={isLoading} disabled={isLoading || !bibleData || !isApiKeyAvail} icon="image" variant="primary" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400">
        Générer Image
      </Button>
      {!isApiKeyAvail && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{API_KEY_ERROR_MESSAGE}</p>}

      {isLoading && <Loader message="Génération de l'image..." />}
      {finalPromptUsed && !isLoading && (
        <AIPromptDisplay 
            prompt={finalPromptUsed} 
            onCopy={() => {
                copyTextToClipboard(finalPromptUsed)
                .then(() => onSetStatusMessage("Prompt de l'image copié.", false))
                .catch(() => onSetStatusMessage("Erreur copie du prompt.", true));
            }} 
        />
      )}
      <AIOutputDisplay minHeightClass="min-h-[250px]" isTextCentered={!generatedImageUrl && !generationError}>
        {generationError && !isLoading && (
            <p className="text-red-500 dark:text-red-400 text-center p-4">{generationError}</p>
        )}
        {generatedImageUrl && !generationError && (
          <img 
            src={generatedImageUrl} 
            alt="Image Générée" 
            className="max-w-full max-h-[400px] h-auto rounded-md shadow-md object-contain cursor-pointer"
            onClick={() => onOpenImageLightbox(generatedImageUrl)}
          />
        ) }
        {!generatedImageUrl && !generationError && !isLoading && (
            <p className="italic">L'image générée par l'IA apparaîtra ici.</p>
        )}
      </AIOutputDisplay>
    </AIToolSection>
  );
};

export default VisualGenerator;
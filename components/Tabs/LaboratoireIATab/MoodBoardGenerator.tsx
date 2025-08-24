
import React, { useState } from 'react';
import { BibleData, MoodBoardImage } from '../../../types';
import { AIToolSection, AIOutputDisplay } from './common';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { 
    generateMoodBoardImagePrompts, 
    generateSinglePageMoodBoardPrompt, 
    generateImage, 
    isGeminiApiKeyAvailable 
} from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';
import { copyTextToClipboard } from '../../../services/bibleUtils';

interface MoodBoardGeneratorProps {
  bibleData: BibleData | null;
  onSetStatusMessage: (message: string, isError?: boolean) => void;
  onOpenImageLightbox: (url: string) => void;
  onBack?: () => void;
}

type GenerationMode = 'grid' | 'singlePage';

const MoodBoardGenerator: React.FC<MoodBoardGeneratorProps> = ({
  bibleData,
  onSetStatusMessage,
  onOpenImageLightbox,
  onBack,
}) => {
  const [generationMode, setGenerationMode] = useState<GenerationMode>('grid');
  const [sceneDescriptionInput, setSceneDescriptionInput] = useState('');
  const [userKeywords, setUserKeywords] = useState('');
  const [numImages, setNumImages] = useState<number>(6); // Only for grid mode
  const [moodBoardImages, setMoodBoardImages] = useState<MoodBoardImage[]>([]); // Can hold 1 for singlePage
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('');
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const handleGenerateMoodBoard = async () => {
    if (!bibleData) {
      onSetStatusMessage("Chargez une Bible pour utiliser cet outil.", true);
      return;
    }
    if (!isApiKeyAvail) {
      onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
      return;
    }
    if (generationMode === 'grid' && (numImages <= 0 || numImages > 8)) {
        onSetStatusMessage("Veuillez choisir un nombre d'images entre 1 et 8 pour le mode grille.", true);
        return;
    }

    setIsLoading(true);
    setMoodBoardImages([]);
    setCurrentLoadingMessage("Préparation de l'inspiration pour le mood board...");
    onSetStatusMessage("Génération du Mood Board en cours...", false);

    try {
      if (generationMode === 'grid') {
        setCurrentLoadingMessage("Génération des concepts d'images pour la grille...");
        const imagePrompts = await generateMoodBoardImagePrompts(
          bibleData,
          numImages,
          userKeywords,
          sceneDescriptionInput
        );
        
        const initialImagesData: MoodBoardImage[] = imagePrompts.map((prompt, index) => ({
          id: `moodboard_img_grid_${Date.now()}_${index}`,
          prompt: prompt,
          isLoading: true,
        }));
        setMoodBoardImages(initialImagesData);
        onSetStatusMessage("Concepts d'images générés. Création des visuels de la grille...", false);

        const updatedImages = await Promise.all(
          initialImagesData.map(async (imgData, index) => {
            setCurrentLoadingMessage(`Génération image ${index + 1}/${initialImagesData.length}...`);
            try {
              const imageUrl = await generateImage(imgData.prompt);
              return { ...imgData, imageUrl, isLoading: false };
            } catch (imgError: any) {
              return { ...imgData, error: `Erreur API: ${imgError.message?.substring(0, 50) || 'inconnue'}`, isLoading: false };
            }
          })
        );
        setMoodBoardImages(updatedImages);
        onSetStatusMessage("Mood Board (Grille) généré avec succès !", false);

      } else { // singlePage mode
        setCurrentLoadingMessage("Génération du concept pour l'image unique...");
        const singlePrompt = await generateSinglePageMoodBoardPrompt(
          bibleData,
          userKeywords,
          sceneDescriptionInput
        );

        const initialImage: MoodBoardImage = {
            id: `moodboard_img_single_${Date.now()}`,
            prompt: singlePrompt,
            isLoading: true,
        };
        setMoodBoardImages([initialImage]);
        onSetStatusMessage("Concept pour l'image unique généré. Création du visuel...", false);
        setCurrentLoadingMessage(`Génération de l'image unique...`);
        
        try {
            const imageUrl = await generateImage(singlePrompt);
            setMoodBoardImages([{ ...initialImage, imageUrl, isLoading: false }]);
            onSetStatusMessage("Mood Board (Page Unique) généré avec succès !", false);
        } catch (imgError: any) {
             setMoodBoardImages([{ ...initialImage, error: `Erreur API: ${imgError.message?.substring(0, 50) || 'inconnue'}`, isLoading: false }]);
        }
      }

    } catch (error: any) {
      console.error("Erreur génération Mood Board:", error);
      onSetStatusMessage(`Erreur Mood Board: ${error.message}`, true);
      setMoodBoardImages([]);
    } finally {
      setIsLoading(false);
      setCurrentLoadingMessage('');
    }
  };
  
  const handleCopyPrompt = (promptToCopy: string) => {
    copyTextToClipboard(promptToCopy)
      .then(() => onSetStatusMessage("Prompt de l'image copié !", false))
      .catch(() => onSetStatusMessage("Erreur lors de la copie du prompt.", true));
  };

  return (
    <AIToolSection title="Générateur de Mood Board Dynamique 🎨" onBack={onBack}>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        L'IA analyse votre Bible (et/ou une scène spécifique) pour générer un mood board visuel.
      </p>
      
      {/* Mode Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mode de Génération :</label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input type="radio" name="generationMode" value="grid" checked={generationMode === 'grid'} onChange={() => setGenerationMode('grid')} className="form-radio h-4 w-4 text-red-600 border-slate-300 focus:ring-red-500" disabled={isLoading} />
            <span className="ml-2 text-slate-700 dark:text-slate-200">Grille d'images</span>
          </label>
          <label className="inline-flex items-center">
            <input type="radio" name="generationMode" value="singlePage" checked={generationMode === 'singlePage'} onChange={() => setGenerationMode('singlePage')} className="form-radio h-4 w-4 text-red-600 border-slate-300 focus:ring-red-500" disabled={isLoading} />
            <span className="ml-2 text-slate-700 dark:text-slate-200">Page Unique (Collage)</span>
          </label>
        </div>
      </div>

      {/* Scene Description Input */}
      <div className="mb-4">
        <label htmlFor="moodSceneDesc" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description de Scène (Optionnel):</label>
        <textarea
            id="moodSceneDesc"
            value={sceneDescriptionInput}
            onChange={(e) => setSceneDescriptionInput(e.target.value)}
            placeholder="Ex: Une poursuite haletante dans des ruelles cyberpunk sous la pluie..."
            rows={3}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 disabled:opacity-60"
            disabled={isLoading || !isApiKeyAvail}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
            <label htmlFor="moodKeywords" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mots-clés / Style (Optionnel):</label>
            <input
                type="text"
                id="moodKeywords"
                value={userKeywords}
                onChange={(e) => setUserKeywords(e.target.value)}
                placeholder="Ex: Photorealiste, Aquarelle sombre, Style Ghibli..."
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 disabled:opacity-60"
                disabled={isLoading || !isApiKeyAvail}
            />
        </div>
        {generationMode === 'grid' && (
            <div>
                <label htmlFor="moodNumImages" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre d'images (1-8):</label>
                <input
                    type="number"
                    id="moodNumImages"
                    value={numImages}
                    onChange={(e) => setNumImages(parseInt(e.target.value, 10))}
                    min="1"
                    max="8"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 disabled:opacity-60"
                    disabled={isLoading || !isApiKeyAvail}
                />
            </div>
        )}
      </div>
      <Button 
        onClick={handleGenerateMoodBoard} 
        isLoading={isLoading} 
        disabled={isLoading || !bibleData || !isApiKeyAvail} 
        icon="auto_awesome_mosaic" 
        variant="primary" 
        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500 dark:focus:ring-red-400"
      >
        Générer le Mood Board
      </Button>
      {!isApiKeyAvail && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{API_KEY_ERROR_MESSAGE}</p>}

      {isLoading && currentLoadingMessage && <Loader message={currentLoadingMessage} size="sm" />}
      
      {moodBoardImages.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">Votre Mood Board :</h4>
          {generationMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {moodBoardImages.map((img) => (
                <div key={img.id} className="bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-lg p-2 shadow group relative">
                  <div 
                      className="aspect-square bg-slate-200 dark:bg-slate-600 rounded flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={() => img.imageUrl && onOpenImageLightbox(img.imageUrl)}
                  >
                    {img.isLoading && <Loader message="Chargement..." size="sm" />}
                    {img.error && <p className="text-xs text-red-500 dark:text-red-400 p-1 text-center">{img.error}</p>}
                    {img.imageUrl && <img src={img.imageUrl} alt={`Image générée pour le mood board`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
                    {!img.isLoading && !img.imageUrl && !img.error && <span className="text-xs italic text-slate-400 dark:text-slate-500">Image non générée</span>}
                  </div>
                  <button
                      title="Copier le prompt de cette image"
                      onClick={() => handleCopyPrompt(img.prompt)}
                      className="absolute top-1 right-1 bg-slate-600 hover:bg-slate-700 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Copier le prompt de l'image"
                  >
                     <span className="material-icons-outlined text-sm leading-none">content_copy</span>
                  </button>
                   {img.imageUrl && 
                      <a 
                          href={img.imageUrl} 
                          download={`moodboard_image_grid_${img.id}.png`} 
                          className="absolute bottom-1 right-1 bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Télécharger cette image"
                          aria-label="Télécharger cette image"
                      >
                         <span className="material-icons-outlined text-sm leading-none">download</span>
                      </a>
                    }
                </div>
              ))}
            </div>
          ) : ( // Single Page Mode
            moodBoardImages[0] && (
                <div className="bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-lg p-3 shadow group relative w-full max-w-lg mx-auto">
                    <div 
                        className="aspect-video bg-slate-200 dark:bg-slate-600 rounded flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => moodBoardImages[0].imageUrl && onOpenImageLightbox(moodBoardImages[0].imageUrl)}
                    >
                        {moodBoardImages[0].isLoading && <Loader message="Chargement..." size="md" />}
                        {moodBoardImages[0].error && <p className="text-sm text-red-500 dark:text-red-400 p-2 text-center">{moodBoardImages[0].error}</p>}
                        {moodBoardImages[0].imageUrl && <img src={moodBoardImages[0].imageUrl} alt={`Mood board page unique`} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />}
                        {!moodBoardImages[0].isLoading && !moodBoardImages[0].imageUrl && !moodBoardImages[0].error && <span className="text-sm italic text-slate-400 dark:text-slate-500">Image non générée</span>}
                    </div>
                    <div className="mt-2 flex justify-center items-center space-x-2">
                        <Button
                            title="Copier le prompt de cette image"
                            onClick={() => handleCopyPrompt(moodBoardImages[0].prompt)}
                            variant="secondary"
                            size="sm"
                            icon="content_copy"
                        >
                           Copier Prompt
                        </Button>
                        {moodBoardImages[0].imageUrl && 
                            <Button 
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = moodBoardImages[0].imageUrl!;
                                    link.download = `moodboard_single_page_${moodBoardImages[0].id}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    onSetStatusMessage("Image Mood Board téléchargée!", false);
                                }}
                                variant="success"
                                size="sm"
                                icon="download"
                            >
                               Télécharger
                            </Button>
                        }
                    </div>
                </div>
            )
          )}
        </div>
      )}
      {!isLoading && moodBoardImages.length === 0 && (userKeywords || sceneDescriptionInput) && (
           <div className="mt-6 text-center text-slate-500 dark:text-slate-400">
                <p>Aucune image générée. Essayez d'ajuster vos paramètres.</p>
           </div>
      )}

    </AIToolSection>
  );
};

export default MoodBoardGenerator;

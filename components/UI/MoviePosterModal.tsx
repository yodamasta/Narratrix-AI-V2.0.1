
import React, { useState, useEffect } from 'react';
import { BibleData } from '../../types';
import Modal from './Modal';
import Loader from './Loader';
import { generateImage, isGeminiApiKeyAvailable } from '../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../constants';
import Button from './Button'; // Import Button component

interface MoviePosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  bibleData: BibleData | null;
  onSetStatusMessageGlobal: (message: string, isError?: boolean) => void;
}

const MoviePosterModal: React.FC<MoviePosterModalProps> = ({ 
    isOpen, 
    onClose, 
    bibleData,
    onSetStatusMessageGlobal 
}) => {
  const [posterImageUrl, setPosterImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  useEffect(() => {
    if (!isOpen || !bibleData) {
        setPosterImageUrl(null);
        setIsGenerating(false);
        setGenerationError(null);
        return;
    }

    // Only generate if not already generated, not currently generating, and no error
    if (bibleData && !posterImageUrl && !isGenerating && !generationError) {
      const generate = async () => {
        setIsGenerating(true);
        setGenerationError(null); // Clear previous error before new attempt
        onSetStatusMessageGlobal("Génération du visuel...", false);
        try {
          const projectType = bibleData.pitchSection?.positionnement?.type?.toLowerCase() || 'film';
          let imageStylePrompt = "cinematic movie poster"; // Default
          let specificMediumInstructions = "Emphasize mood and a central iconic visual. No text overlay on the image itself. Aspect ratio 16:9 or similar common poster/cover ratio.";
          let imagePromptDetails = `for a project titled "${bibleData.projectInfo.title}". Visual style: ${bibleData.pitchSection.ambianceSpecifique}. Main theme/concept: ${bibleData.pitchSection.logline}.`;

          if (projectType.includes('jeu vidéo') || projectType.includes('video game')) {
            imageStylePrompt = "video game box art, high quality digital painting";
            specificMediumInstructions = "Dynamic and engaging, suitable for a game cover. Feature the main character prominently if described. Convey the game's genre and atmosphere. No text overlay on the image itself. Aspect ratio appropriate for game box art.";
            onSetStatusMessageGlobal("Génération de la jaquette du jeu vidéo...", false);
          } else if (projectType.includes('manga') || projectType.includes('anime')) {
            imageStylePrompt = "manga cover art, detailed anime illustration style";
            specificMediumInstructions = "Vibrant and detailed, in a style typical of manga or anime. Dynamic poses for characters. Clean background or evocative scenery. No text overlay on the image itself. Aspect ratio typical for manga/anime covers.";
            onSetStatusMessageGlobal("Génération de la couverture manga/anime...", false);
          } else if (projectType.includes('roman') || projectType.includes('livre') || projectType.includes('book')) {
            imageStylePrompt = "epic book cover illustration, fantasy art style or genre-appropriate style";
            specificMediumInstructions = "Artistic and evocative, suitable for a book cover. Reflect the story's genre and themes. Can be character-focused or symbolic. No text overlay on the image itself. Aspect ratio typical for book covers.";
            onSetStatusMessageGlobal("Génération de la couverture du livre...", false);
          } else if (projectType.includes('série') || projectType.includes('series')) {
            imageStylePrompt = "tv series promotional poster, cinematic quality";
            specificMediumInstructions = "Intriguing and high-quality, similar to a movie poster but for a series. Hint at ongoing storylines or multiple key characters if applicable. No text overlay on the image itself. Aspect ratio 16:9 or similar.";
             onSetStatusMessageGlobal("Génération de l'affiche de série...", false);
          } else {
             onSetStatusMessageGlobal("Génération de l'affiche du film...", false);
          }
          
          let prompt = `${imageStylePrompt} ${imagePromptDetails} ${specificMediumInstructions}`;
          
          if (bibleData.personnagesSection?.heros) {
            const hero = bibleData.personnagesSection.heros;
            prompt += ` Featuring the main character: ${hero.promptDescription || hero.nomComplet || hero.nom}.`;
          }
          
          const imageUrl = await generateImage(prompt);
          setPosterImageUrl(imageUrl);
          onSetStatusMessageGlobal("Visuel généré !", false);
        } catch (err: any) {
          const errMsg = err.message || "Erreur inconnue lors de la génération du visuel.";
          setGenerationError(errMsg); // Set local error
          onSetStatusMessageGlobal(`Erreur génération visuel: ${errMsg}`, true);
        } finally {
          setIsGenerating(false);
        }
      };

      if (isApiKeyAvail) {
          generate();
      } else {
          const errorMsg = API_KEY_ERROR_MESSAGE + " Le visuel ne peut être généré.";
          setGenerationError(errorMsg); // Set local error
          setIsGenerating(false);
          onSetStatusMessageGlobal(errorMsg, true);
      }
    }
  }, [isOpen, bibleData, posterImageUrl, isGenerating, generationError, isApiKeyAvail, onSetStatusMessageGlobal]);

  const handleDownloadImage = () => {
    if (posterImageUrl && bibleData) {
        const link = document.createElement('a');
        link.href = posterImageUrl;
        const safeTitle = bibleData.projectInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const projectType = bibleData.pitchSection?.positionnement?.type?.toLowerCase() || 'image';
        let fileTypePrefix = 'visuel';
        if (projectType.includes('jeu vidéo')) fileTypePrefix = 'jaquette_jeu';
        else if (projectType.includes('manga') || projectType.includes('anime')) fileTypePrefix = 'couverture_manga_anime';
        else if (projectType.includes('roman') || projectType.includes('livre')) fileTypePrefix = 'couverture_livre';
        else if (projectType.includes('série')) fileTypePrefix = 'affiche_serie';
        else if (projectType.includes('film')) fileTypePrefix = 'affiche_film';
        
        link.download = `${fileTypePrefix}_${safeTitle}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onSetStatusMessageGlobal("Visuel téléchargé.", false);
    } else {
        onSetStatusMessageGlobal("Impossible de télécharger le visuel.", true);
    }
  };


  if (!isOpen || !bibleData) return null;

  const title = bibleData.projectInfo.title;
  const tagline = bibleData.projectInfo.subtitle || bibleData.pitchSection.logline;
  const starring = bibleData.personnagesSection?.heros?.acteurReference;
  const projectTypeRaw = bibleData.pitchSection?.positionnement?.type?.toLowerCase() || 'film';
  const isFilmOrTV = projectTypeRaw.includes('film') || projectTypeRaw.includes('série') || projectTypeRaw.includes('series');

  const titleFontSize = title.length > 30 ? 'text-xl sm:text-2xl' : (title.length > 15 ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl');


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidthClass="max-w-md"> {/* max-w-md for typical poster proportions */}
      <div className="bg-slate-900 p-3 sm:p-4 rounded-lg">
        {/* Image Container */}
        <div className="aspect-[2/3] w-full bg-slate-800 rounded-md overflow-hidden shadow-2xl flex items-center justify-center relative">
          {isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
              <Loader message="Génération du visuel..." size="lg" />
            </div>
          )}
          {generationError && !isGenerating && ( // Display error more prominently
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-700 p-4 text-center">
                  <span className="material-icons-outlined text-4xl mb-2 text-red-300">error_outline</span>
                  <p className="text-red-300 text-sm">{generationError}</p>
              </div>
          )}
          {posterImageUrl && !isGenerating && !generationError && (
            <img 
              src={posterImageUrl} 
              alt={`Visuel pour ${title}`} 
              className="w-full h-full object-cover" 
            />
          )}
          {!isGenerating && !posterImageUrl && !generationError && ( // Fallback if still no image and no error (e.g. API key missing and generation not attempted)
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-700 p-4 text-center">
                  <span className="material-icons-outlined text-4xl mb-2 text-slate-400">image_not_supported</span>
                  <p className="text-slate-400 text-sm">Visuel non disponible.</p>
              </div>
          )}
        </div>

        {/* Textual Information Below Image - Only show if no error or while generating */}
        {(!generationError || isGenerating) && (
            <div className="text-white mt-4 p-2 text-center">
                <h1 
                    className={`font-extrabold uppercase ${titleFontSize} leading-tight break-words [text-shadow:_1px_2px_3px_rgba(0,0,0,0.7)]`}
                    style={{fontFamily: "'Impact', 'Arial Black', sans-serif"}}
                >
                    {title}
                </h1>
                {tagline && (
                <p 
                    className="text-sm sm:text-base italic mt-1.5 opacity-90 [text-shadow:_1px_1px_2px_rgba(0,0,0,0.6)]"
                    style={{fontFamily: "'Georgia', 'Times New Roman', serif"}}
                >
                    {tagline}
                </p>
                )}
                <p className="text-xs mt-3 opacity-80">{isFilmOrTV ? "[ PROCHAINEMENT ]" : "[ DÉCOUVREZ L'UNIVERS ]"}</p>
                {isFilmOrTV && starring && (
                <p className="text-xs sm:text-sm mt-2 opacity-80">
                    AVEC <span className="font-semibold">{starring.toUpperCase()}</span>
                </p>
                )}
                 {!isFilmOrTV && bibleData.projectInfo.author && (
                     <p className="text-xs sm:text-sm mt-2 opacity-80">
                        UNE CRÉATION DE <span className="font-semibold">{bibleData.projectInfo.author.toUpperCase()}</span>
                    </p>
                 )}
                <p className="text-[0.6rem] sm:text-xs mt-2 opacity-60">UNE PRODUCTION DE L'IMAGINAIRE</p>
            </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button
                onClick={handleDownloadImage}
                variant="success"
                icon="download"
                disabled={!posterImageUrl || isGenerating}
                className="w-full"
            >
                Télécharger Visuel
            </Button>
            <Button
                onClick={onClose}
                variant="secondary"
                className="w-full"
            >
                Fermer
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MoviePosterModal;
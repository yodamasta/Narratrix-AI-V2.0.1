

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BibleData } from '../../types';
import { COMPLETE_BLANK_BIBLE_STRUCTURE, API_KEY_ERROR_MESSAGE, APP_NAME } from '../../constants';
import JsonModelDisplay from './JsonModelDisplay';
import TextToJsonConverter from './TextToJsonConverter';
import { correctJsonWithAI, isGeminiApiKeyAvailable } from '../../services/geminiService';
import Button from '../UI/Button';
import Loader from '../UI/Loader';
import AnimatedWelcomeBox from '../UI/AnimatedWelcomeBox';

interface BibleLoaderProps {
  onBibleLoad: (data: BibleData) => void;
  onBibleClear: () => void;
  statusMessage: string;
  setStatusMessage: (message: string, isError?: boolean) => void;
  isBibleLoaded: boolean;
  bibleData: BibleData | null; 
}

const BibleLoader: React.FC<BibleLoaderProps> = ({ 
    onBibleLoad, 
    onBibleClear,
    statusMessage,
    setStatusMessage,
    isBibleLoaded,
    bibleData 
}) => {
  const [isLoaderVisible, setIsLoaderVisible] = useState<boolean>(true);
  const [jsonText, setJsonText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadPastedJsonButtonRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadButtonBlinking, setIsLoadButtonBlinking] = useState(false);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const attemptLoadJson = useCallback(async (jsonDataString: string, source: 'text' | 'file' | 'ai-generated') => {
    setIsLoading(true);
    setStatusMessage(`Chargement des données JSON (${source})...`, false);
    try {
        const parsedData = JSON.parse(jsonDataString) as BibleData;
        if (!parsedData.projectInfo || !parsedData.projectInfo.title) {
            throw new Error("Le JSON est valide mais ne semble pas être une Bible (projectInfo.title manquant).");
        }
        onBibleLoad(parsedData);
        setStatusMessage(`Bible (${source}) chargée avec succès ! Initialisation...`, false);
        setJsonText(''); 
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsLoaderVisible(false); 
    } catch (error: any) {
        console.error(`Erreur de parsing JSON (${source}):`, error);
        const initialErrorMessage = `Erreur (${source}): JSON invalide. Message: ${error.message}`;
        setStatusMessage(initialErrorMessage, true);

        if (isApiKeyAvail) {
            setStatusMessage(`JSON invalide. Tentative de correction avec l'IA... (${error.message})`, true);
            try {
                const correctedJson = await correctJsonWithAI(jsonDataString, COMPLETE_BLANK_BIBLE_STRUCTURE);
                setStatusMessage("Correction IA terminée. Nouvelle tentative de chargement...", false);
                const parsedCorrectedData = JSON.parse(correctedJson) as BibleData;
                 if (!parsedCorrectedData.projectInfo || !parsedCorrectedData.projectInfo.title) {
                    throw new Error("Le JSON corrigé est valide mais ne semble pas être une Bible (projectInfo.title manquant).");
                }
                onBibleLoad(parsedCorrectedData);
                setStatusMessage(`Bible (corrigée par IA depuis ${source}) chargée avec succès !`, false);
                setJsonText('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                setIsLoaderVisible(false); 
            } catch (correctionError: any) {
                console.error("Erreur après correction IA:", correctionError);
                setStatusMessage(`Échec du chargement même après correction IA. Erreur: ${correctionError.message}. Veuillez vérifier manuellement le JSON.`, true);
            }
        } else {
            setStatusMessage(`${initialErrorMessage}. Correction IA non disponible (clé API manquante).`, true);
        }
    } finally {
        setIsLoading(false);
    }
  }, [onBibleLoad, setStatusMessage, isApiKeyAvail]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setJsonText(fileContent); 
        attemptLoadJson(fileContent, 'file');
      };
      reader.onerror = () => {
        setStatusMessage("Erreur de lecture du fichier.", true);
        setIsLoading(false);
      };
      reader.readAsText(file);
      setIsLoading(true); 
      setStatusMessage("Lecture du fichier...", false);
    }
  };

  const handleLoadJsonFromText = () => {
    if (!jsonText.trim()) {
      setStatusMessage("Veuillez coller du JSON ou charger un fichier.", true);
      return;
    }
    setIsLoadButtonBlinking(false); 
    attemptLoadJson(jsonText, 'text');
  };
  
  const handleJsonFromTextConverter = (generatedJson: string) => {
    setJsonText(generatedJson); 
    setIsLoadButtonBlinking(true); 
    setTimeout(() => {
        loadPastedJsonButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };


  const handleDownloadBible = () => {
    if (!bibleData) {
        setStatusMessage("Aucune Bible chargée à télécharger.", true);
        return;
    }
    try {
        const bibleJsonString = JSON.stringify(bibleData, null, 2);
        const blob = new Blob([bibleJsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTitle = bibleData.projectInfo?.title?.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase() || 'bible_universelle';
        a.download = `${safeTitle}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatusMessage("Bible téléchargée avec succès!", false);
    } catch (error) {
        console.error("Erreur lors de la préparation du téléchargement de la Bible:", error);
        setStatusMessage("Erreur lors du téléchargement de la Bible.", true);
    }
  };

  const handleReset = () => {
    onBibleClear();
    setJsonText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsLoaderVisible(true);
    setIsLoadButtonBlinking(false); 
  };


  return (
    <div className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 ease-in-out ${!isLoaderVisible ? 'max-h-14 sm:max-h-16 overflow-hidden': 'max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-thin-dark'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center pt-3 pb-2">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200">Gestion de la Bible</h2>
          <Button 
            onClick={() => setIsLoaderVisible(!isLoaderVisible)} 
            variant={isLoaderVisible ? 'success' : 'danger'}
            size="sm"
            className={!isLoaderVisible ? 'animate-subtle-blink' : ''}
          >
            {isLoaderVisible ? 'Masquer' : 'Afficher'} contrôles
          </Button>
        </div>

        {isLoaderVisible && (
          <div className="pb-4">
            {!isBibleLoaded && (
              <div className="my-3"> 
                <AnimatedWelcomeBox appName={APP_NAME} />
              </div>
            )}
            
            <TextToJsonConverter 
                onJsonGenerated={handleJsonFromTextConverter}
                onSetStatusMessage={setStatusMessage}
            />

            <JsonModelDisplay 
                onCopySuccess={(msg) => setStatusMessage(msg, false)}
                onCopyError={(msg) => setStatusMessage(msg, true)}
            />

            <div id="json-loader-section" className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 my-4 pt-4 border-t border-slate-300 dark:border-slate-700">
              <div>
                <label htmlFor="jsonFileUpload" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Charger un fichier JSON:
                </label>
                <input
                  type="file"
                  id="jsonFileUpload"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 dark:file:bg-teal-700 file:text-teal-700 dark:file:text-teal-100 hover:file:bg-teal-100 dark:hover:file:bg-teal-600 transition cursor-pointer border border-slate-300 dark:border-slate-600 rounded-full px-3 py-1.5 disabled:opacity-60"
                  disabled={isLoading}
                />
                <div className="mt-3 flex justify-center">
                  <Button
                    ref={loadPastedJsonButtonRef}
                    onClick={handleLoadJsonFromText}
                    variant="primary"
                    icon="upload_file"
                    isLoading={isLoading}
                    disabled={isLoading || !jsonText.trim()}
                    size="sm"
                    className={`w-full sm:w-auto rounded-full ${isLoadButtonBlinking ? 'animate-attention-blink' : ''}`}
                  >
                    Charger la Bible (Texte Collé)
                  </Button>
                </div>
              </div>
              <div> 
                <label htmlFor="jsonTextArea" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ou collez le contenu JSON ici:
                </label>
                <textarea
                  id="jsonTextArea"
                  rows={3}
                  className="block w-full p-2.5 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 disabled:opacity-60"
                  placeholder="Coller le contenu de votre Bible JSON ici..."
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    if (isLoadButtonBlinking) setIsLoadButtonBlinking(false); 
                  }}
                  disabled={isLoading}
                />
                <div className="mt-3 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleDownloadBible}
                    variant="success"
                    icon="download"
                    disabled={isLoading || !isBibleLoaded}
                    className="w-full sm:w-auto"
                  >
                    Télécharger Bible Actuelle
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="danger"
                    icon="clear"
                    disabled={isLoading && !isBibleLoaded} 
                    className="w-full sm:w-auto"
                  >
                    Nouvelle Bible / Réinitialiser
                  </Button>
                </div>
              </div>
            </div>
            
            {isLoading && <Loader message="Traitement en cours..." size="sm"/>}
            {statusMessage && (
              <div className={`mt-3 text-xs p-2 rounded-md min-h-[1.25rem] ${statusMessage.toLowerCase().includes('erreur') || statusMessage.toLowerCase().includes('échec') ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300'}`}>
                {statusMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleLoader;
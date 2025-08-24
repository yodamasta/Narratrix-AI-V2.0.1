

import React, { useState, useRef } from 'react';
import { convertTextToBibleJson, isGeminiApiKeyAvailable } from '../../services/geminiService';
import { COMPLETE_BLANK_BIBLE_STRUCTURE, API_KEY_ERROR_MESSAGE } from '../../constants';
import Button from '../UI/Button';
import Loader from '../UI/Loader';

interface TextToJsonConverterProps {
  onJsonGenerated: (jsonString: string) => void;
  onSetStatusMessage: (message: string, isError?: boolean) => void;
}

const PRECEPTS_LIST = [
  "Aucun (Texte libre / Histoire complète)",
  "Thriller / Suspense",
  "Science-Fiction (Futuriste / Exploration Spatiale)",
  "Science-Fiction (Cyberpunk / Dystopie)",
  "Fantasy (Héroïque / Médiéval-Fantastique)",
  "Fantasy (Urbaine / Contemporaine)",
  "Romance (Comédie / Drame)",
  "Aventure / Exploration",
  "Horreur / Épouvante",
  "Drame (Psychologique / Social)",
  "Comédie",
  "Film Noir / Polar",
  "Historique",
  "Court-Métrage (Tous genres)",
  "Manga / Anime (Shonen - Action, Aventure)",
  "Manga / Anime (Shojo - Romance, Drame)",
  "Manga / Anime (Seinen - Mature, Complexe)",
  "Manga / Anime (Isekai - Autre Monde)",
  "Webtoon / Manhwa (Coréen - Tous genres)",
  "Manhua (Chinois - Tous genres)",
  "Publicité / Spot TV",
  "Film d'Entreprise / Vidéo Corporate",
  "Documentaire (Investigatif / Nature / Portrait)",
  "Podcast Narratif / Fiction Audio",
  "Pièce de Théâtre (Actes / Scènes)",
  "Jeu Vidéo (RPG - Rôle)",
  "Jeu Vidéo (Aventure Narrative)",
  "Jeu Vidéo (Stratégie / Simulation)",
  "Jeu Vidéo (FPS - Tir à la Première Personne)",
  "Jeu Vidéo (TPS - Tir à la Troisième Personne)",
  "Jeu Vidéo (Combat / Versus Fighting)",
  "Jeu Vidéo (Sport)",
  "Jeu Vidéo (Plateforme)",
  "Jeu Vidéo (Puzzle / Réflexion)",
  "Jeu Vidéo (Course)",
  "Jeu Vidéo (Survival / Survie)",
  "Jeu Vidéo (MOBA / Arène de Bataille)",
  "Jeu Vidéo (Sandbox / Bac à Sable)",
  "Jeu de Rôle sur Table (Scénario / Campagne)",
];


const TextToJsonConverter: React.FC<TextToJsonConverterProps> = ({ onJsonGenerated, onSetStatusMessage }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrecept, setSelectedPrecept] = useState<string>(PRECEPTS_LIST[0]);
  const isApiKeyAvailable = isGeminiApiKeyAvailable();
  const textFileInputRef = useRef<HTMLInputElement>(null);

  const getPlaceholderText = () => {
    if (selectedPrecept && selectedPrecept !== PRECEPTS_LIST[0]) {
      return `Style: ${selectedPrecept}.\nDécrivez brièvement votre idée principale, un personnage clé, ou un élément de monde (ex: Un détective hanté par son passé enquête sur une série de meurtres rituels dans un univers cyberpunk sombre). L'IA développera une histoire et remplira la Bible JSON à partir de cela.`;
    }
    return "Collez votre histoire complète ou une description détaillée de votre univers ici... L'IA essaiera de la mapper à la structure JSON de la Bible.";
  };

  const handleConvert = async () => {
    if (!isApiKeyAvailable) {
        onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
        return;
    }
    if (!inputText.trim()) {
      onSetStatusMessage("Veuillez entrer du texte à convertir ou charger un fichier texte.", true);
      return;
    }
    setIsLoading(true);
    onSetStatusMessage("Conversion du texte en JSON par l'IA...", false);
    try {
      const preceptToPass = selectedPrecept === PRECEPTS_LIST[0] ? undefined : selectedPrecept;
      const generatedJson = await convertTextToBibleJson(inputText, COMPLETE_BLANK_BIBLE_STRUCTURE, preceptToPass);
      onJsonGenerated(generatedJson);
      onSetStatusMessage("JSON généré à partir du texte ! Vous pouvez maintenant le charger.", false);
      setInputText(''); 
      if (textFileInputRef.current) textFileInputRef.current.value = ''; 
    } catch (error: any) {
      console.error("Error converting text to JSON:", error);
      onSetStatusMessage(`Erreur lors de la conversion: ${error.message || 'Erreur inconnue.'}. Veuillez vérifier la console.`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setInputText(fileContent);
        onSetStatusMessage(`Fichier texte "${file.name}" chargé dans la zone de texte. Prêt à convertir.`, false);
      };
      reader.onerror = () => {
        onSetStatusMessage("Erreur de lecture du fichier texte.", true);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div id="text-to-json-converter" className="mt-6 p-4 border-t border-slate-300 dark:border-slate-700">
      <h3 className="text-md font-medium text-slate-700 dark:text-slate-200 mb-2">Convertir Texte en JSON (Bêta)</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
        Chargez un fichier texte (.txt, .md) ou collez votre description. Choisissez un style (optionnel) si vous souhaitez que l'IA développe une histoire complète pour vous.
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        L'IA tentera de la structurer en format Bible JSON. Cette fonctionnalité est expérimentale.
      </p>
      
      <div className="mb-3">
        <label htmlFor="preceptSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Choisir un Précepte/Style (Optionnel):
        </label>
        <select
          id="preceptSelect"
          value={selectedPrecept}
          onChange={(e) => setSelectedPrecept(e.target.value)}
          className="block w-full p-2.5 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 disabled:opacity-60"
          disabled={isLoading || !isApiKeyAvailable}
        >
          {PRECEPTS_LIST.map(precept => (
            <option key={precept} value={precept}>{precept}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="textFileInput" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Charger un fichier texte (écrase le texte ci-dessous):
        </label>
        <input
          type="file"
          id="textFileInput"
          accept=".txt,.md,text/*"
          ref={textFileInputRef}
          onChange={handleTextFileChange}
          className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 dark:file:bg-teal-700 file:text-teal-700 dark:file:text-teal-100 hover:file:bg-teal-100 dark:hover:file:bg-teal-600 transition cursor-pointer border border-slate-300 dark:border-slate-600 rounded-full px-3 py-1 disabled:opacity-60"
          disabled={isLoading || !isApiKeyAvailable}
        />
      </div>

      <label htmlFor="textToJsonInput" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Texte à convertir:
      </label>
      <textarea
        id="textToJsonInput"
        rows={5}
        className="block w-full p-2.5 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 disabled:opacity-60"
        placeholder={getPlaceholderText()}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={isLoading || !isApiKeyAvailable}
      />
      <Button
        onClick={handleConvert}
        variant="primary"
        icon="magic_button"
        isLoading={isLoading}
        disabled={isLoading || !isApiKeyAvailable}
        className="mt-3 w-full sm:w-auto"
      >
        Convertir en JSON
      </Button>
      {!isApiKeyAvailable && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{API_KEY_ERROR_MESSAGE}</p>}
      {isLoading && <Loader message="Conversion en cours..." size="sm" />}
    </div>
  );
};

export default TextToJsonConverter;
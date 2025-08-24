import React, { useState } from 'react';
import { BibleData } from '../../../types';
import { AIToolSection, AIOutputDisplay } from './common';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { generateText, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';

interface EtSiBrainstormerProps {
  bibleData: BibleData | null;
  onSetStatusMessage: (message: string, isError?: boolean) => void;
  onBack?: () => void; 
}

const EtSiBrainstormer: React.FC<EtSiBrainstormerProps> = ({ bibleData, onSetStatusMessage, onBack }) => {
  const [situation, setSituation] = useState('');
  const [generatedPistes, setGeneratedPistes] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const handleGeneratePistes = async () => {
    if (!bibleData) {
      onSetStatusMessage("Chargez une Bible pour utiliser cet outil.", true);
      return;
    }
     if (!isApiKeyAvail) {
        onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
        return;
    }
    if (!situation.trim()) {
      onSetStatusMessage("Veuillez décrire une situation de départ.", true);
      return;
    }

    setIsLoading(true);
    setGeneratedPistes(null);
    onSetStatusMessage("Exploration des possibilités 'Et si ?'...", false);

    const themesString = bibleData.themesSection?.themesPrincipaux?.map(t => t.theme).join(', ') || 'N/A';
    const prompt = `
Contexte général de l'univers:
Titre du projet: ${bibleData.projectInfo?.title || 'N/A'}
Pitch global: ${bibleData.pitchSection?.pitchGlobal || 'N/A'}
Ambiance spécifique: ${bibleData.pitchSection?.ambianceSpecifique || 'N/A'}
Thèmes principaux (si définis): ${themesString}

Situation de départ / Prémisse pour le brainstorming "Et si ?":
"${situation}"

Instructions pour l'IA:
Tu es un assistant créatif pour un auteur. Basé sur la situation de départ fournie et le contexte de l'univers, génère 3 à 4 pistes de réflexion distinctes et intéressantes commençant impérativement par "Et si...".
Chaque piste doit explorer une alternative, une complication, une conséquence inattendue, ou une réaction de personnage différente qui pourrait découler de la situation de départ.
Les pistes doivent être concises mais stimulantes pour l'imagination.
Formatte chaque piste sur une nouvelle ligne, sans numérotation, juste le texte commençant par "Et si...".
Par exemple:
Et si... [première idée alternative] ?
Et si... [deuxième complication possible] ?
Et si... [troisième conséquence inattendue] ?

Évite les introductions ou conclusions du type "Voici quelques pistes :". Commence directement par la première piste "Et si...".`;

    const systemInstruction = "Tu es un brainstormer créatif qui aide les auteurs à explorer des scénarios alternatifs.";
    
    try {
      const pistes = await generateText(prompt, systemInstruction);
      setGeneratedPistes(pistes);
      onSetStatusMessage("Pistes 'Et si ?' générées !", false);
    } catch (error: any) {
      console.error("Erreur génération 'Et si ?':", error);
      onSetStatusMessage(`Erreur 'Et si ?': ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fileNameForDownload = () => {
    const situationSnippet = situation.substring(0, 20).replace(/\s/g, '_').replace(/[^a-z0-9_]/gi, '') || 'brainstorm';
    return `et_si_${situationSnippet}.txt`;
  };
  
  const textAreaClasses = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 mb-4 disabled:opacity-60 dark:disabled:bg-slate-700/50";

  return (
    <AIToolSection title="Brainstorming 'Et si ?!' Scénarios 🧠✨" onBack={onBack}>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Décrivez une situation ou un point de départ de votre histoire. L'IA proposera des pistes alternatives ou des complications.</p>
      <label htmlFor="etSiSituationInput" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Situation de départ ou Prémisse :</label>
      <textarea
        id="etSiSituationInput"
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        placeholder="Ex: Le protagoniste découvre que son mentor est en réalité l'antagoniste..."
        rows={4}
        className={textAreaClasses}
        disabled={isLoading || !isApiKeyAvail}
      />
      <Button onClick={handleGeneratePistes} isLoading={isLoading} disabled={isLoading || !bibleData || !isApiKeyAvail} icon="lightbulb" variant="primary" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 focus:ring-amber-500 dark:focus:ring-amber-400">
        Générer des pistes 'Et si ?'
      </Button>
      {!isApiKeyAvail && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{API_KEY_ERROR_MESSAGE}</p>}


      {isLoading && <Loader message="Exploration des possibilités..." />}
      <AIOutputDisplay 
        textToCopy={generatedPistes} 
        onCopyStatus={onSetStatusMessage}
        fileNameGenerator={fileNameForDownload}
      >
        {generatedPistes ? 
            <div className="whitespace-pre-line">{generatedPistes}</div> 
            : (!isLoading && <p className="italic">Les pistes 'Et si ?' générées apparaîtront ici.</p>)
        }
      </AIOutputDisplay>
    </AIToolSection>
  );
};

export default EtSiBrainstormer;
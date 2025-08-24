import React, { useState } from 'react';
import { BibleData } from '../../../types';
import { CharacterOption, AIToolSection, AIOutputDisplay, buildCharacterContextForPrompt } from './common';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { generateText, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';

interface DialogueGeneratorProps {
  bibleData: BibleData | null;
  characterOptions: CharacterOption[];
  onSetStatusMessage: (message: string, isError?: boolean) => void;
  onBack?: () => void; 
}

const DialogueGenerator: React.FC<DialogueGeneratorProps> = ({ bibleData, characterOptions, onSetStatusMessage, onBack }) => {
  const [situation, setSituation] = useState('');
  const [char1, setChar1] = useState('');
  const [char2, setChar2] = useState('');
  const [generatedDialogue, setGeneratedDialogue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const dialogCharacterOptions = [{ value: '', label: 'Choisir personnage...' }, ...characterOptions.filter(opt => opt.value !== '')];

  const selectClasses = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 disabled:opacity-60 dark:disabled:bg-slate-700/50";
  const textAreaClasses = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 disabled:opacity-60 dark:disabled:bg-slate-700/50";


  const handleGenerateDialogue = async () => {
    if (!bibleData) {
      onSetStatusMessage("Chargez une Bible pour utiliser cet outil.", true);
      return;
    }
    if (!isApiKeyAvail) {
        onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
        return;
    }
    if (!situation.trim() || !char1 || !char2) {
      onSetStatusMessage("Veuillez sélectionner deux personnages et décrire une situation.", true);
      return;
    }
    if (char1 === char2) {
      onSetStatusMessage("Veuillez sélectionner deux personnages différents.", true);
      return;
    }

    setIsLoading(true);
    setGeneratedDialogue(null);
    onSetStatusMessage("Génération du dialogue en cours...", false);

    const char1Data = characterOptions.find(opt => opt.value === char1);
    const char2Data = characterOptions.find(opt => opt.value === char2);

    const prompt = `
Contexte de l'univers:
Titre du projet: ${bibleData.projectInfo?.title || 'N/A'}
Pitch global: ${bibleData.pitchSection?.pitchGlobal || 'N/A'}
Ambiance spécifique: ${bibleData.pitchSection?.ambianceSpecifique || 'N/A'}

Personnages impliqués:
1. ${char1Data?.label || char1}:
   - Description (pour IA visuelle): ${char1Data?.promptDescription || 'Non fournie'}
2. ${char2Data?.label || char2}:
   - Description (pour IA visuelle): ${char2Data?.promptDescription || 'Non fournie'}

Situation pour le dialogue:
"${situation}"

Instructions pour l'IA:
Génère un dialogue concis (environ 4-8 répliques au total, alternées) entre ${char1} et ${char2} basé sur la situation et leurs profils (utiliser les descriptions si elles aident à définir leur ton/personnalité).
Le dialogue doit refléter leurs personnalités distinctes, leurs relations possibles, et l'ambiance de l'univers.
Formate le dialogue clairement en utilisant le nom du personnage suivi de deux-points puis sa réplique. Chaque réplique sur une nouvelle ligne. Par exemple:
${char1}: [Réplique de ${char1}]
${char2}: [Réplique de ${char2}]
...
Assure-toi que les répliques soient naturelles et crédibles pour chaque personnage.
Ne pas ajouter de descriptions d'action, de mise en scène, ou de commentaires méta, juste le dialogue pur.
Commence directement par la première réplique.`;

    const systemInstruction = `Tu es un scénariste talentueux capable de créer des dialogues percutants. Les personnages principaux du dialogue sont ${char1} et ${char2}.`;

    try {
      const dialogue = await generateText(prompt, systemInstruction, true); 
      setGeneratedDialogue(dialogue);
      onSetStatusMessage("Dialogue généré avec succès !", false);
    } catch (error: any) {
      console.error("Erreur génération dialogue:", error);
      onSetStatusMessage(`Erreur dialogue: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fileNameForDownload = () => {
    const c1Name = characterOptions.find(c => c.value === char1)?.label.replace(/\s/g, '_') || 'char1';
    const c2Name = characterOptions.find(c => c.value === char2)?.label.replace(/\s/g, '_') || 'char2';
    return `dialogue_${c1Name}_${c2Name}.txt`;
  };

  return (
    <AIToolSection title="Explorateur de Prompts Créatifs (Dialogues) 💬" onBack={onBack}> 
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Sélectionnez deux personnages, décrivez une situation, et l'IA proposera un dialogue.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-4 items-end">
        <div>
            <label htmlFor="dialogueChar1Select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Personnage 1:</label>
            <select id="dialogueChar1Select" value={char1} onChange={(e) => setChar1(e.target.value)} className={selectClasses} disabled={isLoading || !isApiKeyAvail}>
            {dialogCharacterOptions.map(opt => <option key={`dgc1-${opt.value}`} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="dialogueChar2Select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Personnage 2:</label>
            <select id="dialogueChar2Select" value={char2} onChange={(e) => setChar2(e.target.value)} className={selectClasses} disabled={isLoading || !isApiKeyAvail}>
            {dialogCharacterOptions.map(opt => <option key={`dgc2-${opt.value}`} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
      </div>
      <div className="mt-4 mb-4">
        <label htmlFor="dialogueSituationInput" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Situation / Contexte du dialogue:</label>
        <textarea
            id="dialogueSituationInput"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Ex: Personnage 1 confronte Personnage 2 à propos d'un objet volé..."
            rows={3}
            className={textAreaClasses}
            disabled={isLoading || !isApiKeyAvail}
        />
      </div>
      <Button onClick={handleGenerateDialogue} isLoading={isLoading} disabled={isLoading || !bibleData || !isApiKeyAvail} icon="forum" variant="success" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:ring-green-500 dark:focus:ring-green-400">
        Générer Dialogue
      </Button>
      {!isApiKeyAvail && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{API_KEY_ERROR_MESSAGE}</p>}

      {isLoading && <Loader message="Génération du dialogue..." />}
      <AIOutputDisplay 
        textToCopy={generatedDialogue} 
        onCopyStatus={onSetStatusMessage}
        fileNameGenerator={fileNameForDownload}
      >
        {generatedDialogue ? 
            <div className="whitespace-pre-line">{generatedDialogue}</div> 
            : (!isLoading && <p className="italic">Le dialogue généré apparaîtra ici.</p>)
        }
      </AIOutputDisplay>
    </AIToolSection>
  );
};

export default DialogueGenerator;
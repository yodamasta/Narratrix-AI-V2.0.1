
import React, { useState } from 'react';
import { BibleData, CharacterRelationshipSuggestion, CharacterRelationshipWeaverResult } from '../../../types';
import { CharacterOption, AIToolSection, AIOutputDisplay, getCharacterOptions } from './common';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import Card from '../../UI/Card';
import { generateCharacterRelationshipSuggestions, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';

interface CharacterRelationshipWeaverProps {
  bibleData: BibleData | null;
  characterOptions: CharacterOption[]; 
  onSetStatusMessage: (message: string, isError?: boolean) => void;
  onBack: () => void; 
}

const CharacterRelationshipWeaver: React.FC<CharacterRelationshipWeaverProps> = ({ 
    bibleData, 
    characterOptions, 
    onSetStatusMessage,
    onBack 
}) => {
  const [char1Id, setChar1Id] = useState<string>('');
  const [char2Id, setChar2Id] = useState<string>('');
  const [weaverResult, setWeaverResult] = useState<CharacterRelationshipWeaverResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  // Filter out the "Personnage (optionnel)" or empty value from the main characterOptions
  const actualCharacterOptions = [{ value: '', label: 'Choisir personnage...' }, ...characterOptions.filter(opt => opt.value !== '')];

  const handleWeaveRelationships = async () => {
    if (!bibleData) {
      onSetStatusMessage("Chargez une Bible pour utiliser cet outil.", true);
      return;
    }
    if (!isApiKeyAvail) {
      onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
      return;
    }
    if (!char1Id || !char2Id) {
      onSetStatusMessage("Veuillez sélectionner deux personnages.", true);
      return;
    }
    if (char1Id === char2Id) {
      onSetStatusMessage("Veuillez sélectionner deux personnages différents.", true);
      return;
    }

    setIsLoading(true);
    setWeaverResult(null);
    onSetStatusMessage("L'IA tisse les liens entre les personnages...", false);

    try {
      const suggestions = await generateCharacterRelationshipSuggestions(
        bibleData,
        char1Id,
        char2Id
      );
      const char1Name = actualCharacterOptions.find(c => c.value === char1Id)?.label || char1Id;
      const char2Name = actualCharacterOptions.find(c => c.value === char2Id)?.label || char2Id;
      setWeaverResult({
        character1Name: char1Name,
        character2Name: char2Name,
        suggestions,
      });
      onSetStatusMessage("Suggestions de relations générées !", false);
    } catch (error: any) {
      console.error("Erreur Tisseur de Liens:", error);
      onSetStatusMessage(`Erreur Tisseur de Liens: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const getRelationshipTextForCopy = (): string | null => {
    if (!weaverResult) return null;
    let text = `Suggestions de relations entre ${weaverResult.character1Name} et ${weaverResult.character2Name}:\n\n`;
    weaverResult.suggestions.forEach((sugg, index) => {
      text += `Suggestion ${index + 1}: ${sugg.typeRelation}\n`;
      text += `  Justification: ${sugg.justification}\n`;
      if (sugg.evenementsPassesPotentiels?.length) {
        text += `  Événements Passés Possibles:\n${sugg.evenementsPassesPotentiels.map(e => `    - ${e}`).join('\n')}\n`;
      }
      if (sugg.pointsInteractionsFuturs?.length) {
        text += `  Interactions Futures Possibles:\n${sugg.pointsInteractionsFuturs.map(p => `    - ${p}`).join('\n')}\n`;
      }
      if (sugg.ideesScenesTypes?.length) {
        text += `  Idées de Scènes Types:\n${sugg.ideesScenesTypes.map(sc => `    - ${sc}`).join('\n')}\n`;
      }
      text += '\n';
    });
    return text;
  };

  const fileNameForDownload = () => {
    const c1 = weaverResult?.character1Name.replace(/\s/g, '_') || 'char1';
    const c2 = weaverResult?.character2Name.replace(/\s/g, '_') || 'char2';
    return `relations_${c1}_${c2}.txt`;
  };

  const renderSuggestion = (suggestion: CharacterRelationshipSuggestion, index: number) => (
    <Card 
        key={index} 
        title={`Dynamique ${index + 1}: ${suggestion.typeRelation}`}
        icon="mediation"
        additionalClasses="mb-4 bg-slate-50 dark:bg-slate-700/80 border-l-4 border-pink-500 dark:border-pink-400"
    >
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong>Justification :</strong> {suggestion.justification}</p>
        {suggestion.evenementsPassesPotentiels && suggestion.evenementsPassesPotentiels.length > 0 && (
            <>
                <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 mb-1">Événements Passés Possibles :</h5>
                <ul className="list-disc list-inside pl-3 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                    {suggestion.evenementsPassesPotentiels.map((e, i) => <li key={`past-${i}`}>{e}</li>)}
                </ul>
            </>
        )}
        {suggestion.pointsInteractionsFuturs && suggestion.pointsInteractionsFuturs.length > 0 && (
            <>
                <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 mb-1">Points d'Interaction Futurs :</h5>
                <ul className="list-disc list-inside pl-3 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                    {suggestion.pointsInteractionsFuturs.map((p, i) => <li key={`future-${i}`}>{p}</li>)}
                </ul>
            </>
        )}
        {suggestion.ideesScenesTypes && suggestion.ideesScenesTypes.length > 0 && (
            <>
                <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 mb-1">Idées de Scènes Types :</h5>
                <ul className="list-disc list-inside pl-3 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                    {suggestion.ideesScenesTypes.map((s, i) => <li key={`scene-${i}`}>{s}</li>)}
                </ul>
            </>
        )}
    </Card>
  );

  return (
    <AIToolSection title="Tisseur de Liens entre Personnages 🔗" onBack={onBack}>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Choisissez deux personnages de votre Bible. L'IA analysera leurs profils et le contexte de l'univers pour vous suggérer des dynamiques relationnelles, des événements clés et des idées de scènes.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="char1RelSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Personnage 1:</label>
          <select 
            id="char1RelSelect" 
            value={char1Id} 
            onChange={(e) => setChar1Id(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 disabled:opacity-60"
            disabled={isLoading || !isApiKeyAvail || actualCharacterOptions.length <= 1}
          >
            {actualCharacterOptions.map(opt => <option key={`crw-c1-${opt.value}`} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="char2RelSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Personnage 2:</label>
          <select 
            id="char2RelSelect" 
            value={char2Id} 
            onChange={(e) => setChar2Id(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 disabled:opacity-60"
            disabled={isLoading || !isApiKeyAvail || actualCharacterOptions.length <= 1}
          >
            {actualCharacterOptions.map(opt => <option key={`crw-c2-${opt.value}`} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>
      
      <Button 
        onClick={handleWeaveRelationships} 
        isLoading={isLoading} 
        disabled={isLoading || !bibleData || !isApiKeyAvail || !char1Id || !char2Id || char1Id === char2Id} 
        icon="handshake" 
        variant="primary" 
        className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 focus:ring-pink-500 dark:focus:ring-pink-400"
      >
        Tisser les Liens
      </Button>
      {!isApiKeyAvail && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{API_KEY_ERROR_MESSAGE}</p>}

      {isLoading && <Loader message="L'IA tisse les liens..." />}
      
      <AIOutputDisplay 
        minHeightClass="min-h-[200px]"
        textToCopy={getRelationshipTextForCopy()}
        onCopyStatus={onSetStatusMessage}
        fileNameGenerator={fileNameForDownload}
      >
        {weaverResult && weaverResult.suggestions.length > 0 ? (
          <div className="text-left mt-4">
            <h4 className="text-md font-semibold text-slate-800 dark:text-slate-100 mb-3">
              Suggestions pour {weaverResult.character1Name} & {weaverResult.character2Name}:
            </h4>
            {weaverResult.suggestions.map(renderSuggestion)}
          </div>
        ) : (
          !isLoading && <p className="italic text-center">Les suggestions de relations apparaîtront ici.</p>
        )}
      </AIOutputDisplay>
    </AIToolSection>
  );
};

export default CharacterRelationshipWeaver;

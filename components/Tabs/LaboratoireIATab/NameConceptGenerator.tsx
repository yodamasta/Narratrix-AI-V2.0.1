
import React, { useState } from 'react';
import { AIToolSection, AIOutputDisplay } from './common';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { generateNameOrConcept, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';

interface NameConceptGeneratorProps {
  onSetStatusMessage: (message: string, isError?: boolean) => void;
  onBack?: () => void; 
}

type GenerationType = 'name' | 'concept';
type NameItemType = 'personnages' | 'lieux' | 'organisations' | 'objets' | 'technologies' | 'sorts' | 'autres';

const NameConceptGenerator: React.FC<NameConceptGeneratorProps> = ({ onSetStatusMessage, onBack }) => {
  const [generationType, setGenerationType] = useState<GenerationType>('name');
  const [nameItemType, setNameItemType] = useState<NameItemType>('personnages');
  const [theme, setTheme] = useState('');
  const [count, setCount] = useState<number>(5);
  const [results, setResults] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const handleGenerate = async () => {
    if (!isApiKeyAvail) {
        onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
        return;
    }
    if (!theme.trim()) {
      onSetStatusMessage("Veuillez entrer un thème ou un contexte.", true);
      return;
    }
    if (count <= 0 || count > 10) {
        onSetStatusMessage("Veuillez choisir un nombre de suggestions entre 1 et 10.", true);
        return;
    }

    setIsLoading(true);
    setResults(null);
    onSetStatusMessage(`Génération de ${generationType === 'name' ? 'noms' : 'concepts'} en cours...`, false);

    try {
      const generatedItems = await generateNameOrConcept(
        generationType,
        theme,
        count,
        generationType === 'name' ? nameItemType : undefined
      );
      setResults(generatedItems);
      onSetStatusMessage(`${generationType === 'name' ? 'Noms générés' : 'Concepts générés'} avec succès !`, false);
    } catch (error: any) {
      console.error(`Erreur génération ${generationType}:`, error);
      onSetStatusMessage(`Erreur ${generationType === 'name' ? 'des noms' : 'des concepts'}: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getResultsTextForCopy = (): string | null => {
    if (!results) return null;
    return results.join('\n');
  };

  const fileNameForDownload = () => {
    const type = generationType === 'name' ? nameItemType : 'concepts';
    const themeSnippet = theme.substring(0,15).replace(/\s/g, '_').replace(/[^a-z0-9_]/gi, '') || 'theme';
    return `suggestions_${type}_${themeSnippet}.txt`;
  };


  return (
    <AIToolSection title="Générateur de Noms & Concepts Aléatoires 🎲" onBack={onBack}>
      <p className="text-sm text-slate-600 mb-4">Bloqué ? Laissez l'IA vous suggérer des noms ou des concepts basés sur un thème.</p>
      
      <div className="mb-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type de Génération:</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="inline-flex items-center">
              <input type="radio" name="generationType" value="name" checked={generationType === 'name'} onChange={() => setGenerationType('name')} className="form-radio h-4 w-4 text-rose-600 border-slate-300 focus:ring-rose-500" disabled={isLoading || !isApiKeyAvail} />
              <span className="ml-2 text-slate-700">Noms</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="generationType" value="concept" checked={generationType === 'concept'} onChange={() => setGenerationType('concept')} className="form-radio h-4 w-4 text-rose-600 border-slate-300 focus:ring-rose-500" disabled={isLoading || !isApiKeyAvail}/>
              <span className="ml-2 text-slate-700">Concepts</span>
            </label>
          </div>
        </div>

        {generationType === 'name' && (
          <div>
            <label htmlFor="nameItemTypeSelect" className="block text-sm font-medium text-slate-700 mb-1">Type de Noms:</label>
            <select 
                id="nameItemTypeSelect" 
                value={nameItemType} 
                onChange={(e) => setNameItemType(e.target.value as NameItemType)} 
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-700 bg-white disabled:opacity-60"
                disabled={isLoading || !isApiKeyAvail}
            >
              <option value="personnages">Personnages</option>
              <option value="lieux">Lieux</option>
              <option value="organisations">Organisations</option>
              <option value="objets">Objets</option>
              <option value="technologies">Technologies</option>
              <option value="sorts">Sorts / Capacités</option>
              <option value="autres">Autres</option>
            </select>
          </div>
        )}

        <div>
            <label htmlFor="themeInput" className="block text-sm font-medium text-slate-700 mb-1">Thème / Contexte:</label>
            <input
                type="text"
                id="themeInput"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Fantaisie sombre, Cyberpunk néon, Comédie romantique..."
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-700 bg-white disabled:opacity-60"
                disabled={isLoading || !isApiKeyAvail}
            />
        </div>

        <div>
            <label htmlFor="countInput" className="block text-sm font-medium text-slate-700 mb-1">Nombre de suggestions (1-10):</label>
            <input
                type="number"
                id="countInput"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                min="1"
                max="10"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-700 bg-white disabled:opacity-60"
                disabled={isLoading || !isApiKeyAvail}
            />
        </div>
      </div>
      
      <Button onClick={handleGenerate} isLoading={isLoading} disabled={isLoading || !isApiKeyAvail} icon="casino" variant="primary" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 focus:ring-rose-500">
        Générer
      </Button>
      {!isApiKeyAvail && <p className="text-xs text-red-500 mt-1">{API_KEY_ERROR_MESSAGE}</p>}

      {isLoading && <Loader message={`Génération de ${generationType === 'name' ? 'noms' : 'concepts'}...`} />}
      <AIOutputDisplay 
        textToCopy={getResultsTextForCopy()} 
        onCopyStatus={onSetStatusMessage}
        fileNameGenerator={fileNameForDownload}
        minHeightClass="min-h-[100px]"
      >
        {results && results.length > 0 ? (
          <ul className="list-disc pl-5">
            {results.map((item, index) => (
              <li key={index} className="mb-1">{item}</li>
            ))}
          </ul>
        ) : (
          !isLoading && <p className="italic">Les suggestions apparaîtront ici.</p>
        )}
      </AIOutputDisplay>
    </AIToolSection>
  );
};

export default NameConceptGenerator;

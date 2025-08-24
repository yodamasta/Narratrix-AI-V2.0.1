
import React, { useState } from 'react';
import { BibleData } from '../../../types';
import { AIToolSection, AIOutputDisplay, CharacterOption, getCharacterOptions } from './common';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { generateText, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';

interface EmotionSparkToolProps {
  bibleData: BibleData | null;
  characterOptions: CharacterOption[]; 
  onSetStatusMessage: (message: string, isError?: boolean) => void;
  onBack: () => void; 
}

const emotions = [
  { value: 'humour_general', label: 'Humour (Général)' },
  { value: 'humour_ironique', label: 'Humour (Ironique)' },
  { value: 'humour_absurde', label: 'Humour (Absurde)' },
  { value: 'humour_situation', label: 'Humour (de Situation)' },
  { value: 'tension', label: 'Tension / Suspense' },
  { value: 'tristesse', label: 'Tristesse / Mélancolie' },
  { value: 'joie', label: 'Joie / Euphorie' },
  { value: 'surprise', label: 'Surprise / Stupéfaction' },
  { value: 'peur', label: 'Peur / Angoisse' },
  { value: 'colere', label: 'Colère / Frustration' },
  { value: 'romance', label: 'Romance / Tendresse' },
  { value: 'gene', label: 'Gêne / Embarras' },
  { value: 'nostalgie', label: 'Nostalgie' },
  { value: 'espoir', label: 'Espoir / Optimisme' },
  { value: 'desespoir', label: 'Désespoir / Pessimisme' },
  { value: 'curiosite', label: 'Curiosité / Intrigue' },
];

const intensities = [
  { value: 'subtile', label: 'Subtile' },
  { value: 'moderee', label: 'Modérée' },
  { value: 'forte', label: 'Forte' },
];

const EmotionSparkTool: React.FC<EmotionSparkToolProps> = ({ 
    bibleData,
    characterOptions,
    onSetStatusMessage, 
    onBack 
}) => {
  const [sceneText, setSceneText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>(emotions[0].value);
  const [selectedIntensity, setSelectedIntensity] = useState<string>(intensities[1].value);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(''); 
  
  const [generatedSuggestionsHtml, setGeneratedSuggestionsHtml] = useState<string | null>(null);
  const [rawSuggestionsText, setRawSuggestionsText] = useState<string|null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const actualCharacterOptions = [{ value: '', label: 'Perspective (Optionnel)' }, ...characterOptions.filter(opt => opt.value !== '')];

  const formatAIResponseToHtml = (rawAiText: string): string => {
    let htmlOutput = '';
    const lines = rawAiText.split('\n');
    let inList = false;
  
    function processLineContent(lineText: string): string {
      return lineText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
        .replace(/\*(.*?)\*/g, '<em>$1</em>');        
    }
  
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      const h3Match = trimmedLine.match(/^###\s+(.*)/);
      if (h3Match) {
        if (inList) { htmlOutput += '</ul>'; inList = false; }
        htmlOutput += `<h3 class="text-md font-semibold mt-3 mb-1 text-rose-700">${processLineContent(h3Match[1].trim())}</h3>`;
        return;
      }
       const h4Match = trimmedLine.match(/^####\s+(.*)/);
       if (h4Match) {
        if (inList) { htmlOutput += '</ul>'; inList = false; }
        htmlOutput += `<h4 class="text-sm font-semibold mt-2 mb-1 text-rose-600">${processLineContent(h4Match[1].trim())}</h4>`;
        return;
      }
  
      const listItemMatch = trimmedLine.match(/^[\*\-]\s+(.*)/);
      if (listItemMatch) {
        if (!inList) {
          htmlOutput += '<ul class="list-disc pl-5 mb-2 text-xs">';
          inList = true;
        }
        htmlOutput += `<li class="mb-0.5">${processLineContent(listItemMatch[1].trim())}</li>`;
        return;
      }
  
      if (inList && trimmedLine === '') { 
        htmlOutput += '</ul>';
        inList = false;
      }
      
      if (trimmedLine !== '') {
        if (inList) { 
             htmlOutput += '</ul>'; inList = false;
        }
        htmlOutput += `<p class="mb-1 text-xs">${processLineContent(trimmedLine)}</p>`;
      }
    });
  
    if (inList) { htmlOutput += '</ul>'; }
    return htmlOutput;
  };

  const handleGenerateSuggestions = async () => {
    if (!bibleData) {
      onSetStatusMessage("Chargez une Bible pour utiliser cet outil.", true);
      return;
    }
    if (!isApiKeyAvail) {
        onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
        return;
    }
    if (!sceneText.trim()) {
      onSetStatusMessage("Veuillez fournir une scène ou un dialogue.", true);
      return;
    }

    setIsLoading(true);
    setGeneratedSuggestionsHtml(null);
    setRawSuggestionsText(null);
    onSetStatusMessage("Génération des étincelles émotionnelles...", false);

    const charPerspective = selectedCharacterId ? characterOptions.find(c => c.value === selectedCharacterId)?.label : null;
    
    let bibleContext = `Contexte de l'univers: Titre: ${bibleData.projectInfo.title}. Pitch: ${bibleData.pitchSection.pitchGlobal}. Ambiance: ${bibleData.pitchSection.ambianceSpecifique}.`;
    if (bibleData.themesSection?.themesPrincipaux && bibleData.themesSection.themesPrincipaux.length > 0) {
      bibleContext += ` Thèmes principaux: ${bibleData.themesSection.themesPrincipaux.map(t => t.theme).join(', ')}.`;
    }

    const prompt = `
${bibleContext}
${charPerspective ? `Perspective du personnage: ${charPerspective}. (Prendre en compte sa psychologie si fournie dans la Bible).` : ''}

Scène / Dialogue original:
---
${sceneText}
---

Émotion Cible: ${emotions.find(e => e.value === selectedEmotion)?.label || selectedEmotion}
Intensité Souhaitée: ${intensities.find(i => i.value === selectedIntensity)?.label || selectedIntensity}

Instructions pour l'IA:
Tu es un coach d'écriture créative, expert en manipulation des émotions narratives.
Analyse la scène/dialogue fourni.
Propose 2-3 modifications distinctes et concrètes pour injecter ou amplifier l'émotion cible avec l'intensité souhaitée.
Tes suggestions doivent être spécifiques et directement applicables. Format simple et direct.
Pour chaque suggestion, utilise le format suivant (exemple):
### Suggestion 1: Titre de la suggestion
#### Type d'émotion (si applicable, e.g. Humour Ironique)
[Description de la modification : dialogue modifié, action, détail visuel, etc. Précise où l'insérer.]
*Explication:* [Pourquoi cette suggestion fonctionne pour l'émotion et l'intensité ciblées.]

Si tu modifies un dialogue, indique clairement la ligne originale et la ligne modifiée :
- Ligne Originale: "..."
- Ligne Modifiée: "..."
Commence directement par la première suggestion (### Suggestion 1: ...).`;

    const systemInstruction = "Tu es un coach en écriture créative spécialisé dans l'art de susciter des émotions. Sois concis et direct.";

    try {
      const suggestionsText = await generateText(prompt, systemInstruction);
      setRawSuggestionsText(suggestionsText);
      setGeneratedSuggestionsHtml(formatAIResponseToHtml(suggestionsText));
      onSetStatusMessage("Suggestions émotionnelles générées !", false);
    } catch (error: any) {
      console.error("Erreur Étincelle d'Émotions:", error);
      onSetStatusMessage(`Erreur Étincelle d'Émotions: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const fileNameForDownload = () => {
    const emotionLabel = emotions.find(e => e.value === selectedEmotion)?.label.replace(/\s/g, '_').replace(/[^a-z0-9_]/gi, '') || 'emotion';
    return `suggestions_emotion_${emotionLabel}.txt`;
  };

  return (
    <AIToolSection title="Étincelle d'Émotions ✨🎭" onBack={onBack}>
      <p className="text-sm text-slate-600 mb-4">
        Décrivez une scène ou collez un dialogue. Choisissez une émotion et une intensité. L'IA proposera des manières de l'injecter ou de la moduler.
      </p>
      
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="emotionSceneText" className="block text-sm font-medium text-slate-700 mb-1">Scène / Dialogue :</label>
          <textarea
            id="emotionSceneText"
            value={sceneText}
            onChange={(e) => setSceneText(e.target.value)}
            placeholder="Collez votre texte ici..."
            rows={5}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-700 bg-white disabled:opacity-60"
            disabled={isLoading || !isApiKeyAvail}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="selectedEmotion" className="block text-sm font-medium text-slate-700 mb-1">Émotion Cible:</label>
            <select 
              id="selectedEmotion" 
              value={selectedEmotion} 
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-700 bg-white disabled:opacity-60"
              disabled={isLoading || !isApiKeyAvail}
            >
              {emotions.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="selectedIntensity" className="block text-sm font-medium text-slate-700 mb-1">Intensité:</label>
            <select 
              id="selectedIntensity" 
              value={selectedIntensity} 
              onChange={(e) => setSelectedIntensity(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-700 bg-white disabled:opacity-60"
              disabled={isLoading || !isApiKeyAvail}
            >
              {intensities.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="selectedCharacterPerspective" className="block text-sm font-medium text-slate-700 mb-1">Perspective Personnage (Optionnel):</label>
            <select 
              id="selectedCharacterPerspective" 
              value={selectedCharacterId} 
              onChange={(e) => setSelectedCharacterId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-700 bg-white disabled:opacity-60"
              disabled={isLoading || !isApiKeyAvail || actualCharacterOptions.length <= 1}
            >
              {actualCharacterOptions.map(opt => <option key={`emo-char-${opt.value}`} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      <Button onClick={handleGenerateSuggestions} isLoading={isLoading} disabled={isLoading || !bibleData || !isApiKeyAvail} icon="flare" variant="primary" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 focus:ring-rose-500">
        Générer Suggestions
      </Button>
      {!isApiKeyAvail && <p className="text-xs text-red-500 mt-1">{API_KEY_ERROR_MESSAGE}</p>}

      {isLoading && <Loader message="L'IA cherche l'inspiration émotionnelle..." />}
      
      <AIOutputDisplay 
        minHeightClass="min-h-[200px]"
        textToCopy={rawSuggestionsText} 
        onCopyStatus={onSetStatusMessage}
        fileNameGenerator={fileNameForDownload}
      >
        {generatedSuggestionsHtml ? (
          <div dangerouslySetInnerHTML={{ __html: generatedSuggestionsHtml }} className="text-left prose prose-sm max-w-none prose-headings:text-rose-700 prose-strong:text-slate-800" />
        ) : (
          !isLoading && <p className="italic text-center">Les suggestions pour moduler les émotions apparaîtront ici.</p>
        )}
      </AIOutputDisplay>
    </AIToolSection>
  );
};

export default EmotionSparkTool;

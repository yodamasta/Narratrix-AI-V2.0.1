import React, { useState } from 'react';
import { BibleData } from '../../../types';
import { AIToolSection, AIOutputDisplay } from './common';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { generateText, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';

interface ConceptDeveloperProps {
  bibleData: BibleData | null;
  onSetStatusMessage: (message: string, isError?: boolean) => void;
  onBack?: () => void; 
}

const ConceptDeveloper: React.FC<ConceptDeveloperProps> = ({ bibleData, onSetStatusMessage, onBack }) => {
  const [conceptInput, setConceptInput] = useState('');
  const [developedConceptHtml, setDevelopedConceptHtml] = useState<string | null>(null);
  const [rawDevelopedConceptText, setRawDevelopedConceptText] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const formatAIResponseToHtml = (rawAiText: string): string => {
    let htmlOutput = '';
    const lines = rawAiText.split('\n');
    let inList = false;

    function processLineContent(lineText: string): string {
      // Use Tailwind classes for headings if possible, or ensure they inherit from dark:prose-invert
      return lineText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
        .replace(/\*(.*?)\*/g, '<em>$1</em>');         
    }

    lines.forEach(line => {
      const trimmedLine = line.trim();
      const h3Match = trimmedLine.match(/^###\s+(.*)/); // For titles like "### Détails et Fonctionnement :"
      const h4Match = trimmedLine.match(/^####\s+(.*)/); // For sub-titles if AI uses them

      if (h3Match) {
        if (inList) { htmlOutput += '</ul>'; inList = false; }
        // Rely on prose styles for h3, or add specific dark mode classes if needed
        htmlOutput += `<h3 class="text-lg font-semibold mt-4 mb-2">${processLineContent(h3Match[1].trim())}</h3>`;
        return;
      }
      if (h4Match) {
        if (inList) { htmlOutput += '</ul>'; inList = false; }
        htmlOutput += `<h4 class="text-md font-semibold mt-3 mb-1">${processLineContent(h4Match[1].trim())}</h4>`;
        return;
      }

      const listItemMatch = trimmedLine.match(/^[\*\-]\s+(.*)/);
      if (listItemMatch) {
        if (!inList) {
          htmlOutput += '<ul class="list-disc pl-5 mb-3">';
          inList = true;
        }
        htmlOutput += `<li class="mb-1">${processLineContent(listItemMatch[1].trim())}</li>`;
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
        // Paragraphs will inherit from prose styles
        htmlOutput += `<p class="mb-2">${processLineContent(trimmedLine)}</p>`;
      }
    });

    if (inList) { htmlOutput += '</ul>'; } 
    return htmlOutput;
  };


  const handleDevelopConcept = async () => {
    if (!bibleData) {
      onSetStatusMessage("Chargez une Bible pour utiliser cet outil.", true);
      return;
    }
     if (!isApiKeyAvail) {
        onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
        return;
    }
    if (!conceptInput.trim()) {
      onSetStatusMessage("Veuillez entrer un concept à développer.", true);
      return;
    }

    setIsLoading(true);
    setDevelopedConceptHtml(null);
    setRawDevelopedConceptText(null);
    onSetStatusMessage("Développement du concept en cours...", false);

    const elementsUniquesSample = bibleData.universSection?.elementsUniques?.slice(0, 2).map(e => e.nom).join(', ') || 'N/A';
    const prompt = `
Contexte général de l'univers:
Titre du projet: ${bibleData.projectInfo?.title || 'N/A'}
Pitch global: ${bibleData.pitchSection?.pitchGlobal || 'N/A'}
Ambiance spécifique: ${bibleData.pitchSection?.ambianceSpecifique || 'N/A'}
Genre principal: ${bibleData.pitchSection?.positionnement?.type || 'N/A'}
Éléments uniques déjà définis (liste indicative): ${elementsUniquesSample}

Concept brut à développer:
"${conceptInput}"

Instructions pour l'IA:
Tu es un assistant de world-building. Pour le concept brut fourni, développe-le en fournissant des idées structurées et détaillées. Organise ta réponse avec les sections suivantes, en utilisant des titres clairs (par exemple, "### Titre de Section") :
1.  **### Détails et Fonctionnement :** Décris plus en détail le concept. Comment fonctionne-t-il ? Quelle est son apparence ? Son origine possible ? Ses caractéristiques notables ?
2.  **### Implications :** Quelles sont les conséquences (sociales, culturelles, technologiques, magiques, environnementales, individuelles) de l'existence de ce concept dans cet univers ?
3.  **### Conflits et Mystères Potentiels :** Quels types de conflits, de tensions, d'enjeux narratifs, ou de mystères pourraient émerger de ce concept ? Qui pourrait le convoiter, le craindre, l'étudier, en abuser ?
4.  **### Questions d'Approfondissement :** Propose 3-4 questions clés, ouvertes et stimulantes, que l'auteur pourrait se poser pour explorer ce concept encore plus loin.

Sois créatif et essaie de fournir des pistes concrètes et inspirantes. Maintiens un ton neutre et informatif.
Évite les introductions comme "Voici le développement de votre concept :". Commence directement par la première section (### Détails et Fonctionnement).
Utilise des retours à la ligne pour séparer les idées et les paragraphes au sein de chaque section pour une meilleure lisibilité. Utilise '*' pour les listes à puces si nécessaire. Utilise '**texte en gras**' pour le gras et '*texte en italique*' pour l'italique.`;

    const systemInstruction = "Tu es un expert en world-building qui aide à étoffer des concepts pour des univers fictifs.";

    try {
      const conceptText = await generateText(prompt, systemInstruction);
      setRawDevelopedConceptText(conceptText); 
      setDevelopedConceptHtml(formatAIResponseToHtml(conceptText)); 
      onSetStatusMessage("Concept développé avec succès !", false);
    } catch (error: any) {
      console.error("Erreur développement concept:", error);
      onSetStatusMessage(`Erreur concept: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const fileNameForDownload = () => {
    const conceptSnippet = conceptInput.substring(0, 20).replace(/\s/g, '_').replace(/[^a-z0-9_]/gi, '') || 'concept';
    return `concept_${conceptSnippet}.txt`;
  };
  
  const textAreaClasses = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 mb-4 disabled:opacity-60 dark:disabled:bg-slate-700/50";

  return (
    <AIToolSection title="Développeur de Concepts 💡🌍" onBack={onBack}>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Entrez un concept brut de votre univers. L'IA vous aidera à générer des détails, des implications et des questions pour l'approfondir.</p>
      <label htmlFor="conceptDevInput" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Concept à développer :</label>
      <textarea
        id="conceptDevInput"
        value={conceptInput}
        onChange={(e) => setConceptInput(e.target.value)}
        placeholder="Ex: Une épice rare qui décuple les capacités psioniques mais réduit l'espérance de vie..."
        rows={3} 
        className={textAreaClasses} 
        disabled={isLoading || !isApiKeyAvail}
      />
      <Button onClick={handleDevelopConcept} isLoading={isLoading} disabled={isLoading || !bibleData || !isApiKeyAvail} icon="emoji_objects" variant="primary" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 focus:ring-teal-500 dark:focus:ring-teal-400"> 
        Développer le Concept
      </Button>
      {!isApiKeyAvail && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{API_KEY_ERROR_MESSAGE}</p>}


      {isLoading && <Loader message="Développement du concept..." />}
      <AIOutputDisplay 
        textToCopy={rawDevelopedConceptText} 
        onCopyStatus={onSetStatusMessage}
        fileNameGenerator={fileNameForDownload}
        minHeightClass="min-h-[250px]"
      >
        {developedConceptHtml ? (
          <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: developedConceptHtml }} />
        ) : (
          !isLoading && <p className="italic text-center">Le concept développé apparaîtra ici.</p>
        )}
      </AIOutputDisplay>
    </AIToolSection>
  );
};

export default ConceptDeveloper;
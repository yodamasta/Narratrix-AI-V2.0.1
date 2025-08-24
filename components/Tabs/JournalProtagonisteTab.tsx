import React, { useState } from 'react';
import { JournalProtagonisteSection as JournalProtagonisteSectionType, BibleData } from '../../types';
import { SectionTitle, Paragraph, renderSectionShell, createDefaultMessage } from './TabContentUtils';
import Button from '../UI/Button';
import Loader from '../UI/Loader';
import { generateText, isGeminiApiKeyAvailable } from '../../services/geminiService';
import { API_KEY_ERROR_MESSAGE, getCopyrightNotice } from '../../constants'; 
import { copyTextToClipboard } from '../../services/bibleUtils'; 

interface JournalProtagonisteTabProps {
  data?: JournalProtagonisteSectionType;
  bibleData: BibleData | null; 
  bibleTitle?: string;
  onSetStatusMessageGlobal: (message: string, isError?: boolean) => void; 
}

const JournalProtagonisteTab: React.FC<JournalProtagonisteTabProps> = ({ data, bibleData, bibleTitle, onSetStatusMessageGlobal }) => {
  const [journalEntries, setJournalEntries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const protagonistName = bibleData?.personnagesSection?.heros?.nomComplet || "Le Protagoniste";
  const protagonistFirstName = bibleData?.personnagesSection?.heros?.nom?.split(' ')[0] || "Le Protagoniste";

  const handleGenerateEntry = async () => {
    if (!bibleData) {
      setError("Les données de la Bible sont nécessaires pour générer une entrée.");
      return;
    }
    if (!isGeminiApiKeyAvailable()) {
      setError(API_KEY_ERROR_MESSAGE);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { pitchSection, personnagesSection, structureSaisonSection } = bibleData;
    let bibleContext = `Contexte: ${pitchSection?.pitchGlobal || 'Non défini'}. `;
    const heros = personnagesSection?.heros;
    if (heros) {
      bibleContext += `Protagoniste (${heros.nomComplet}): ${heros.psychologieMotivation || 'N/A'} Arc: ${heros.arc || 'N/A'}. `;
    }
    if (pitchSection?.ambianceSpecifique) {
      bibleContext += `Ambiance: ${pitchSection.ambianceSpecifique}. `;
    }
    let currentNarrativePoint = "début de l'histoire";
    if (structureSaisonSection?.arcsMajeursSaison1?.[0]?.acte) {
      currentNarrativePoint = structureSaisonSection.arcsMajeursSaison1[0].acte;
    } else if (structureSaisonSection?.episodesSaison1?.[0]?.titreProvisoire) {
      currentNarrativePoint = `épisode "${structureSaisonSection.episodesSaison1[0].titreProvisoire}"`;
    }
    bibleContext += `Situation actuelle: vers ${currentNarrativePoint}.`;

    const prompt = `Contexte: ${bibleContext}\n\nTu es ${protagonistName}. Écris une courte entrée de journal intime (environ 80-120 mots).\nExprime une pensée actuelle, une peur, une observation pertinente, ou un souvenir marquant.\nLe ton doit être introspectif et cohérent avec ta psychologie et l'ambiance générale de l'univers.\nUne date fictive (ex: "Jour Xylosien 34.Cycle Gamma" ou "17ème lune de Brumevent") peut être ajoutée au début si cela semble naturel et correspond à l'univers, sinon, commence directement l'entrée.\nNe commence pas par "Cher journal" ou des salutations similaires.`;
    
    const systemInstruction = `Tu incarnes ${protagonistName}, le protagoniste de cette histoire. Ta réponse doit être sous forme d'une entrée de journal intime.`;

    try {
      const entry = await generateText(prompt, systemInstruction);
      setJournalEntries(prev => [entry, ...prev]);
      onSetStatusMessageGlobal("Nouvelle entrée de journal générée !", false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la génération de l'entrée de journal.");
      onSetStatusMessageGlobal(err.message || "Erreur lors de la génération de l'entrée de journal.", true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEntry = (textToCopy: string) => {
    copyTextToClipboard(textToCopy)
      .then(() => onSetStatusMessageGlobal("Entrée de journal copiée !", false))
      .catch(() => onSetStatusMessageGlobal("Erreur lors de la copie de l'entrée.", true));
  };

  const handleDownloadEntry = (textToCopy: string, entryIndex: number) => {
    try {
        const fullContentToDownload = textToCopy + getCopyrightNotice(); 
        const blob = new Blob([fullContentToDownload], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeCharName = protagonistFirstName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `journal_${safeCharName}_entree_${journalEntries.length - entryIndex}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        onSetStatusMessageGlobal("Entrée de journal téléchargée !", false);
      } catch (error) {
        console.error("Error downloading journal entry:", error);
        onSetStatusMessageGlobal("Erreur lors du téléchargement de l'entrée.", true);
      }
  };

  return renderSectionShell(
    "journal_protagoniste",
    data, 
    data?.titre || `Journal de ${protagonistFirstName}`,
    "📖",
    bibleTitle,
    "Configuration du journal non disponible.",
    <>
      <Paragraph content={data?.introduction || `Pensées intimes de ${protagonistName}.`} />
      <div className="my-6 text-center">
        <Button 
            onClick={handleGenerateEntry} 
            isLoading={isLoading}
            disabled={isLoading || !bibleData || !isGeminiApiKeyAvailable()}
            variant="primary"
            icon="auto_stories"
        >
          Nouvelle entrée au journal
        </Button>
        {!isGeminiApiKeyAvailable() && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{API_KEY_ERROR_MESSAGE}</p>}
      </div>

      {isLoading && <Loader message={`${protagonistFirstName} réfléchit...`} />}
      {error && <p className="text-red-600 dark:text-red-400 text-center my-4">{error}</p>}

      <div className="mt-6 space-y-6">
        {journalEntries.length === 0 && !isLoading && (
          createDefaultMessage(`Cliquez pour que ${protagonistFirstName} écrive sa première pensée ici...`)
        )}
        {journalEntries.map((entry, index) => (
          <div key={index} className="bg-purple-50 dark:bg-purple-900/50 border-l-4 border-purple-500 dark:border-purple-400 p-4 rounded-r-md shadow animate-fadeIn relative">
            <span className="block text-xs text-purple-600 dark:text-purple-300 mb-2 font-medium">
              Entrée {journalEntries.length - index} (Générée le: {new Date().toLocaleDateString('fr-FR')})
            </span>
            <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                <button
                    onClick={() => handleCopyEntry(entry)}
                    title="Copier l'entrée"
                    className="bg-purple-400 hover:bg-purple-500 text-white p-1.5 rounded-full text-xs"
                >
                    <span className="material-icons-outlined text-sm leading-none">content_copy</span>
                </button>
                <button
                    onClick={() => handleDownloadEntry(entry, index)}
                    title="Télécharger l'entrée"
                    className="bg-emerald-400 hover:bg-emerald-500 text-white p-1.5 rounded-full text-xs"
                >
                    <span className="material-icons-outlined text-sm leading-none">download</span>
                </button>
            </div>
            <Paragraph content={entry} className="text-sm text-purple-800 dark:text-purple-200 italic leading-relaxed pr-8" />
          </div>
        ))}
      </div>
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        `}
      </style>
    </>
  );
};

export default JournalProtagonisteTab;
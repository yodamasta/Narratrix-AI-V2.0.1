import React from 'react';
import { BibleData } from '../../../types';
import { getCharacterByName, copyTextToClipboard } from '../../../services/bibleUtils';
import { getCopyrightNotice } from '../../../constants'; 

export interface CharacterOption {
  value: string;
  label: string;
  promptDescription?: string;
}

export const getCharacterOptions = (personnagesData?: BibleData['personnagesSection']): CharacterOption[] => {
  const options: CharacterOption[] = [{ value: '', label: 'Personnage (optionnel)' }];
  if (!personnagesData) return options;

  if (personnagesData.heros?.nomComplet) {
    options.push({
        value: personnagesData.heros.nomComplet,
        label: personnagesData.heros.nomComplet,
        promptDescription: personnagesData.heros.promptDescription
    });
  } else if (personnagesData.heros?.nom) { 
     options.push({
        value: personnagesData.heros.nom,
        label: personnagesData.heros.nom,
        promptDescription: personnagesData.heros.promptDescription
    });
  }

  personnagesData.personnagesPrincipaux?.forEach(p => {
    if (p.nom) {
      options.push({
          value: p.nom,
          label: p.nom,
          promptDescription: p.promptDescription
        });
    } else if (p.nomComplet) { 
         options.push({
          value: p.nomComplet,
          label: p.nomComplet,
          promptDescription: p.promptDescription
        });
    }
  });
  
  const uniqueLabels = new Set();
  return options.filter(opt => {
      if (opt.value === '' || !uniqueLabels.has(opt.label)) {
          uniqueLabels.add(opt.label);
          return true;
      }
      return false;
  });
};


export interface AIToolSectionProps {
    title: string;
    children: React.ReactNode | React.ReactNode[];
    onBack?: () => void; 
}

export const AIToolSection: React.FC<AIToolSectionProps> = ({ title, children, onBack }) => {
  return React.createElement(
    'div',
    { className: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-6 mb-8" }, 
    onBack && React.createElement(
        'button',
        { 
            onClick: onBack, 
            className: "mb-6 text-sm text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-semibold flex items-center transition-colors"
        },
        React.createElement('span', {className: "material-icons-outlined mr-1 text-base"}, "arrow_back"),
        "Retour aux outils"
    ),
    React.createElement(
      'h3',
      { className: "text-2xl font-bold text-slate-800 dark:text-slate-100 mb-5 border-b-2 border-slate-300 dark:border-slate-600 pb-3" }, 
      title
    ),
    children
  );
};

export const AIPromptDisplay: React.FC<{ prompt: string, onCopy: () => void }> = ({ prompt, onCopy }) => {
  return React.createElement(
    'div',
    { className: "bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 rounded-md p-3 mt-4 text-xs text-indigo-700 dark:text-indigo-300 italic relative break-words" }, 
    React.createElement('strong', null, 'Prompt Final Utilisé:'),
    ` ${prompt}`,
    React.createElement(
      'button',
      {
        onClick: onCopy,
        title: "Copier le prompt",
        className: "absolute top-2 right-2 bg-indigo-400 dark:bg-indigo-600 hover:bg-indigo-500 dark:hover:bg-indigo-500 text-white p-1 rounded-full text-xs"
      },
      React.createElement(
        'span',
        { className: "material-icons-outlined text-sm leading-none" },
        'content_copy'
      )
    )
  );
};

export interface AIOutputDisplayProps {
    children: React.ReactNode;
    minHeightClass?: string;
    isTextCentered?: boolean;
    textToCopy?: string | null; 
    onCopyStatus?: (message: string, isError?: boolean) => void;
    fileNameGenerator?: () => string; 
}

export const AIOutputDisplay: React.FC<AIOutputDisplayProps> = ({ 
    children, 
    minHeightClass = 'min-h-[150px]', 
    isTextCentered = false,
    textToCopy,
    onCopyStatus,
    fileNameGenerator
}) => {
  const divClassName = `generated-text-result bg-slate-50 dark:bg-slate-700/50 border-l-4 border-violet-500 dark:border-violet-400 rounded-r-md shadow-inner p-4 mt-4 text-slate-700 dark:text-slate-200 text-sm relative ${minHeightClass} ${isTextCentered ? 'flex flex-col items-center justify-center text-center' : 'text-left'}`;
  
  const handleCopy = () => {
    if (textToCopy && onCopyStatus) {
      copyTextToClipboard(textToCopy)
        .then(() => onCopyStatus("Texte copié dans le presse-papiers !", false))
        .catch(() => onCopyStatus("Erreur lors de la copie du texte.", true));
    }
  };

  const handleDownload = () => {
    if (textToCopy && onCopyStatus) {
      try {
        const fullContentToDownload = textToCopy + getCopyrightNotice();
        const blob = new Blob([fullContentToDownload], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileNameGenerator ? fileNameGenerator() : 'ai_generated_text.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        onCopyStatus("Texte téléchargé avec succès !", false);
      } catch (error) {
        console.error("Error downloading text:", error);
        onCopyStatus("Erreur lors du téléchargement du texte.", true);
      }
    }
  };

  const actionButtons = (textToCopy && onCopyStatus) ? React.createElement(
    'div',
    { className: "absolute top-2 right-2 flex gap-1.5 z-10" }, 
    React.createElement(
      'button',
      {
        onClick: handleCopy,
        title: "Copier le texte généré",
        className: "bg-violet-400 dark:bg-violet-600 hover:bg-violet-500 dark:hover:bg-violet-500 text-white p-1.5 rounded-full text-xs"
      },
      React.createElement('span', { className: "material-icons-outlined text-sm leading-none" }, 'content_copy')
    ),
    React.createElement(
      'button',
      {
        onClick: handleDownload,
        title: "Télécharger le texte généré (.txt)",
        className: "bg-emerald-400 dark:bg-emerald-600 hover:bg-emerald-500 dark:hover:bg-emerald-500 text-white p-1.5 rounded-full text-xs"
      },
      React.createElement('span', { className: "material-icons-outlined text-sm leading-none" }, 'download')
    )
  ) : null;
  
  const contentWrapperClass = React.Children.toArray(children).some(child => typeof child === 'string' && child.includes('\n'))
    ? "whitespace-pre-wrap"
    : "";


  return React.createElement(
    'div',
    { className: divClassName },
    actionButtons,
    React.createElement('div', { className: contentWrapperClass}, children)
  );
};

export const buildCharacterContextForPrompt = (
    char1Name: string | undefined,
    char2Name: string | undefined,
    personnagesData?: BibleData['personnagesSection']
): string => {
    let context = "";
    const charsInScene: any[] = [];
    if (char1Name) {
        const char = getCharacterByName(char1Name, personnagesData);
        if (char) charsInScene.push(char);
    }
    if (char2Name && char2Name !== char1Name) {
        const char = getCharacterByName(char2Name, personnagesData);
        if (char) charsInScene.push(char);
    }

    if (charsInScene.length > 0) {
        context = `Personnages importants dans la scène (utiliser leurs descriptions canoniques si fournies): ${charsInScene.map(c =>
            `${c.nomComplet || c.nom}${ (c.nomComplet || c.nom) && c.promptDescription ? ` (Visuel: ${c.promptDescription})` : ''}`
        ).join('; ')}.`;
    } else {
        context = "Aucun personnage spécifique n'est mis en avant, mais des personnages de l'univers peuvent apparaître si pertinent pour la scène.";
    }
    return context;
};
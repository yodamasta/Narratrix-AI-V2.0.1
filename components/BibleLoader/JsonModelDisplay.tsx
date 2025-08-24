import React, { useState } from 'react';
import { COMPLETE_BLANK_BIBLE_STRUCTURE } from '../../constants';
import { copyTextToClipboard } from '../../services/bibleUtils';
import Button from '../UI/Button';

interface JsonModelDisplayProps {
    onCopySuccess: (message: string) => void;
    onCopyError: (message: string) => void;
}

const JsonModelDisplay: React.FC<JsonModelDisplayProps> = ({ onCopySuccess, onCopyError }) => {
  const [isModelVisible, setIsModelVisible] = useState(false);
  const jsonModelString = JSON.stringify(COMPLETE_BLANK_BIBLE_STRUCTURE, null, 2);

  const handleCopyModel = async () => {
    try {
      await copyTextToClipboard(jsonModelString);
      onCopySuccess("Modèle JSON copié dans le presse-papiers !");
    } catch (err) {
      onCopyError("Erreur lors de la copie du modèle JSON.");
    }
  };

  return (
    <div className="mb-4">
      <Button 
        onClick={() => setIsModelVisible(!isModelVisible)}
        variant="secondary" 
        icon="integration_instructions"
        className="w-full"
      >
        {isModelVisible ? 'Masquer' : 'Afficher'} le Modèle JSON de la Bible
      </Button>
      {isModelVisible && (
        <div className="mt-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
            Voici la structure de base pour votre fichier JSON. Copiez et adaptez-la.
          </p>
          <pre className="bg-slate-800 dark:bg-slate-900 text-slate-200 dark:text-slate-300 p-3 rounded-md overflow-x-auto text-xs max-h-60 scrollbar-thin scrollbar-thin-dark">
            {jsonModelString}
          </pre>
          <Button 
            onClick={handleCopyModel}
            variant="success"
            icon="content_copy"
            className="mt-3 w-full sm:w-auto"
            >
            Copier le Modèle
          </Button>
        </div>
      )}
    </div>
  );
};

export default JsonModelDisplay;
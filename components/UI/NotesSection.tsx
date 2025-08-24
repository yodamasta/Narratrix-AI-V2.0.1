import React, { useState, useEffect, useCallback } from 'react';
import { loadNote, saveNote, getNoteKey } from '../../services/localStorageService';
import Button from './Button';

interface NotesSectionProps {
  sectionId: string;
  bibleTitle: string | undefined;
}

const NotesSection: React.FC<NotesSectionProps> = ({ sectionId, bibleTitle }) => {
  const [noteContent, setNoteContent] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isBibleLoaded, setIsBibleLoaded] = useState<boolean>(false);

  const noteKey = getNoteKey(bibleTitle, sectionId);

  useEffect(() => {
    setIsBibleLoaded(!!bibleTitle && !!noteKey);
    if (noteKey) {
      setNoteContent(loadNote(noteKey));
    } else {
      setNoteContent(''); // Clear note if bible/key is not available
    }
  }, [noteKey, bibleTitle]);

  const handleSaveNote = useCallback(() => {
    if (!noteKey) {
      setFeedbackMessage("Erreur: Titre de la Bible non défini. Impossible de sauvegarder.");
      setIsError(true);
      return;
    }
    if (saveNote(noteKey, noteContent)) {
      setFeedbackMessage("Note sauvegardée avec succès !");
      setIsError(false);
    } else {
      setFeedbackMessage("Erreur: Impossible de sauvegarder la note (localStorage inaccessible ou plein).");
      setIsError(true);
    }
    setTimeout(() => setFeedbackMessage(''), 3000);
  }, [noteKey, noteContent]);

  return (
    <div className="mt-10 p-6 bg-teal-50 dark:bg-slate-800 border-t-2 border-teal-500 dark:border-teal-700 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-4 flex items-center">
        <span className="material-icons-outlined mr-2 text-teal-600 dark:text-teal-400">edit_note</span>
        Mes Notes Personnelles pour cette Section
      </h4>
      <textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder={isBibleLoaded ? "Écrivez vos notes ici...\nElles sont sauvegardées localement dans votre navigateur pour cette Bible et cette section." : "Chargez une Bible pour activer les notes pour cette section."}
        rows={5}
        className="w-full p-3 border border-teal-300 dark:border-slate-600 rounded-md text-sm text-teal-800 dark:text-slate-200 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 disabled:bg-slate-100 dark:disabled:bg-slate-600 disabled:text-slate-400 dark:disabled:text-slate-500"
        disabled={!isBibleLoaded}
      />
      <Button
        onClick={handleSaveNote}
        disabled={!isBibleLoaded}
        icon="save"
        variant="primary"
        className="mt-4"
      >
        Sauvegarder la Note
      </Button>
      {feedbackMessage && (
        <p className={`mt-2 text-xs ${isError ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {feedbackMessage}
        </p>
      )}
    </div>
  );
};

export default NotesSection;
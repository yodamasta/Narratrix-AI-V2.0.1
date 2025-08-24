
import React, { useState } from 'react';
import { BibleData, CharacterArcStep, CharacterArcData } from '../../../types';
import { CharacterOption, AIToolSection, AIOutputDisplay, getCharacterOptions } from './common';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { generateCharacterArc, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';

interface CharacterArcDeveloperProps {
  bibleData: BibleData | null;
  characterOptions: CharacterOption[]; 
  onSetStatusMessage: (message: string, isError?: boolean) => void;
  onBack: () => void; 
}

const CharacterArcDeveloper: React.FC<CharacterArcDeveloperProps> = ({ 
    bibleData, 
    characterOptions, 
    onSetStatusMessage,
    onBack 
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [startPoint, setStartPoint] = useState('');
  const [endGoal, setEndGoal] = useState('');
  const [numSteps, setNumSteps] = useState<number>(5);
  const [arcData, setArcData] = useState<CharacterArcData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const actualCharacterOptions = [{ value: '', label: 'Choisir personnage...' }, ...characterOptions.filter(opt => opt.value !== '')];

  const handleGenerateArc = async () => {
    if (!bibleData) {
      onSetStatusMessage("Chargez une Bible pour utiliser cet outil.", true);
      return;
    }
    if (!isApiKeyAvail) {
      onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
      return;
    }
    if (!selectedCharacter) {
      onSetStatusMessage("Veuillez sélectionner un personnage.", true);
      return;
    }
    if (!startPoint.trim()) {
      onSetStatusMessage("Veuillez décrire le point de départ du personnage.", true);
      return;
    }
    if (numSteps <= 0 || numSteps > 10) {
      onSetStatusMessage("Veuillez choisir un nombre d'étapes entre 1 et 10.", true);
      return;
    }

    setIsLoading(true);
    setArcData(null);
    onSetStatusMessage("Génération de l'arc du personnage...", false);

    try {
      const steps = await generateCharacterArc(
        bibleData,
        selectedCharacter,
        startPoint,
        endGoal || undefined,
        numSteps
      );
      setArcData({
        characterName: selectedCharacter,
        startPoint,
        endGoal: endGoal || undefined,
        steps,
      });
      onSetStatusMessage("Arc de personnage généré avec succès !", false);
    } catch (error: any) {
      console.error("Erreur génération arc personnage:", error);
      onSetStatusMessage(`Erreur arc personnage: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const getArcTextForCopy = (): string | null => {
    if (!arcData) return null;
    let text = `Arc pour ${arcData.characterName}:\n`;
    text += `Point de départ: ${arcData.startPoint}\n`;
    if (arcData.endGoal) text += `Objectif final: ${arcData.endGoal}\n\n`;
    arcData.steps.forEach((step, index) => {
      text += `Étape ${index + 1}: ${step.stepTitle}\n`;
      text += `  Description: ${step.description}\n`;
      if (step.internalConflict) text += `  Conflit Interne: ${step.internalConflict}\n`;
      if (step.externalChallenge) text += `  Défi Externe: ${step.externalChallenge}\n`;
      if (step.realization) text += `  Prise de Conscience: ${step.realization}\n`;
      text += '\n';
    });
    return text;
  };

  const fileNameForDownload = () => {
    const charName = selectedCharacter.replace(/\s/g, '_').replace(/[^a-z0-9_]/gi, '') || 'personnage';
    return `arc_${charName}.txt`;
  };

  return (
    <AIToolSection title="Développeur d'Arc de Personnage 🌱📈">
      <button onClick={onBack} className="mb-4 text-sm text-teal-600 hover:text-teal-800 font-semibold">&larr; Retour aux outils</button>
      <p className="text-sm text-slate-600 mb-4">Définissez un personnage, son point de départ, et l'IA proposera des étapes clés pour son évolution.</p>
      
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="charArcSelect" className="block text-sm font-medium text-slate-700 mb-1">Personnage:</label>
          <select 
            id="charArcSelect" 
            value={selectedCharacter} 
            onChange={(e) => setSelectedCharacter(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 bg-white disabled:opacity-60"
            disabled={isLoading || !isApiKeyAvail || actualCharacterOptions.length <= 1}
          >
            {actualCharacterOptions.map(opt => <option key={`cad-${opt.value}`} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="startPointInput" className="block text-sm font-medium text-slate-700 mb-1">Point de Départ:</label>
          <textarea
            id="startPointInput"
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            placeholder="Ex: Timide et effrayé par le conflit, vit une vie simple..."
            rows={3}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 bg-white disabled:opacity-60"
            disabled={isLoading || !isApiKeyAvail}
          />
        </div>
        <div>
          <label htmlFor="endGoalInput" className="block text-sm font-medium text-slate-700 mb-1">Objectif / État Final (Optionnel):</label>
          <textarea
            id="endGoalInput"
            value={endGoal}
            onChange={(e) => setEndGoal(e.target.value)}
            placeholder="Ex: Devient un leader confiant et respecté, capable de défendre ses convictions..."
            rows={3}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 bg-white disabled:opacity-60"
            disabled={isLoading || !isApiKeyAvail}
          />
        </div>
        <div>
            <label htmlFor="numStepsInput" className="block text-sm font-medium text-slate-700 mb-1">Nombre d'Étapes (1-10):</label>
            <input
                type="number"
                id="numStepsInput"
                value={numSteps}
                onChange={(e) => setNumSteps(parseInt(e.target.value, 10))}
                min="1"
                max="10"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 bg-white disabled:opacity-60"
                disabled={isLoading || !isApiKeyAvail}
            />
        </div>
      </div>
      
      <Button onClick={handleGenerateArc} isLoading={isLoading} disabled={isLoading || !bibleData || !isApiKeyAvail} icon="trending_up" variant="primary" className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 focus:ring-sky-500">
        Générer l'Arc Narratif
      </Button>
      {!isApiKeyAvail && <p className="text-xs text-red-500 mt-1">{API_KEY_ERROR_MESSAGE}</p>}

      {isLoading && <Loader message={`Génération de l'arc pour ${selectedCharacter || 'le personnage'}...`} />}
      
      <AIOutputDisplay 
        minHeightClass="min-h-[200px]"
        textToCopy={getArcTextForCopy()}
        onCopyStatus={onSetStatusMessage}
        fileNameGenerator={fileNameForDownload}
      >
        {arcData ? (
          <div className="text-left">
            <h4 className="text-md font-semibold text-slate-700 mt-2 mb-2">Arc pour {arcData.characterName}:</h4>
            {arcData.steps.map((step, index) => (
              <div key={index} className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-md shadow-sm">
                <strong className="block text-sm font-semibold text-sky-700">{index + 1}. {step.stepTitle}</strong>
                <p className="text-xs text-slate-600 my-1">{step.description}</p>
                {step.internalConflict && <p className="text-xs text-slate-500"><em>Conflit Interne:</em> {step.internalConflict}</p>}
                {step.externalChallenge && <p className="text-xs text-slate-500"><em>Défi Externe:</em> {step.externalChallenge}</p>}
                {step.realization && <p className="text-xs text-slate-500"><em>Prise de Conscience:</em> {step.realization}</p>}
              </div>
            ))}
          </div>
        ) : (
          !isLoading && <p className="italic text-center">L'arc narratif généré apparaîtra ici.</p>
        )}
      </AIOutputDisplay>
    </AIToolSection>
  );
};

export default CharacterArcDeveloper;


import React, { useState } from 'react';
import { ScriptAnalysis } from '../../../types';
import { AIToolSection, AIOutputDisplay } from './common';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { analyzeScriptAndExtractPrecepts, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';

interface ScriptAnalyzerProps {
  onSetStatusMessage: (message: string, isError?: boolean) => void;
  onBack?: () => void; 
}

const ScriptAnalyzer: React.FC<ScriptAnalyzerProps> = ({ onSetStatusMessage, onBack }) => {
  const [scriptText, setScriptText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ScriptAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const handleAnalyzeScript = async () => {
    if (!isApiKeyAvail) {
        onSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
        return;
    }
    if (!scriptText.trim()) {
      onSetStatusMessage("Veuillez coller un script ou un texte de scénario.", true);
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    onSetStatusMessage("Analyse du script en cours...", false);

    try {
      const result = await analyzeScriptAndExtractPrecepts(scriptText);
      setAnalysisResult(result);
      onSetStatusMessage("Analyse du script terminée !", false);
    } catch (error: any) {
      console.error("Erreur analyse script:", error);
      onSetStatusMessage(`Erreur analyse script: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnalysisTextForCopy = (): string | null => {
    if (!analysisResult) return null;
    let text = `Résumé:\n${analysisResult.summary}\n\nPréceptes Clés:\n`;
    analysisResult.precepts.forEach(precept => {
      text += `- ${precept.title}: ${precept.description}\n`;
    });
    return text;
  };
  
  const fileNameForDownload = () => {
    return `analyse_script_${new Date().toISOString().split('T')[0]}.txt`;
  };

  return (
    <AIToolSection title="Analyseur de Script 📜" onBack={onBack}>
      <p className="text-sm text-slate-600 mb-4">Collez un texte de scénario (ou une partie). L'IA en extraira un résumé et les préceptes clés (règles, thèmes).</p>
      
      <label htmlFor="scriptInput" className="block text-sm font-medium text-slate-700 mb-1">Texte du Script:</label>
      <textarea
        id="scriptInput"
        value={scriptText}
        onChange={(e) => setScriptText(e.target.value)}
        placeholder="Collez votre script ici..."
        rows={8}
        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-700 bg-white mb-4 disabled:opacity-60"
        disabled={isLoading || !isApiKeyAvail}
      />
      
      <Button onClick={handleAnalyzeScript} isLoading={isLoading} disabled={isLoading || !isApiKeyAvail} icon="text_snippet" variant="primary" className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 focus:ring-violet-500">
        Analyser le Script
      </Button>
      {!isApiKeyAvail && <p className="text-xs text-red-500 mt-1">{API_KEY_ERROR_MESSAGE}</p>}

      {isLoading && <Loader message="Analyse en cours..." />}
      
      <AIOutputDisplay 
        minHeightClass="min-h-[200px]"
        textToCopy={getAnalysisTextForCopy()}
        onCopyStatus={onSetStatusMessage}
        fileNameGenerator={fileNameForDownload}
      >
        {analysisResult ? (
          <div className="text-left">
            <h4 className="text-md font-semibold text-slate-700 mt-2 mb-1">Résumé:</h4>
            <p className="text-xs text-slate-600 mb-3 whitespace-pre-line">{analysisResult.summary}</p>
            <h4 className="text-md font-semibold text-slate-700 mb-1">Préceptes Clés:</h4>
            <ul className="list-disc pl-5">
              {analysisResult.precepts.map((precept, index) => (
                <li key={index} className="mb-1">
                  <strong className="text-xs text-violet-700">{precept.title}:</strong> <span className="text-xs text-slate-600">{precept.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          !isLoading && <p className="italic text-center">L'analyse du script apparaîtra ici.</p>
        )}
      </AIOutputDisplay>
    </AIToolSection>
  );
};

export default ScriptAnalyzer;


import React, { useState, useEffect } from 'react';
import { 
    AdaptikSection as AdaptikSectionType, 
    BibleData,
    BrandSuggestion,
    AdaptikRequestParams,
    IntegrationLevel,
    BrandTypePreference // Import the new type
} from '../../../types';
import { SectionTitle, Paragraph, renderSectionShell, createDefaultMessage } from '../TabContentUtils';
import { AIToolSection } from '../LaboratoireIATab/common'; // Re-use AIToolSection for styling consistency
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { generateBrandPlacementSuggestions, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../../constants';
import Card from '../../UI/Card';

interface AdaptikTabProps {
  data?: AdaptikSectionType; // From BibleData.adaptikSection
  bibleData: BibleData | null; // Full Bible data for context
  bibleTitle?: string;
  onSetStatusMessageGlobal: (message: string, isError?: boolean) => void;
}

const AdaptikTab: React.FC<AdaptikTabProps> = ({ data, bibleData, bibleTitle, onSetStatusMessageGlobal }) => {
  const [sceneDescription, setSceneDescription] = useState('');
  const [projectGenre, setProjectGenre] = useState('');
  const [projectUniverse, setProjectUniverse] = useState('');
  const [projectValues, setProjectValues] = useState('');
  const [integrationLevel, setIntegrationLevel] = useState<IntegrationLevel>('Implicite');
  const [objectTypes, setObjectTypes] = useState(''); // Comma-separated string
  const [brandTypePreference, setBrandTypePreference] = useState<BrandTypePreference>('Mixte'); // New state
  
  const [suggestions, setSuggestions] = useState<BrandSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  useEffect(() => {
    if (bibleData) {
      setProjectGenre(bibleData.pitchSection?.positionnement?.type || '');
      setProjectUniverse(bibleData.pitchSection?.ambianceSpecifique || bibleData.universSection?.introduction || '');
      // Project values are subjective, user should ideally input them.
      // Could try to extract themes if projectValues is empty:
      // setProjectValues(bibleData.themesSection?.themesPrincipaux?.map(t => t.theme).join(', ') || '');
    }
  }, [bibleData]);

  const handleGenerateSuggestions = async () => {
    if (!bibleData) {
      onSetStatusMessageGlobal("Chargez une Bible pour utiliser l'outil ADAPTIK™.", true);
      return;
    }
    if (!isApiKeyAvail) {
      onSetStatusMessageGlobal(API_KEY_ERROR_MESSAGE, true);
      return;
    }
    if (!sceneDescription.trim()) {
      onSetStatusMessageGlobal("Veuillez décrire la scène ou le contexte.", true);
      return;
    }

    setIsLoading(true);
    setSuggestions([]);
    onSetStatusMessageGlobal("Génération des suggestions ADAPTIK™...", false);

    const params: AdaptikRequestParams = {
      sceneDescription,
      projectGenre: projectGenre || bibleData.pitchSection?.positionnement?.type || 'Non spécifié',
      projectUniverse: projectUniverse || bibleData.pitchSection?.ambianceSpecifique || 'Non spécifié',
      projectValues: projectValues || 'Non spécifié',
      integrationLevel,
      objectTypes: objectTypes.split(',').map(s => s.trim()).filter(s => s),
      brandTypePreference, // Pass the new preference
    };

    try {
      const result = await generateBrandPlacementSuggestions(params, bibleData);
      setSuggestions(result);
      if (result.length > 0) {
        onSetStatusMessageGlobal("Suggestions de placement générées !", false);
      } else {
        onSetStatusMessageGlobal("Aucune suggestion générée pour ces paramètres.", false);
      }
    } catch (error: any) {
      console.error("Erreur ADAPTIK™:", error);
      onSetStatusMessageGlobal(`Erreur ADAPTIK™: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderSuggestionCard = (suggestion: BrandSuggestion, index: number) => (
    <Card 
        key={index} 
        title={`${suggestion.nomMarque} (${suggestion.typeMarque})`}
        icon={suggestion.estFictive ? 'emoji_objects' : 'storefront'}
        additionalClasses={`border-l-4 ${suggestion.estFictive ? 'border-sky-500' : 'border-emerald-500'}`}
    >
        {suggestion.slogan && <p className="text-xs italic text-slate-500 mb-1">"{suggestion.slogan}"</p>}
        <Paragraph content={`<strong>Placement:</strong> ${suggestion.objetPlacement || 'Non spécifié'}`} />
        <Paragraph content={`<strong>Intégration (${suggestion.niveauIntegration}):</strong> ${suggestion.detailsIntegration}`} />
        {suggestion.logoDescription && <Paragraph content={`<strong>Idée Logo:</strong> ${suggestion.logoDescription}`} />}
        {suggestion.justification && <Paragraph content={`<strong>Justification:</strong> ${suggestion.justification}`} />}
         <p className="text-xs mt-2">Type: <span className={`font-semibold ${suggestion.estFictive ? 'text-sky-600' : 'text-emerald-600'}`}>{suggestion.estFictive ? 'Marque Fictive/Adaptée' : 'Marque Réelle'}</span></p>
    </Card>
  );

  const inputClasses = "w-full p-2.5 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:placeholder-slate-500 disabled:border-slate-500 disabled:cursor-not-allowed";

  return renderSectionShell(
    "adaptik",
    data || { titre: "ADAPTIK™ - Engine de Placement Narratif Intelligent" }, 
    data?.titre || "ADAPTIK™ - Engine de Placement Narratif Intelligent",
    "auto_awesome",
    bibleTitle,
    "Configuration ADAPTIK™ non disponible dans cette Bible.",
    <>
      <Paragraph content={data?.introduction || "Ce moteur intelligent adapte des marques (réelles ou fictives) à votre scénario ou Bible, en cohérence avec le genre, l'univers, les valeurs du projet et le niveau d’intégration souhaité."} />
      
      <AIToolSection title="Paramètres de Placement">
        <div className="space-y-4">
          <div>
            <label htmlFor="adaptikScene" className="block text-sm font-medium text-slate-700 mb-1">Description Scène/Contexte:</label>
            <textarea id="adaptikScene" value={sceneDescription} onChange={(e) => setSceneDescription(e.target.value)} rows={3} className={inputClasses} placeholder="Ex: Un détective examine des indices dans un bar miteux..." disabled={isLoading || !isApiKeyAvail} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="adaptikGenre" className="block text-sm font-medium text-slate-700 mb-1">Genre du Projet:</label>
              <input type="text" id="adaptikGenre" value={projectGenre} onChange={(e) => setProjectGenre(e.target.value)} className={inputClasses} placeholder="Ex: Science-Fiction, Comédie Romantique" disabled={isLoading || !isApiKeyAvail} />
            </div>
            <div>
              <label htmlFor="adaptikUnivers" className="block text-sm font-medium text-slate-700 mb-1">Style d'Univers:</label>
              <input type="text" id="adaptikUnivers" value={projectUniverse} onChange={(e) => setProjectUniverse(e.target.value)} className={inputClasses} placeholder="Ex: Cyberpunk dystopique, Fantaisie médiévale" disabled={isLoading || !isApiKeyAvail} />
            </div>
          </div>

          <div>
            <label htmlFor="adaptikValues" className="block text-sm font-medium text-slate-700 mb-1">Valeurs du Projet (optionnel):</label>
            <input type="text" id="adaptikValues" value={projectValues} onChange={(e) => setProjectValues(e.target.value)} className={inputClasses} placeholder="Ex: Rebelle, Écologique, Luxueux" disabled={isLoading || !isApiKeyAvail} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="adaptikIntegrationLevel" className="block text-sm font-medium text-slate-700 mb-1">Niveau d'Intégration:</label>
              <select id="adaptikIntegrationLevel" value={integrationLevel} onChange={(e) => setIntegrationLevel(e.target.value as IntegrationLevel)} className={inputClasses} disabled={isLoading || !isApiKeyAvail}>
                <option value="Évident">Évident</option>
                <option value="Implicite">Implicite</option>
                <option value="Subliminal">Subliminal</option>
              </select>
            </div>
            <div> {/* New Dropdown for Brand Type Preference */}
              <label htmlFor="adaptikBrandType" className="block text-sm font-medium text-slate-700 mb-1">Préférence Type Marque:</label>
              <select id="adaptikBrandType" value={brandTypePreference} onChange={(e) => setBrandTypePreference(e.target.value as BrandTypePreference)} className={inputClasses} disabled={isLoading || !isApiKeyAvail}>
                <option value="Mixte">Mixte (Fictive et Réelle/Adaptée)</option>
                <option value="Fictive">Fictive Uniquement</option>
                <option value="RéelleAdaptée">Réelle/Adaptée Uniquement</option>
              </select>
            </div>
          </div>
           <div>
            <label htmlFor="adaptikObjects" className="block text-sm font-medium text-slate-700 mb-1">Types d'Objets pour Placement (optionnel, séparés par virgule):</label>
            <input type="text" id="adaptikObjects" value={objectTypes} onChange={(e) => setObjectTypes(e.target.value)} className={inputClasses} placeholder="Ex: ordinateur, boisson, vêtement, voiture" disabled={isLoading || !isApiKeyAvail} />
          </div>

          <Button onClick={handleGenerateSuggestions} isLoading={isLoading} disabled={isLoading || !bibleData || !isApiKeyAvail} icon="magic_button" variant="primary" className="w-full sm:w-auto">
            Générer Suggestions de Placement
          </Button>
          {!isApiKeyAvail && <p className="text-xs text-red-500 mt-1">{API_KEY_ERROR_MESSAGE}</p>}
        </div>
      </AIToolSection>

      {isLoading && <Loader message="ADAPTIK™ réfléchit aux placements..." />}
      
      {suggestions.length > 0 && !isLoading && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Suggestions de Placement ADAPTIK™</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map(renderSuggestionCard)}
          </div>
        </div>
      )}
      {!isLoading && suggestions.length === 0 && sceneDescription && ( 
           <div className="mt-6">
            {createDefaultMessage("Aucune suggestion pour les paramètres actuels ou une tentative de génération a été faite. Essayez d'ajuster vos critères.")}
           </div>
      )}
    </>
  );
};

export default AdaptikTab;

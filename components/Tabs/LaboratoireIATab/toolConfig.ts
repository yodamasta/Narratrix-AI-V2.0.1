import React from 'react';
// Import actual tool components
import StoryboardGenerator from './StoryboardGenerator';
import VisualGenerator from './VisualGenerator';
import EtSiBrainstormer from './EtSiBrainstormer';
import ConceptDeveloper from './ConceptDeveloper';
import NameConceptGenerator from './NameConceptGenerator';
import ScriptAnalyzer from './ScriptAnalyzer';
import CharacterArcDeveloper from './CharacterArcDeveloper'; 
import EmotionSparkTool from './HumorSparkTool'; // Corrected import to match filename
import CharacterRelationshipWeaver from './CharacterRelationshipWeaver'; // New tool import
import MoodBoardGenerator from './MoodBoardGenerator'; // New Mood Board tool import

interface PlaceholderToolProps {
  toolName: string;
  onBack?: () => void;
}

const PlaceholderTool: React.FC<PlaceholderToolProps> = ({ toolName, onBack }) => {
  return React.createElement(
    'div',
    { className: "p-4 bg-white rounded-lg shadow-md" },
    onBack && React.createElement(
      'button',
      {
        onClick: onBack,
        className: "mb-4 text-sm text-teal-600 hover:text-teal-800 font-semibold flex items-center"
      },
      React.createElement('span', { className: "material-icons-outlined mr-1" }, "arrow_back"),
      'Retour aux outils'
    ),
    React.createElement(
      'h3',
      { className: "text-xl font-semibold text-slate-700 mb-2" },
      toolName
    ),
    React.createElement(
      'p',
      { className: "text-slate-600" },
      'Cet outil est en cours de développement ou de configuration.'
    )
  );
};

export interface LabTool {
  id: string;
  title: string;
  icon: string;
  description: string;
  gradientClasses: string;
  isNew?: boolean;
  status?: 'active' | 'construction' | 'default';
  component: React.ComponentType<any>; 
}

export const toolCardsConfig: LabTool[] = [
  {
    id: 'moodBoardGenerator',
    title: 'Générateur de Mood Board',
    icon: 'auto_awesome_mosaic',
    description: "Visualisez l'ambiance de votre univers. L'IA génère une série d'images inspirées par votre Bible.",
    gradientClasses: 'from-red-500 to-orange-500',
    isNew: true,
    component: MoodBoardGenerator,
    status: 'active',
  },
  {
    id: 'characterRelationshipWeaver',
    title: 'Tisseur de Liens (Personnages)',
    icon: 'connect_without_contact',
    description: "Analysez deux personnages et obtenez des suggestions de dynamiques relationnelles, d'événements clés et de scènes types.",
    gradientClasses: 'from-pink-500 to-rose-500',
    isNew: true,
    component: CharacterRelationshipWeaver,
    status: 'active',
  },
  {
    id: 'storyboardGenerator',
    title: 'Générateur de Storyboard',
    icon: 'movie_filter', 
    description: 'Décomposez une scène en 6 plans clés avec visualisations.',
    gradientClasses: 'from-purple-600 to-blue-500',
    isNew: true, 
    component: StoryboardGenerator,
    status: 'active', 
  },
  {
    id: 'characterArcDeveloper',
    title: 'Développeur d\'Arc de Personnage',
    icon: 'trending_up', 
    description: 'Structurez et enrichissez l\'évolution narrative de vos personnages en plusieurs étapes clés.',
    gradientClasses: 'from-sky-500 to-indigo-500',
    isNew: true,
    component: CharacterArcDeveloper,
    status: 'active', 
  },
  {
    id: 'visualGenerator',
    title: 'Générateur Visuel',
    icon: 'image', 
    description: 'Décrivez une image, l\'IA la visualisera.',
    gradientClasses: 'from-blue-600 to-cyan-400', 
    component: VisualGenerator,
    status: 'active', 
  },
   {
    id: 'conceptDeveloper',
    title: 'Développeur de Concepts',
    icon: 'emoji_objects',
    description: 'Approfondissez une idée brute en générant détails, implications et pistes de réflexion.',
    gradientClasses: 'from-teal-500 to-emerald-500',
    component: ConceptDeveloper,
    status: 'active', 
  },
  {
    id: 'etSiBrainstormer', 
    title: 'Brainstorming "Et si ?!"', 
    icon: 'lightbulb',
    description: "Explorez des alternatives et complications pour une situation donnée.",
    gradientClasses: 'from-amber-500 to-yellow-400',
    component: EtSiBrainstormer,
    status: 'active', 
  },
  {
    id: 'emotionSpark', 
    title: "Étincelle d'Émotions", 
    icon: 'filter_drama', 
    description: "Injectez ou modulez une palette d'émotions (humour, tension, joie, etc.) dans vos scènes ou dialogues.", 
    gradientClasses: 'from-rose-400 to-orange-400', 
    status: 'active', 
    isNew: true, 
    component: EmotionSparkTool, 
  },
  {
    id: 'nameConceptGenerator',
    title: 'Générateur Noms & Concepts',
    icon: 'casino',
    description: 'Suggère des noms (personnages, lieux) ou des concepts bruts basés sur un thème.',
    gradientClasses: 'from-rose-500 to-fuchsia-500', 
    component: NameConceptGenerator,
    status: 'active', 
  },
  {
    id: 'scriptAnalyzer',
    title: 'Analyseur de Script',
    icon: 'text_snippet',
    description: 'Extrait résumé et préceptes clés d\'un texte de scénario.',
    gradientClasses: 'from-violet-600 to-purple-500',
    component: ScriptAnalyzer,
    status: 'active', 
  },
  // Tools "En Construction" moved to the end
  {
    id: 'trailerConception',
    title: 'Concepteur de Trailer',
    icon: 'movie_creation', 
    description: 'Générez un plan détaillé pour un trailer cinématographique (concept, taglines, structure, plans clés).',
    gradientClasses: 'from-red-500 to-orange-400',
    isNew: true,
    component: (props: any) => React.createElement(PlaceholderTool, { toolName: "Concepteur de Trailer", onBack: props.onBack }),
    status: 'construction',
  },
  {
    id: 'dynamicNarrativeSimulator',
    title: 'Simulateur Narratif Dynamique',
    icon: 'model_training', 
    description: "Décrivez une action et l'IA simule les conséquences (antagonistes, scène, impact quête).",
    gradientClasses: 'from-slate-800 to-slate-600',
    isNew: true,
    component: (props: any) => React.createElement(PlaceholderTool, { toolName: "Simulateur Narratif Dynamique", onBack: props.onBack }),
    status: 'construction',
  },
  {
    id: 'creativePromptExplorer',
    title: 'Explorateur de Prompts Créatifs',
    icon: 'flare', 
    description: 'Générez situations (3 pers.), dialogues/narrations (1-3 pers.), ambiances, rêves ou perceptions.',
    gradientClasses: 'from-green-500 to-lime-400',
    isNew: true,
    component: (props: any) => React.createElement(PlaceholderTool, { toolName: "Explorateur de Prompts Créatifs", onBack: props.onBack }),
    status: 'construction',
  },
  {
    id: 'visualPromptElements',
    title: 'Prompts Visuels d\'Éléments',
    icon: 'palette', 
    description: 'Créez des prompts détaillés pour générer des images de personnages, environnements ou objets clés.',
    gradientClasses: 'from-pink-500 to-red-500', 
    isNew: true,
    component: (props: any) => React.createElement(PlaceholderTool, { toolName: "Prompts Visuels d'Éléments", onBack: props.onBack }),
     status: 'construction',
  },
];
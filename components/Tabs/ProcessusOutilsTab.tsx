

import React from 'react';
import { SectionTitle, SubTitle, Paragraph, createDefaultMessage } from './TabContentUtils';
import NotesSection from '../UI/NotesSection';
import { BibleData } from '../../types'; 
import Button from '../UI/Button';

interface ProcessusOutilsTabProps {
  bibleData: BibleData | null; 
  isBibleLoaded: boolean; 
  onRestartTour: () => void;
  onRestartPostLoadTour: () => void;
}

const ProcessusOutilsTab: React.FC<ProcessusOutilsTabProps> = ({ bibleData, isBibleLoaded, onRestartTour, onRestartPostLoadTour }) => {
  const bibleTitle = bibleData?.projectInfo.title;

  return (
    <div className="p-4">
      <SectionTitle title="Processus de Développement & Outils" icon="🛠️" />
      
      {!isBibleLoaded ? (
         <div className="p-8 text-center bg-teal-50 dark:bg-teal-900/30 border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-lg flex flex-col items-center justify-center">
            <span className="material-icons-outlined text-5xl text-teal-400 dark:text-teal-500 mb-4">support</span>
            <p className="text-teal-700 dark:text-slate-100 font-semibold">
              Bienvenue sur Narratrix-AI !
            </p>
            <p className="text-teal-600 dark:text-slate-300 text-sm mt-1 mb-4">
              Veuillez charger ou créer une Bible pour explorer votre univers.
            </p>
            <Button onClick={onRestartTour} icon="tour" variant="secondary">
                Relancer le Guide de Démarrage
            </Button>
        </div>
      ) : (
        <>
            <SubTitle text={"Importance de la Bible Universelle"} />
            <Paragraph content="Cette Bible interactive est la 'source unique de vérité' pour tous les aspects créatifs et narratifs de votre projet. Elle assure la cohérence, guide le développement et sert de référence." />

            <SubTitle text="L'Approche IA" />
            <Paragraph content="L'intelligence artificielle (via les API de Google Gemini et Imagen) est utilisée comme un outil créatif. Elle permet d'explorer l'univers, de générer des idées, de visualiser des personnages ou des scènes, et de tester des concepts narratifs en restant fidèle à l'ADN de votre projet. Une clé API valide (variable d'environnement `API_KEY`) est nécessaire pour ces fonctionnalités." />
            
            <SubTitle text={"Présentation de l'Application \"Bible Universelle - Exploration Interactive\""} />
            <Paragraph content="<strong>Nom de l'application:</strong> Bible Universelle - Exploration Interactive (React Version)" />
            <Paragraph content="<strong>Objectif:</strong> Centraliser l'information de votre Bible de manière dynamique, faciliter l'exploration de l'univers, et offrir des outils interactifs pour stimuler la créativité, y compris la prise de notes personnelles, la visualisation chronologique et la cartographie des relations." />
            
            <Paragraph content="<strong>Fonctionnalités Clés:</strong>" />
            <ul className="list-disc list-inside space-y-1 mb-4 pl-5 bg-white dark:bg-slate-800/50 p-4 rounded-lg shadow-sm text-slate-700 dark:text-slate-300">
                <li>Navigation par onglets à travers toutes les sections de la Bible.</li>
                <li>Chargement de Bibles via fichier JSON ou saisie directe.</li>
                <li>Correction assistée par IA pour les JSON invalides (si clé API disponible).</li>
                <li>Conversion de texte libre en format Bible JSON (Bêta, si clé API disponible).</li>
                <li>Recherche globale dans le contenu de la Bible chargée.</li>
                <li>Tri alphabétique (A-Z, Z-A, Original) pour les listes principales.</li>
                <li>Fiches personnages détaillées avec modale interactive.</li>
                <li>Visualisation des mécaniques de l'univers (graphique d'impact).</li>
                <li>Visualisation Chronologique interactive des événements clés.</li>
                <li>Cartographie Visuelle des Relations entre éléments.</li>
                <li>Prise de Notes Personnelles par section (sauvegardées localement).</li>
                <li className="font-semibold mt-2">Laboratoire IA & Outils Avancés :</li>
                <ul className="list-circle list-inside pl-5 space-y-1">
                    <li>Générateur de Storyboard (texte et images).</li>
                    <li>Générateur Visuel pour personnages et scènes.</li>
                    <li>Générateur de Dialogues entre personnages.</li>
                    <li>Brainstorming de Scénarios 'Et si ?'.</li>
                    <li>Développeur de Concepts pour approfondir des idées.</li>
                    <li>Journal du Protagoniste (génération de texte).</li>
                    <li><strong>ADAPTIK™ Engine:</strong> Placement narratif intelligent de marques.</li> 
                </ul>
            </ul>

            <div className="mt-6 flex flex-wrap gap-4">
                <Button onClick={onRestartTour} icon="tour" variant="secondary">
                    Relancer le Guide de Démarrage
                </Button>
                <Button onClick={onRestartPostLoadTour} icon="explore" variant="secondary">
                    Relancer le Guide Post-Chargement
                </Button>
            </div>
            
            <Paragraph content="<strong>Valeur Ajoutée:</strong> Cet outil rend votre univers tangible et démontre sa profondeur de manière interactive. Il permet de 'jouer' avec les concepts de votre histoire et de consigner vos réflexions personnelles. Le modèle JSON personnalisable, accessible depuis le chargeur, vous permet de l'adapter à n'importe quel projet." />
            <Paragraph content="<em>Les fonctionnalités IA dépendent de la disponibilité des services Google AI et d'une clé API valide. Les notes personnelles sont stockées localement dans votre navigateur.</em>" className="text-sm text-slate-600 dark:text-slate-400 italic mt-6" />
        </>
      )}


      <NotesSection sectionId="processus_outils" bibleTitle={bibleTitle} />
    </div>
  );
};

export default ProcessusOutilsTab;

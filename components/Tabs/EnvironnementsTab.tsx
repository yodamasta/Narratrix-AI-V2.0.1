import React, { useState, useEffect } from 'react';
import { EnvironnementsSection as EnvironnementsSectionType, Lieu } from '../../types';
import { SectionTitle, SubTitle, Paragraph, renderSectionShell, createDefaultMessage } from './TabContentUtils';
import Card from '../UI/Card';
import SortControls from '../UI/SortControls';

interface EnvironnementsTabProps {
  data?: EnvironnementsSectionType;
  bibleTitle?: string;
}

const EnvironnementsTab: React.FC<EnvironnementsTabProps> = ({ data, bibleTitle }) => {
  const [sortedLieux, setSortedLieux] = useState<Lieu[]>(data?.lieux || []);

  useEffect(() => {
    setSortedLieux(data?.lieux || []);
  }, [data]);

  const renderLieuxList = (items: Lieu[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {items.map((lieu) => (
        <Card key={lieu.id} title={lieu.nom} icon={lieu.icon || '🌳'}>
          <Paragraph content={lieu.description || "Pas de description."} className="text-sm text-slate-600 dark:text-slate-400 mb-1" />
          {lieu.importanceNarrative && <Paragraph content={`<strong>Importance Narrative:</strong> ${lieu.importanceNarrative}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1" />}
          {lieu.ambiance && <Paragraph content={`<strong>Ambiance:</strong> ${lieu.ambiance}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1" />}
          {lieu.refletEtatMental && <Paragraph content={`<strong>Reflet/Fonction:</strong> ${lieu.refletEtatMental}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1" />}
          {lieu.manifestationEntites && <Paragraph content={`<strong>Manifestations Spécifiques:</strong> ${lieu.manifestationEntites}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1" />}
        </Card>
      ))}
    </div>
  );
  
  const villeData = data?.laVille; 

  return renderSectionShell(
    "environnements",
    data,
    "Environnements & Lieux Clés",
    "🏞️",
    bibleTitle,
    "Données d'environnements non disponibles.",
    <>
      <Paragraph content="Les lieux de votre projet sont des personnages à part entière, reflétant les thèmes et l'atmosphère." />
      
      {villeData && villeData.nom && (
        <div className="my-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-l-4 border-teal-500 dark:border-teal-400">
          <SubTitle text={villeData.nom} className="!mt-0 text-teal-600 dark:text-teal-300" />
          {villeData.description && <Paragraph content={villeData.description} className="text-sm text-slate-600 dark:text-slate-400"/>}
        </div>
      )}

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <SubTitle text="Lieux Détaillés" className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-200 mt-0 mb-0" />
            {data?.lieux && data.lieux.length > 0 && (
                 <SortControls
                    data={data.lieux}
                    sortKey="nom"
                    onSort={setSortedLieux}
                />
            )}
        </div>
        {sortedLieux.length > 0
            ? renderLieuxList(sortedLieux)
            : createDefaultMessage("Aucun lieu détaillé défini.")
        }
      </div>
    </>
  );
};

export default EnvironnementsTab;
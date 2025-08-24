import React from 'react';
import { StructureSaisonSection as StructureSaisonSectionType, ArcMajeur, Episode } from '../../types';
import { SectionTitle, SubTitle, Paragraph, renderSectionShell, createDefaultMessage } from './TabContentUtils';

interface StructureTabProps {
  data?: StructureSaisonSectionType;
  bibleTitle?: string;
}

const StructureTab: React.FC<StructureTabProps> = ({ data, bibleTitle }) => {
  const arcsData = data?.arcsMajeursSaison1 || (data as any)?.actesPrincipaux;
  const episodesData = data?.episodesSaison1 || (data as any)?.chapitres;

  const renderDetail = (label: string, value: string | undefined | null) => {
    if (value === undefined || value === null || value.trim() === '') return null;
    return <Paragraph content={`<strong>${label}:</strong> ${value}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1" />;
  };


  return renderSectionShell(
    "structure",
    data,
    "Structure Narrative",
    "🎞️",
    bibleTitle,
    "Données de structure narrative non disponibles.",
    <>
      {data?.structureGlobale && (
        <div className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border-t-4 border-teal-500 dark:border-teal-400">
          <SubTitle text="Structure Globale" className="!mt-0 !mb-3 text-teal-700 dark:text-teal-300" />
          {renderDetail("Format", data.structureGlobale.format)}
          {renderDetail("Progression", data.structureGlobale.progression)}
          {!data.structureGlobale.format && !data.structureGlobale.progression && <Paragraph content="Non définie." className="text-sm text-slate-500 dark:text-slate-500 italic"/>}
        </div>
      )}
      
      {arcsData && arcsData.length > 0 && (
        <div className="mb-8">
          <SubTitle text="Actes Majeurs / Parties Principales" />
          <div className="space-y-6">
            {arcsData.map((arc: ArcMajeur, index: number) => (
              <div key={index} className="bg-white dark:bg-slate-800 border-l-4 border-indigo-500 dark:border-indigo-400 rounded-r-lg p-6 shadow-md">
                <h4 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-2">{arc.acte || `Acte/Partie ${index + 1}`}</h4>
                {renderDetail("Objectif du Protagoniste", arc.objectifProtagoniste || (arc as any).objectifSolan)}
                {renderDetail("Description", arc.description)}
                {!(arc.objectifProtagoniste || (arc as any).objectifSolan || arc.description) && <Paragraph content="Détails non fournis." className="text-sm text-slate-500 dark:text-slate-500 italic"/>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {episodesData && episodesData.length > 0 && (
        <div className="mb-8">
          <SubTitle text="Découpage (Épisodes/Chapitres)" />
          <div className="space-y-4">
            {episodesData.map((ep: Episode, index: number) => (
              <div key={index} className="bg-white dark:bg-slate-800 border-l-4 border-purple-500 dark:border-purple-400 rounded-r-lg p-6 shadow-md">
                <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">{`Partie ${ep.num || (index + 1)}: ${ep.titreProvisoire || "Titre à définir"}`}</h4>
                {renderDetail("Résumé", ep.resume)}
                {!ep.resume && <Paragraph content="Résumé non fourni." className="text-sm text-slate-500 dark:text-slate-500 italic"/>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {data?.pointsDeConnexion && (
         <div className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border-t-4 border-orange-500 dark:border-orange-400">
          <SubTitle text="Points de Connexion / Transitions" className="!mt-0 !mb-3 text-orange-700 dark:text-orange-300"/>
          <Paragraph content={data.pointsDeConnexion} className="text-sm text-slate-600 dark:text-slate-400"/>
        </div>
      )}

      {!(data?.structureGlobale || (arcsData && arcsData.length > 0) || (episodesData && episodesData.length > 0) || data?.pointsDeConnexion) &&
        createDefaultMessage("Aucun détail de structure narrative fourni dans la Bible.")
      }
    </>
  );
};

export default StructureTab;
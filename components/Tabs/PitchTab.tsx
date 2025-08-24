import React from 'react';
import { PitchSection as PitchSectionType, BibleData } from '../../types';
import { SectionTitle, SubTitle, Paragraph, renderSectionShell } from './TabContentUtils';
import Card from '../UI/Card';

interface PitchTabProps {
  data?: PitchSectionType;
  bibleTitle?: string;
}

const PitchTab: React.FC<PitchTabProps> = ({ data, bibleTitle }) => {
  return renderSectionShell(
    "pitch",
    data,
    "Pitch & Intention",
    "🎬",
    bibleTitle,
    "Données de pitch non disponibles.",
    <>
      {data?.pitchGlobal && (
        <>
          <SubTitle text="Pitch Global" />
          <div className="text-slate-700 dark:text-slate-200 leading-relaxed mb-4 italic bg-teal-50 dark:bg-teal-900/50 p-4 rounded-lg border-l-4 border-teal-500 dark:border-teal-400">
            <Paragraph content={data.pitchGlobal} className="dark:text-slate-200" />
          </div>
        </>
      )}
      {data?.logline && (
        <>
          <SubTitle text="Logline" />
          <Paragraph content={data.logline} className="text-slate-700 dark:text-slate-200 font-semibold leading-relaxed mb-4" />
        </>
      )}
      {data?.intentionAuteur && (
        <>
          <SubTitle text="Intention de l'Auteur" />
          <Paragraph content={data.intentionAuteur} />
        </>
      )}
      {data?.positionnement && (
        <>
          <SubTitle text="Positionnement" />
          <Card title="Détails du Positionnement" icon="🎯" additionalClasses="mb-4">
            <Paragraph content={`<strong>Type:</strong> ${data.positionnement.type || 'N/A'}`} />
            <Paragraph content={`<strong>Cible:</strong> ${data.positionnement.cible || 'N/A'}`} />
            <Paragraph content={`<strong>Format:</strong> ${data.positionnement.format || 'N/A'}`} />
          </Card>
        </>
      )}
      {data?.referencesTonEsthetique && data.referencesTonEsthetique.length > 0 && (
        <>
          <SubTitle text="Références Ton & Esthétique" />
          <ul className="list-disc list-inside space-y-2 mb-4 pl-5 bg-white dark:bg-slate-800/50 p-4 rounded-lg shadow-sm">
            {data.referencesTonEsthetique.map((refText, index) => (
              <li key={index} className="text-slate-700 dark:text-slate-300">{refText}</li>
            ))}
          </ul>
        </>
      )}
      {data?.ambianceSpecifique && (
        <>
          <SubTitle text="Ambiance Spécifique" />
          <Paragraph content={data.ambianceSpecifique} className="text-sm text-slate-600 dark:text-slate-400 mt-2 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md"/>
        </>
      )}
    </>
  );
};

export default PitchTab;
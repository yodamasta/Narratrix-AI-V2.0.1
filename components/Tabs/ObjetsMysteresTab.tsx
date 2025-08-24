import React, { useState, useEffect } from 'react';
import { ObjetsMysteresSection as ObjetsMysteresSectionType, ObjetOuMystere } from '../../types';
import { SectionTitle, SubTitle, Paragraph, renderSectionShell, createDefaultMessage } from './TabContentUtils';
import Card from '../UI/Card';
import SortControls from '../UI/SortControls';

interface ObjetsMysteresTabProps {
  data?: ObjetsMysteresSectionType;
  bibleTitle?: string;
}

const ObjetsMysteresTab: React.FC<ObjetsMysteresTabProps> = ({ data, bibleTitle }) => {
  const [sortedObjets, setSortedObjets] = useState<ObjetOuMystere[]>(data?.objets || []);

  useEffect(() => {
    setSortedObjets(data?.objets || []);
  }, [data]);

  const renderObjetsList = (items: ObjetOuMystere[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {items.map((obj) => (
        <Card key={obj.id} title={obj.nom} icon={obj.icon || '🗝️'}>
          {obj.type && <Paragraph content={`<strong>Type:</strong> ${obj.type}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1"/>}
          {obj.description && <Paragraph content={`<strong>Description:</strong> ${obj.description}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1"/>}
          {obj.origine && <Paragraph content={`<strong>Origine:</strong> ${obj.origine}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1"/>}
          {obj.fonction && <Paragraph content={`<strong>Fonction/Utilité:</strong> ${obj.fonction}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1"/>}
          {obj.danger && <Paragraph content={`<strong>Danger/Risque:</strong> ${obj.danger}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1"/>}
          {(obj.utilisationNarrative || (obj as any).fonctionNarrative) && <Paragraph content={`<strong>Utilisation Narrative:</strong> ${obj.utilisationNarrative || (obj as any).fonctionNarrative}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1"/>}
          {obj.elementsConnus && <Paragraph content={`<strong>Éléments Connus:</strong> ${obj.elementsConnus}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1"/>}
          {obj.pistesInitiales && <Paragraph content={`<strong>Pistes Initiales:</strong> ${obj.pistesInitiales}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1"/>}
          {obj.importanceNarrative && <Paragraph content={`<strong>Importance Narrative:</strong> ${obj.importanceNarrative}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1"/>}
        </Card>
      ))}
    </div>
  );

  return renderSectionShell(
    "objets_mysteres",
    data,
    "Objets Importants & Enjeux Clés",
    "📦",
    bibleTitle,
    "Données d'objets/mystères non disponibles.",
    <>
      <Paragraph content="Ces objets, concepts ou mystères sont des pivots narratifs." />
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <SubTitle text="Liste des Objets & Mystères" className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-200 mt-0 mb-0" />
            {data?.objets && data.objets.length > 0 && (
                <SortControls
                    data={data.objets}
                    sortKey="nom"
                    onSort={setSortedObjets}
                />
            )}
        </div>
        {sortedObjets.length > 0
            ? renderObjetsList(sortedObjets)
            : createDefaultMessage("Aucun objet ou mystère défini.")
        }
      </div>
    </>
  );
};

export default ObjetsMysteresTab;
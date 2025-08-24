

import React, { useState } from 'react';
import { UniversSection as UniversSectionType, ElementUnique } from '../../types';
import { SectionTitle, SubTitle, Paragraph, renderSectionShell, createDefaultMessage } from './TabContentUtils';
import Card from '../UI/Card';
import SortControls from '../UI/SortControls';

interface UniversTabProps {
  data?: UniversSectionType;
  bibleTitle?: string;
}

const UniversTab: React.FC<UniversTabProps> = ({ data, bibleTitle }) => {
  const [sortedElements, setSortedElements] = useState<ElementUnique[]>(data?.elementsUniques || []);

  React.useEffect(() => {
    setSortedElements(data?.elementsUniques || []);
  }, [data]);
  
  const renderElements = (items: ElementUnique[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((element) => (
        <Card key={element.id} title={element.nom} icon={element.icon || '✨'}>
          <Paragraph content={element.description} />
        </Card>
      ))}
    </div>
  );

  return renderSectionShell(
    "univers",
    data,
    "Univers",
    "🌍",
    bibleTitle,
    "Données d'univers non disponibles.",
    <>
      {data?.introduction && <Paragraph content={data.introduction} />}
      {data?.fondationsSystemeMemoire && (
        <>
          <SubTitle text="Fondations du Monde / Système Principal" />
          <Paragraph content={data.fondationsSystemeMemoire} />
        </>
      )}
      
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <SubTitle text="Concepts & Règles Uniques du Monde" className="text-xl sm:text-2xl font-semibold text-slate-700 mt-0 mb-0"/>
            {data?.elementsUniques && data.elementsUniques.length > 0 && (
                <SortControls
                    data={data.elementsUniques}
                    sortKey="nom"
                    onSort={setSortedElements}
                />
            )}
        </div>
        {sortedElements.length > 0 
            ? renderElements(sortedElements) 
            : createDefaultMessage("Aucun élément unique défini.")
        }
      </div>
    </>
  );
};

export default UniversTab;
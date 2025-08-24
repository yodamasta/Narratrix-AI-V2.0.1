import React, { useState, useEffect } from 'react';
import { GlossaireSection as GlossaireSectionType, TermeGlossaire } from '../../types';
import { SectionTitle, SubTitle, Paragraph, renderSectionShell, createDefaultMessage } from './TabContentUtils';
import SortControls from '../UI/SortControls';

interface GlossaireTabProps {
  data?: GlossaireSectionType;
  bibleTitle?: string;
}

const GlossaireTab: React.FC<GlossaireTabProps> = ({ data, bibleTitle }) => {
  const [sortedTermes, setSortedTermes] = useState<TermeGlossaire[]>(data?.termes || []);

  useEffect(() => {
    setSortedTermes(data?.termes || []);
  }, [data]);

  const renderGlossaireList = (items: TermeGlossaire[]) => (
    <dl className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="bg-sky-50 dark:bg-sky-900/50 border-l-4 border-sky-500 dark:border-sky-400 p-4 rounded-r-md shadow-sm">
          <dt className="font-semibold text-sky-700 dark:text-sky-300 mb-1">{item.terme || "Terme"}</dt>
          <dd className="text-sm text-sky-800 dark:text-sky-200">{item.definition || "Définition non fournie."}</dd>
        </div>
      ))}
    </dl>
  );

  return renderSectionShell(
    "glossaire",
    data,
    "Glossaire",
    "📚",
    bibleTitle,
    "Données de glossaire non disponibles.",
    <>
      <Paragraph content="Termes spécifiques et définitions clés de votre univers." />
       <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
            <SubTitle text="Termes du Glossaire" className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-200 mt-0 mb-0"/>
            {data?.termes && data.termes.length > 0 && (
                 <SortControls
                    data={data.termes}
                    sortKey="terme"
                    onSort={setSortedTermes}
                    buttonTextPrefix="Trier par Terme"
                />
            )}
        </div>
        {sortedTermes.length > 0
            ? renderGlossaireList(sortedTermes)
            : createDefaultMessage("Aucun terme défini dans le glossaire.")
        }
      </div>
    </>
  );
};

export default GlossaireTab;
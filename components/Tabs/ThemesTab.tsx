import React from 'react';
import { ThemesSection as ThemesSectionType } from '../../types';
import { SectionTitle, SubTitle, Paragraph, renderSectionShell, createDefaultMessage } from './TabContentUtils';
import Card from '../UI/Card';

interface ThemesTabProps {
  data?: ThemesSectionType;
  bibleTitle?: string;
}

const ThemesTab: React.FC<ThemesTabProps> = ({ data, bibleTitle }) => {
  return renderSectionShell(
    "themes",
    data,
    "Thèmes & Signification",
    "💡",
    bibleTitle,
    "Données de thèmes non disponibles.",
    <>
      <Paragraph content="Explorez les thèmes centraux et la signification profonde de votre projet." />
      {data?.themesPrincipaux && data.themesPrincipaux.length > 0 ? (
        <div className="mt-6 space-y-6">
          {data.themesPrincipaux.map((themeObj, index) => (
            <Card key={index} title={themeObj.theme || "Thème"} icon="psychology_alt" additionalClasses="border-l-4 border-amber-500 dark:border-amber-400">
                {themeObj.exploration && <Paragraph content={themeObj.exploration} className="text-sm text-slate-600 dark:text-slate-400"/>}
            </Card>
          ))}
        </div>
      ) : (
        createDefaultMessage("Aucun thème principal défini.")
      )}
    </>
  );
};

export default ThemesTab;
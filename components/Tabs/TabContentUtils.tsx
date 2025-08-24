import React from 'react';
import NotesSection from '../UI/NotesSection';

export const SectionTitle: React.FC<{ title: string; icon?: string }> = ({ title, icon }) => (
  <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-6 border-b-2 border-teal-500 dark:border-teal-600 pb-3 flex items-center">
    {icon && <span className="material-icons-outlined mr-2 text-2xl sm:text-3xl text-teal-600 dark:text-teal-400">{icon}</span>}
    {title || "Titre non défini"}
  </h2>
);

export const SubTitle: React.FC<{ text: string; className?: string }> = ({ text, className = 'text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-200 mt-8 mb-4' }) => (
  <h3 className={className}>{text || "Sous-titre non défini"}</h3>
);

export const Paragraph: React.FC<{ content: string | undefined | null; className?: string, isHtml?: boolean }> = ({ content, className = 'text-slate-700 dark:text-slate-300 leading-relaxed mb-4', isHtml = true }) => {
  if (!content) return null;
  if (isHtml) {
    return <p className={className} dangerouslySetInnerHTML={{ __html: String(content).replace(/\n/g, '<br />') }} />;
  }
  return <p className={className}>{content}</p>;
};

export const renderSectionShell = (
    sectionId: string, 
    data: any | undefined | null, 
    titleText: string, 
    icon: string, 
    bibleTitle: string | undefined,
    noDataMessage: string, 
    children: React.ReactNode
    ) => {
    if (!data) {
        return (
            <div className="p-4">
                <SectionTitle title={titleText} icon={icon} />
                <p className='text-center text-slate-500 dark:text-slate-400 p-8 italic'>{noDataMessage}</p>
                <NotesSection sectionId={sectionId} bibleTitle={bibleTitle} />
            </div>
        );
    }
    return (
        <div className="p-4">
            <SectionTitle title={data.titre || titleText} icon={icon} />
            {children}
            <NotesSection sectionId={sectionId} bibleTitle={bibleTitle} />
        </div>
    );
};

export const createDefaultMessage = (message: string) => (
    <p className="text-center text-slate-500 dark:text-slate-400 p-8 italic">{message}</p>
);
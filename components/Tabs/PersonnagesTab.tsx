import React, { useState, useEffect } from 'react';
import { PersonnagesSection as PersonnagesSectionType, Heros, PersonnagePrincipal, BasePersonnage } from '../../types';
import { SectionTitle, SubTitle, Paragraph, renderSectionShell, createDefaultMessage } from './TabContentUtils';
import Card from '../UI/Card';
import Modal from '../UI/Modal';
import SortControls from '../UI/SortControls';

interface PersonnagesTabProps {
  data?: PersonnagesSectionType;
  bibleTitle?: string;
  onOpenModal: (content: React.ReactNode, title?: string) => void;
}

const PersonnagesTab: React.FC<PersonnagesTabProps> = ({ data, bibleTitle, onOpenModal }) => {
  const [sortedPersonnages, setSortedPersonnages] = useState<PersonnagePrincipal[]>(data?.personnagesPrincipaux || []);

  useEffect(() => {
    setSortedPersonnages(data?.personnagesPrincipaux || []);
  }, [data]);

  const openCharacterDetailsModal = (character: Heros | PersonnagePrincipal) => {
    const detailsMap: { [key: string]: string | undefined | null } = {
      "Psychologie & Motivation": character.psychologieMotivation,
      "Rôle Narratif": character.roleNarratif,
      "Arc Narratif": character.arc,
      "Prompt IA (Visuel)": character.promptDescription ? `<em>${character.promptDescription}</em>` : null,
    };

    if ('age' in character) { 
        detailsMap["Âge"] = (character as Heros).age;
        detailsMap["Origine/Background"] = (character as Heros).origine;
        detailsMap["Métier/Rôle"] = (character as Heros).metier;
        detailsMap["Physique"] = (character as Heros).physique;
        detailsMap["Style Vestimentaire"] = (character as Heros).styleVestimentaire;
        detailsMap["Accessoire(s) Clé(s)"] = (character as Heros).accessoireCle;
        detailsMap["Acteur/Actrice de Référence"] = (character as Heros).acteurReference;
        detailsMap["Liens Canoniques"] = (character as Heros).liensCanoniques;
    } else { 
        detailsMap["Liens Canoniques"] = (character as PersonnagePrincipal).liensCanoniques;
        detailsMap["Acteur/Actrice de Référence"] = (character as PersonnagePrincipal).acteurReference;
    }


    const modalContent = (
      <div className="text-slate-800 dark:text-slate-200"> 
        {Object.entries(detailsMap).map(([label, value]) => {
          if (value) {
            return <Paragraph key={label} content={`<strong>${label}:</strong> ${value}`} className="mb-2 text-sm text-slate-800 dark:text-slate-200"/>;
          }
          return null;
        })}
      </div>
    );
    onOpenModal(modalContent, `${character.icon || '👤'} ${character.nomComplet || character.nom}`);
  };
  
  const renderPersonnagesList = (items: PersonnagePrincipal[]) => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((char) => (
        <Card 
          key={char.id} 
          title={char.nom} 
          icon={char.icon || '👤'}
          onClick={() => openCharacterDetailsModal(char)}
          additionalClasses="transform hover:-translate-y-1"
        >
          <Paragraph content={char.roleNarratif ? char.roleNarratif.substring(0, 120) + (char.roleNarratif.length > 120 ? '...' : '') : 'Rôle à définir'} />
        </Card>
      ))}
    </div>
  );


  return renderSectionShell(
    "personnages",
    data,
    "Personnages",
    "🧍",
    bibleTitle,
    "Données de personnages non disponibles.",
    <>
      <Paragraph content="Les personnages sont le cœur émotionnel de votre projet. Cliquez sur une carte pour plus de détails." />
      {data?.heros && (
        <div className="mb-10 p-6 bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-2xl text-white"> 
          <h3 className="text-2xl sm:text-3xl font-bold text-teal-300 dark:text-teal-200 mb-4 flex items-center"> 
            <span className="text-3xl sm:text-4xl mr-3">{data.heros.icon || '🦸'}</span>
            {data.heros.nomComplet || "Protagoniste"}
          </h3>
          {[
            `<strong>Âge:</strong> ${data.heros.age || 'N/A'}`,
            `<strong>Origine:</strong> ${data.heros.origine || 'N/A'}`,
            `<strong>Métier/Rôle:</strong> ${data.heros.metier || 'N/A'}`,
            `<strong>Physique:</strong> ${data.heros.physique || 'N/A'}`,
            `<strong>Style:</strong> ${data.heros.styleVestimentaire || 'N/A'}`,
            `<strong>Accessoire Clé:</strong> ${data.heros.accessoireCle || 'N/A'}`,
            `<strong>Acteur de Référence:</strong> ${data.heros.acteurReference || 'N/A'}`,
            `<strong>Psychologie & Motivation:</strong> ${data.heros.psychologieMotivation || 'N/A'}`,
            `<strong>Rôle Narratif:</strong> ${data.heros.roleNarratif || 'N/A'}`,
            `<strong>Arc Narratif:</strong> ${data.heros.arc || 'N/A'}`,
          ].map((detailHTML, idx) => (
            <Paragraph key={idx} content={detailHTML} className="text-slate-300 dark:text-slate-400 leading-relaxed mb-1.5 text-sm sm:text-base" />
          ))}
          {data.heros.promptDescription && (
            <Paragraph content={`<strong>Prompt IA (Visuel):</strong> <em>${data.heros.promptDescription}</em>`} className="text-xs text-slate-400 dark:text-slate-500 mt-3 italic" />
          )}
           <button 
            onClick={() => data.heros && openCharacterDetailsModal(data.heros)}
            className="mt-4 text-sm bg-teal-500 hover:bg-teal-400 text-white font-medium py-1.5 px-3 rounded-md transition" 
          >
            Voir plus de détails
          </button>
        </div>
      )}
       <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <SubTitle text="Autres Personnages Principaux" className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-200 mt-0 mb-0" />
           {data?.personnagesPrincipaux && data.personnagesPrincipaux.length > 0 && (
             <SortControls
                data={data.personnagesPrincipaux}
                sortKey="nom"
                onSort={setSortedPersonnages}
            />
           )}
        </div>
        {sortedPersonnages.length > 0
            ? renderPersonnagesList(sortedPersonnages)
            : createDefaultMessage("Aucun autre personnage principal défini.")
        }
      </div>
    </>
  );
};

export default PersonnagesTab;
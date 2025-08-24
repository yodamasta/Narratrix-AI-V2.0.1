
import React, { useState, useCallback } from 'react';
import { PagerGeneratorSection as PagerGeneratorSectionType, BibleData, PagerSectionContent } from '../../../types';
import { SectionTitle, Paragraph, renderSectionShell } from '../TabContentUtils';
import Button from '../../UI/Button';
import Loader from '../../UI/Loader';
import { generateText, isGeminiApiKeyAvailable } from '../../../services/geminiService';
import { API_KEY_ERROR_MESSAGE, getCopyrightNotice } from '../../../constants'; // Import copyright notice
import { copyTextToClipboard } from '../../../services/bibleUtils';

interface PagerGeneratorTabProps {
  data?: PagerGeneratorSectionType; 
  bibleData: BibleData | null; 
  bibleTitle?: string;
  onSetStatusMessageGlobal: (message: string, isError?: boolean) => void;
}

// Data extracted from the PDF "Cas pratique: RÊVES DE MAMAN"
const CAS_PRATIQUE_DATA = {
  projectInfo: {
    title: "RÊVES DE MAMAN",
    subtitle: "Une aventure mère-fille extraordinaire", // Invented for completeness
  },
  pitchSection: {
    logline: "Déterminée à réaliser les rêves les plus fous de sa mère, une créatrice transforme l'impossible en une série d'aventures mémorables, touchantes et pleines d'humour.",
    pitchGlobal: "Rencontrer le Dalaï Lama, exposer une peinture au Louvre, valser avec Richard Gere à Versailles... Dans la surprise la plus totale, Natoo réalise les rêves les plus fous de sa maman. Déterminée à réaliser son rêve : la créatrice veut faire de ceux de sa mère, une réalité.",
    positionnement: {
        type: "Série Documentaire Feuilletonnante",
        cible: "Grand public, familles, amateurs d'histoires inspirantes",
        format: "4-5 épisodes de 22 minutes"
    },
    referencesTonEsthetique: [
        "LITTLE MISS SUNSHINE (pour l'humour et l'émotion)",
        "VOYAGE EN TERRE INCONNUE (pour la découverte et l'authenticité)",
        "UNBREAKABLE KIMMY SCHMIDT et GILMORE GIRLS (pour la complicité et la fantaisie)"
    ],
    ambianceSpecifique: "Émouvant, drôle, inspirant, avec une touche de fantaisie et beaucoup d'authenticité."
  },
  themesSection: {
    themesPrincipaux: [
        { theme: "Relation Mère-Fille", exploration: "Explorer la force et la complicité du lien unique entre une mère et sa fille."},
        { theme: "Réalisation des Rêves", exploration: "Montrer qu'il n'est jamais trop tard pour rêver et qu'avec de la détermination, l'impossible devient possible."},
        { theme: "Altruisme et Amour Familial", exploration: "Mettre en lumière la joie de donner et de faire plaisir à ses proches."},
        { theme: "Découverte et Ouverture d'Esprit", exploration: "Voyager et s'ouvrir à de nouvelles cultures et expériences."}
    ]
  },
  // Custom fields for Pager based on PDF "Cas Pratique"
  pagerSpecific: {
    angle: "Chaque épisode est un rêve réalisé, charté ainsi : \"Teaser, trajet, rencontre/activité, conclusion et ressenti.\" La réalisation est dynamique, découpée, alternant le point de vue de Nathalie (organisatrice) et Ursula (la mère). Natoo narre les flashbacks et phases de voyage. Les trajets se font à bord de la \"Natmobile\".",
    strategieSociale: "Un début de saison intime et complice entre une mère et sa fille, culminant avec un final grandiose diffusé le jour de la fête des mères, impliquant un événement à l'échelle nationale.",
    arcNarratifOuEpisodes: [
        "Une journée à Versailles : Visite avec Stéphane Bern, bal géant en costumes d'époque dans la galerie des glaces... avec Richard Gere.",
        "La rencontre d'une vie : Ursula rêve du Bhoutan. Une fois sur place, Nathalie lui annonce la rencontre avec le Dalaï Lama à Kangra-Lambagraon.",
        "Cabaret sauvage : Ursula au Lido pour la fête des mères, mise en lumière avec d'autres mamans pour un show.",
        "Ursularmy : Ursula et Alain aident les Malgaches (médicaments, vivres...). Spot TV avec des associations pour une aide à grande échelle.",
        "Haute en couleur : Ursula, peintre, rencontre son artiste préféré. Surprise : son œuvre est exposée au Louvre le temps d'une soirée."
      ].join('\n')
  }
};


const PagerGeneratorTab: React.FC<PagerGeneratorTabProps> = ({ data, bibleData, bibleTitle, onSetStatusMessageGlobal }) => {
  const [pagerContent, setPagerContent] = useState<PagerSectionContent[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const getPagerSectionsConfig = useCallback((currentBibleData: BibleData | null, currentCasPratique: typeof CAS_PRATIQUE_DATA): PagerSectionContent[] => {
    const dataSource = currentBibleData || currentCasPratique;
    const isCasPratique = !currentBibleData;

    return [
    {
        id: 'projectHeader',
        title: '', 
        content: '',
        dataExtractor: () => (
            <>
                <h1 className="text-3xl font-bold text-center !text-black mb-1">{dataSource.projectInfo.title}</h1>
                {dataSource.projectInfo.subtitle && <p className="text-lg text-center !text-teal-600 font-semibold mb-2">{dataSource.projectInfo.subtitle}</p>}
                <p className="text-md text-center !text-black italic mb-6">{dataSource.pitchSection.logline}</p>
            </>
        )
    },
    {
        id: 'leConcept',
        title: "Le Concept",
        content: '',
        dataExtractor: () => isCasPratique ? currentCasPratique.pitchSection.pitchGlobal : null,
        isAIGenerated: true,
        aiPrompt: (b, cp) => {
            const context = b ? `la logline ("${b.pitchSection.logline}") et le pitch global ("${b.pitchSection.pitchGlobal}")` : `le texte suivant: "${cp?.pitchSection.pitchGlobal}"`;
            return `En 2-3 lignes maximum, avec uneapproche marketing et en évitant les listes à puces, résume le concept central (la prémisse) du projet basé sur ${context}. Qu'est-ce que ça raconte ?`;
        }
    },
    {
        id: 'leFormat',
        title: "Le Format",
        content: '',
        dataExtractor: () => {
            const pos = dataSource.pitchSection.positionnement;
            const ambiance = dataSource.pitchSection.ambianceSpecifique;
            return `Type: ${pos.type}\nTon & Genre: ${ambiance ? ambiance.split('.')[0] : 'N/A'} (Genre principal: ${pos.type})\nDurée/Structure: ${pos.format}\nCible: ${pos.cible}`;
        }
    },
    {
        id: 'lesReferences',
        title: "Les Références",
        content: '',
        dataExtractor: () => {
            const refs = dataSource.pitchSection.referencesTonEsthetique;
            return refs.length > 0 ? 
                (<ul className="list-disc list-inside pl-1 !text-black">{refs.map((ref, i) => <li key={i}>{ref}</li>)}</ul>) 
                : "Aucune référence spécifiée."
        }
    },
    {
        id: 'votreAngle',
        title: "Votre Angle",
        content: '',
        dataExtractor: () => isCasPratique ? currentCasPratique.pagerSpecific.angle : null,
        isAIGenerated: true, 
        aiPrompt: (b, cp) => {
            const context = b ? `l'ambiance spécifique ("${b.pitchSection.ambianceSpecifique || 'non définie'}"), l'intention de l'auteur ("${b.pitchSection.intentionAuteur || 'non définie'}") et les thèmes principaux ("${b.themesSection?.themesPrincipaux.map(t => t.theme).join(', ') || 'Non définis'}")` : `le texte suivant sur l'angle: "${cp?.pagerSpecific.angle}"`;
            return `Décris en 1 à 3 phrases concises 'Votre Angle' pour ce projet. Comment le projet sera-t-il présenté et ressenti par le public ? Quelles sont la structure et les besoins nécessaires pour le réaliser ? Base-toi sur ${context}.`;
        },
    },
    {
        id: 'strategieSociale',
        title: "Stratégie Sociale",
        content: '',
        dataExtractor: () => isCasPratique ? currentCasPratique.pagerSpecific.strategieSociale : null,
        isAIGenerated: true,
        aiPrompt: (b, cp) => {
            const context = b ? `le public cible ("${b.pitchSection.positionnement.cible}"), le genre ("${b.pitchSection.positionnement.type}") et le pitch global ("${b.pitchSection.pitchGlobal}")` : `le texte suivant sur la stratégie sociale: "${cp?.pagerSpecific.strategieSociale}"`;
            return `Propose une idée de stratégie sociale ou une approche transmédia en 1-2 phrases pour ce projet. Comment impliquer les viewers ? Quelle est la portée du projet ? Base-toi sur ${context}.`;
        },
    },
    {
        id: 'larcNarratif',
        title: "L'Arc Narratif",
        content: '',
        dataExtractor: () => isCasPratique ? currentCasPratique.pagerSpecific.arcNarratifOuEpisodes : null,
        isAIGenerated: true,
        aiPrompt: (b, cp) => {
            if (b) { 
                let storyInfo = `la structure narrative globale ("${b.structureSaisonSection?.structureGlobale?.progression || 'Non définie'}"). `;
                if (b.structureSaisonSection?.arcsMajeursSaison1 && b.structureSaisonSection.arcsMajeursSaison1.length > 0) {
                    storyInfo += `Le premier acte majeur est: "${b.structureSaisonSection.arcsMajeursSaison1[0].description || 'Non défini'}". `;
                } else if (b.structureSaisonSection?.episodesSaison1 && b.structureSaisonSection.episodesSaison1.length > 0) {
                     storyInfo += `Le premier épisode/chapitre est: "${b.structureSaisonSection.episodesSaison1[0].resume || 'Non défini'}". `;
                }
                storyInfo += `L'arc du héros ("${b.personnagesSection?.heros?.nom || 'Le protagoniste'}") est: "${b.personnagesSection?.heros?.arc || 'Non défini'}".`;
                 return `En 3-4 lignes maximum, décris l'arc narratif principal ou les idées d'épisodes clés du projet (selon si c'est un film, une série ou une émission). Pour une série, donne quelques idées d'épisodes. Pour un film, étoffe le concept en pitch de 5-10 lignes. Pour une émission, détaille la mécanique. Base-toi sur ${storyInfo}.`;
            } else { 
                return `Résume en 3-4 lignes maximum les propositions d'épisodes suivantes: "${cp?.pagerSpecific.arcNarratifOuEpisodes}".`;
            }
        }
    },
    {
        id: 'themesEtValeurs',
        title: "Thèmes et Valeurs",
        content: '',
        dataExtractor: () => {
            const themes = dataSource.themesSection?.themesPrincipaux;
            if (themes && themes.length > 0) {
                 return (<ul className="list-disc list-inside pl-1 !text-black">{themes.map((t, i) => <li key={i}><strong>{t.theme}:</strong> {t.exploration}</li>)}</ul>);
            }
            return isCasPratique ? (currentCasPratique as any).themesSection.themesPrincipaux.map((t:any) => `${t.theme}: ${t.exploration}`).join('\n') : "Thèmes et valeurs non spécifiés.";
        }
    }
  ]}, []);


  const handleGeneratePager = async () => {
    const currentBible = bibleData; 
    if (!currentBible && !CAS_PRATIQUE_DATA.projectInfo.title) { 
      onSetStatusMessageGlobal("Impossible de générer le pager sans données.", true);
      return;
    }
    const sectionsConfig = getPagerSectionsConfig(currentBible, CAS_PRATIQUE_DATA);
    if (!isApiKeyAvail && sectionsConfig.some(s => s.isAIGenerated && s.aiPrompt && (!s.dataExtractor || s.dataExtractor(currentBible, CAS_PRATIQUE_DATA) === null))) {
        onSetStatusMessageGlobal(API_KEY_ERROR_MESSAGE + " Certaines sections du pager nécessitent l'IA.", true);
    }

    setIsLoading(true);
    onSetStatusMessageGlobal("Génération du Pager en cours...", false);
    
    const processedSections: PagerSectionContent[] = [];

    for (const section of sectionsConfig) {
        let currentContent: string | React.ReactNode = ""; 
        let generatedByAI = false;

        if (section.dataExtractor) {
            const extracted = section.dataExtractor(currentBible, CAS_PRATIQUE_DATA);
            if (extracted !== null && extracted !== undefined && extracted !== '') {
                currentContent = extracted;
            }
        }
        
        if ((currentContent === '' || currentContent === null) && section.isAIGenerated && section.aiPrompt) {
            if (isApiKeyAvail) {
                try {
                    const prompt = section.aiPrompt(currentBible, CAS_PRATIQUE_DATA);
                    if (prompt) { 
                        const aiGeneratedText = await generateText(prompt, `Tu es un expert en rédaction de pitchs et de documents de présentation concis pour des projets créatifs. Ta réponse doit être brève et aller droit au but pour la section "${section.title}". Formatte ta réponse en texte brut, sans markdown.`, true);
                        currentContent = aiGeneratedText.trim();
                        generatedByAI = true;
                    } else if (!currentContent){ 
                        currentContent = "Contenu de démo (direct) ou à définir.";
                    }
                } catch (error: any) {
                    console.error(`Erreur IA pour section ${section.title}:`, error);
                    currentContent = `Erreur lors de la génération du contenu pour cette section.`;
                    onSetStatusMessageGlobal(`Erreur IA pour la section '${section.title}'.`, true);
                }
            } else {
                 currentContent = "Contenu IA non généré (clé API Gemini manquante).";
            }
        } else if (currentContent === '' || currentContent === null) {
            currentContent = "Contenu non défini pour cette section.";
        }
        processedSections.push({ ...section, content: currentContent, isAIGenerated: generatedByAI });
    }

    setPagerContent(processedSections);
    setIsLoading(false);
    onSetStatusMessageGlobal("Pager généré !", false);
  };

  const getPagerTextForCopy = (): string => {
    if (!pagerContent) return "";
    return pagerContent.map(section => {
        let text = "";
        const currentDataSource = bibleData || CAS_PRATIQUE_DATA;
        const isCasPratique = !bibleData;

        if (section.id === 'projectHeader') {
            text += `${currentDataSource.projectInfo.title}\n`;
            if(currentDataSource.projectInfo.subtitle) text += `${currentDataSource.projectInfo.subtitle}\n`;
            text += `Logline: ${currentDataSource.pitchSection.logline}\n\n`;
        } else {
            text += `${section.title}\n`;
        }
        
        if (typeof section.content === 'string') {
            text += section.content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim() + "\n\n";
        } else if (React.isValidElement(section.content) && section.id === 'lesReferences') {
            const refs = isCasPratique ? CAS_PRATIQUE_DATA.pitchSection.referencesTonEsthetique : (currentDataSource as BibleData).pitchSection?.referencesTonEsthetique;
            if(refs) text += refs.join('\n') + "\n\n";
        } else if (React.isValidElement(section.content) && section.id === 'themesEtValeurs') {
             const themes = (currentDataSource as any).themesSection?.themesPrincipaux;
             if(themes) text += themes.map((t:any) => `${t.theme}: ${t.exploration}`).join('\n') + "\n\n";
        }
         else {
            let extractedText = '';
            React.Children.forEach(section.content, child => {
                if (typeof child === 'string') {
                    extractedText += child;
                } else if (React.isValidElement(child)) {
                    const elementProps = (child as React.ReactElement<any>).props;
                    if (elementProps && typeof elementProps.children === 'string') {
                        extractedText += elementProps.children;
                    }
                }
            });
            text += extractedText.trim() ? extractedText.trim() + "\n\n" : `[Contenu non textuel pour "${section.title}"]\n\n`;
        }
        return text;
    }).join('');
  };

  const handleCopyPager = () => {
    const textToCopy = getPagerTextForCopy();
    if (textToCopy) {
      copyTextToClipboard(textToCopy)
        .then(() => onSetStatusMessageGlobal("Pager copié dans le presse-papiers !", false))
        .catch(() => onSetStatusMessageGlobal("Erreur lors de la copie du pager.", true));
    }
  };

  const handleDownloadPager = () => {
    let textToCopy = getPagerTextForCopy();
    if (textToCopy) {
      try {
        textToCopy += getCopyrightNotice(); // Add copyright notice
        const blob = new Blob([textToCopy], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const currentDataSource = bibleData || CAS_PRATIQUE_DATA;
        const safeTitle = currentDataSource.projectInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `pager_${safeTitle}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        onSetStatusMessageGlobal("Pager téléchargé avec succès !", false);
      } catch (error) {
        console.error("Error downloading pager:", error);
        onSetStatusMessageGlobal("Erreur lors du téléchargement du pager.", true);
      }
    }
  };


  return renderSectionShell(
    "pager_generator",
    data || { titre: "Générateur de Pager", introduction:"Créez un 'One-Pager' concis pour présenter votre projet."},
    data?.titre || "Générateur de Pager",
    "article",
    bibleTitle,
    "Configuration du Générateur de Pager non disponible.",
    <>
      <Paragraph content={data?.introduction || "Cet outil vous aide à générer un 'One-Pager' synthétique à partir des informations de votre Bible Universelle ou d'un exemple pratique (basé sur le cours 'Le Pager'). Certaines sections peuvent utiliser l'IA pour assurer la concision."} />
      
      <div className="my-6 text-center">
        <Button 
            onClick={handleGeneratePager} 
            isLoading={isLoading}
            disabled={isLoading || (!bibleData && !CAS_PRATIQUE_DATA.projectInfo.title) || (!isApiKeyAvail && getPagerSectionsConfig(bibleData, CAS_PRATIQUE_DATA).some(s => s.isAIGenerated && s.aiPrompt && (!s.dataExtractor || s.dataExtractor(bibleData, CAS_PRATIQUE_DATA) === null) ) ) }
            variant="primary"
            icon="description"
            size="lg"
        >
          Générer le Pager
        </Button>
        { !isApiKeyAvail && getPagerSectionsConfig(bibleData, CAS_PRATIQUE_DATA).some(s => s.isAIGenerated && s.aiPrompt && (!s.dataExtractor || s.dataExtractor(bibleData, CAS_PRATIQUE_DATA) === null) ) && 
            <p className="text-xs text-red-500 mt-1">{API_KEY_ERROR_MESSAGE} (Certaines sections du pager en dépendent)</p>
        }
      </div>

      {isLoading && <Loader message="Génération du Pager en cours..." />}
      
      {pagerContent && !isLoading && (
        <div className="mt-8 p-6 sm:p-8 bg-white shadow-xl rounded-lg border border-slate-200">
          <div className="flex justify-end mb-4 print:hidden gap-2">
            <Button onClick={handleCopyPager} icon="content_copy" variant="secondary" size="sm">
                Copier le Pager
            </Button>
            <Button onClick={handleDownloadPager} icon="download" variant="success" size="sm">
                Télécharger (.txt)
            </Button>
          </div>
          <div className="prose prose-slate max-w-none pager-prose-black prose-headings:!text-black prose-h2:border-b prose-h2:border-slate-300 prose-h2:pb-1 prose-h2:mb-3 prose-p:!text-black prose-li:!text-black prose-strong:!text-black">
            {pagerContent.map((section, index) => (
              <div key={section.id || index} className={section.id !== 'projectHeader' ? "mb-5" : ""}>
                {section.id === 'projectHeader' && React.isValidElement(section.content) ? (
                    section.content 
                ) : section.id === 'projectHeader' && typeof section.content === 'string' ? (
                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                ) : (
                    <>
                        {section.title && <h2 className="text-xl font-semibold !text-black">{section.title}</h2>}
                        {typeof section.content === 'string' ? 
                            <Paragraph content={section.content} className="text-sm whitespace-pre-line !text-black" isHtml={false}/> 
                            : React.isValidElement(section.content) ? section.content
                            : <Paragraph content={"Contenu non disponible"} className="text-sm !text-black"/>
                        }
                    </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
       {!isLoading && !pagerContent && (
        <div className="text-center text-slate-500 mt-8 p-6 bg-slate-50 rounded-lg">
          <p>Cliquez sur "Générer le Pager" pour créer votre document de présentation.<br/>Utilisera les données de la Bible chargée, ou un exemple basé sur le cours "Le Pager" si aucune Bible n'est chargée.</p>
        </div>
      )}
    </>
  );
};

export default PagerGeneratorTab;


import { BibleData } from './types';

export const APP_NAME = "Narratrix-AI"; // Nouveau nom de l'application
export const APP_VERSION = "V2.0.1"; // Version de l'application

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002';

export const COMPLETE_BLANK_BIBLE_STRUCTURE: BibleData = {
    projectInfo: {
        title: "Titre de Votre Projet/Bible",
        subtitle: "Sous-titre ou slogan",
        version: "1.0",
        author: "Votre Nom"
    },
    pitchSection: {
        titre: "Pitch & Intention",
        pitchGlobal: "Pitch global de votre histoire (1-3 paragraphes).",
        logline: "Logline concise (1-2 phrases).",
        intentionAuteur: "Quelle est votre intention en tant qu'auteur ?",
        positionnement: {
            type: "Série TV / Film / Jeu Vidéo / Roman...",
            cible: "Public cible (âge, intérêts).",
            format: "Durée épisodes, nombre de saisons prévues, type de jeu..."
        },
        referencesTonEsthetique: [
            "Référence 1 (Film, Série, Livre, Jeu)",
            "Référence 2 (Ambiance visuelle, musicale)"
        ],
        ambianceSpecifique: "Description de l'ambiance (ex: Thriller psychologique sombre et angoissant avec des touches de surnaturel.)"
    },
    universSection: {
        titre: "Univers",
        introduction: "Présentation générale de l'univers (époque, lieu principal, contexte).",
        fondationsSystemeMemoire: "Si votre univers repose sur un système spécifique (magie, technologie avancée, etc.), décrivez ses fondations ici.",
        elementsUniques: [
            {
                id: "concept_poudre_etoiles_IDUNIQUE", 
                nom: "Concept Unique 1 (ex: La Poudre d'Étoiles)",
                description: "Description de ce concept, ses origines, ses effets.",
                icon: "✨",
                relations: [
                    { targetId: "hero_main_protagonist_IDUNIQUE", type: "est_recherchee_par", details: "Le protagoniste croit qu'elle peut sauver son peuple."}
                ]
            }
        ]
    },
    systemeMemoireSection: {
        titre: "Système Principal / Mécaniques Clés",
        introductionSysteme: "Introduction au système principal qui régit votre univers (si applicable).",
        typesElementsSysteme: [
            {
                id: "sys_souvenirs_actifs_IDUNIQUE", 
                nom: "Type d'Élément 1 (ex: Souvenirs Actifs)",
                nature: "Nature de cet élément (physique, psychique, informationnel...).",
                fonctionNarrative: "Son rôle dans l'histoire.",
                icon: "🧩",
                relations: [] 
            }
        ],
        reglesCruciales: {
          regleImpactante: {
            titre: "Règle à Impact Fort",
            description: "Description de la règle qui a un fort impact.",
            impacts: [{niveau: "Faible", effet: "Effet faible"}, {niveau: "Moyen", effet: "Effet moyen"}],
            labelsImpact: ["Faible", "Moyen"],
            dataPointsImpact: [3, 6],
          },
          autreRegleImportante: {
            titre: "Autre Règle Importante",
            description: "Description de l'autre règle importante.",
            phraseCle: "Une phrase clé illustrant la règle."
          },
          elementSpecifiqueSysteme: {
            titre: "Élément Spécifique du Système",
            description: "Description de cet élément spécifique.",
            role: "Rôle principal de l'élément."
          }
        }
    },
    personnagesSection: {
        titre: "Personnages",
        heros: {
            id: "hero_main_protagonist_IDUNIQUE", 
            nomComplet: "Nom Complet du Protagoniste",
            nom: "Prénom du Protagoniste", 
            icon: "🦸",
            age: "Âge",
            origine: "Origine, background.",
            metier: "Métier ou rôle principal.",
            physique: "Description physique.",
            styleVestimentaire: "Style vestimentaire.",
            accessoireCle: "Un accessoire ou objet distinctif.",
            acteurReference: "Acteur/Actrice de référence (pour inspiration).",
            psychologieMotivation: "Psychologie, motivations, peurs, désirs.",
            roleNarratif: "Son rôle dans l'histoire (ex: Le catalyseur, le mentor).",
            arc: "Arc narratif principal prévu.",
            promptDescription: "Prompt IA pour visuel (ex: Portrait d'un homme de 30 ans...)",
            relations: [ 
                { targetId: "perso_secondaire_IDUNIQUE", type: "Allié(e) fidèle", details: "Se connaissent depuis l'enfance." }
            ]
        },
        personnagesPrincipaux: [
            {
                id: "perso_secondaire_IDUNIQUE", 
                nom: "Nom Personnage Secondaire 1",
                icon: "🧑",
                roleNarratif: "Son rôle...",
                psychologieMotivation: "Psychologie...",
                arc: "Arc narratif...",
                liensCanoniques: "Liens...",
                promptDescription: "Prompt IA...",
                acteurReference: "Acteur/Actrice de référence (pour inspiration).", // Added acteurReference
                relations: [
                     { targetId: "hero_main_protagonist_IDUNIQUE", type: "Ami(e) / Rival(e) de" }
                ]
            }
        ]
    },
    environnementsSection: {
        titre: "Environnements & Lieux Clés",
        laVille: { 
            id: "lieu_cite_IDUNIQUE", 
            nom: "Nom de la Ville / Région Principale",
            description: "Description générale...",
            icon: "🏙️",
            relations: [] 
        },
        lieux: [
            {
                id: "lieu_labo_IDUNIQUE", 
                nom: "Lieu Important 1 (ex: Le Laboratoire Oublié)",
                icon: "🔬",
                description: "Description...",
                importanceNarrative: "Importance...",
                ambiance: "Ambiance...",
                refletEtatMental: "Reflet...",
                manifestationEntites: "Manifestations...",
                relations: []
            }
        ]
    },
    objetsMysteresSection: {
        titre: "Objets Importants & Enjeux Clés",
        objets: [
            {
                id: "objet_artefact_IDUNIQUE", 
                nom: "Objet Important 1 (ex: L'Artefact Ancien)",
                icon: "💎",
                type: "Type...",
                description: "Description...",
                origine: "Origine...",
                fonction: "Fonction...",
                danger: "Danger...",
                utilisationNarrative: "Utilisation...",
                relations: []
            }
        ]
    },
    chronologieSection: {
        titre: "Chronologie Principale",
        introduction: "Une vue d'ensemble des événements clés de l'univers et de l'histoire.",
        evenements: [
            { id: "event1", content: "Fondation de la Première Colonie", start: "0235-05-10", group: "Ère des Fondations", className: "fondation", details: "Les premiers colons arrivent sur Xylos..." },
            { id: "event2", content: "Le Grand Schisme", start: "0512-01-01", end: "0515-12-31", group: "Conflits Majeurs", className: "conflit-majeur", details: "Une guerre civile dévastatrice..." }
        ]
    },
    structureSaisonSection: {
        titre: "Structure Narrative",
        structureGlobale: {
            format: "Série TV, Film, etc.",
            progression: "Linéaire, Non-linéaire, etc."
        },
        arcsMajeursSaison1: [
            { acte: "Acte 1", objectifProtagoniste: "Objectif initial.", description: "Description de l'acte 1." }
        ],
        episodesSaison1: [
            { num: "1", titreProvisoire: "Titre de l'épisode 1", resume: "Résumé de l'épisode 1." }
        ],
        pointsDeConnexion: "Points de transition entre les parties."
    },
    themesSection: {
        titre: "Thèmes & Signification",
        themesPrincipaux: [
            { theme: "Thème Principal 1", exploration: "Comment ce thème est exploré." }
        ]
    },
    glossaireSection: {
        titre: "Glossaire",
        termes: [
            { terme: "Terme Spécifique 1", definition: "Définition du terme." }
        ]
    },
    journalProtagonisteSection: {
        titre: "Journal du Protagoniste",
        introduction: "Introduction au journal."
    },
    laboratoireIASection: {
        titre: "Laboratoire IA",
        introduction: "Introduction au laboratoire IA."
    },
    adaptikSection: { 
        titre: "ADAPTIK™ - Placement Narratif",
        introduction: "Suggestions et stratégies de placement de marques (fictives ou réelles adaptées) dans l'univers."
    },
    pagerGeneratorSection: { // New Section for Pager
        titre: "Générateur de Pager",
        introduction: "Créez un 'One-Pager' concis pour présenter votre projet."
    }
};

export const TABS_CONFIG = [
    { id: "dashboard", label: "Tableau de Bord", icon: "space_dashboard" }, // Nouvel onglet
    { id: "pitch", label: "Pitch & Intention", icon: "🎬" },
    { id: "univers", label: "Univers", icon: "🌍" },
    { id: "systeme_memoire", label: "Système Principal", icon: "🧠" },
    { id: "personnages", label: "Personnages", icon: "🧍" },
    { id: "environnements", label: "Environnements", icon: "🏞️" },
    { id: "objets_mysteres", label: "Objets & Mystères", icon: "📦" },
    { id: "chronologie", label: "Chronologie", icon: "⏳" },
    { id: "cartographie_relations", label: "Cartographie", icon: "lan" },
    { id: "structure", label: "Structure Narrative", icon: "🎞️" },
    { id: "themes", label: "Thèmes & Signification", icon: "💡" },
    { id: "glossaire", label: "Glossaire", icon: "📚" },
    { id: "journal_protagoniste", label: "Journal du Protagoniste", icon: "📖", dynamicLabelKey: "personnagesSection.heros.nom" },
    { id: "laboratoire_ia", label: "Laboratoire IA", icon: "🧪", newBadge: true },
    { id: "adaptik", label: "ADAPTIK™", icon: "auto_awesome", newBadge: true },
    { id: "pager_generator", label: "Générateur Pager", icon: "article", newBadge: true }, // New Tab for Pager
    { id: "processus_outils", label: "Processus & Outils", icon: "🛠️" },
];

export const INITIAL_LOADING_MESSAGE = `Bienvenue dans ${APP_NAME} ! Chargez une Bible JSON pour commencer.`;
export const API_KEY_ERROR_MESSAGE = "La clé API Gemini (process.env.API_KEY) n'est pas configurée. Les fonctionnalités IA sont désactivées.";

export const getCopyrightNotice = (): string => {
  const year = new Date().getFullYear();
  return `\n\n---\n© ${year} Saüla Mbelo. Tous droits réservés et propriété intellectuelle.\nCe contenu a été généré avec l'aide de l'application ${APP_NAME}.`;
};

export const TOUR_STEPS = [
  {
    selector: '.animated-welcome-box',
    title: "Bienvenue sur Narratrix-AI",
    content: "Ceci est votre centre de commande pour construire et explorer des univers narratifs. Suivez ce guide rapide pour découvrir les fonctionnalités clés.",
    position: 'bottom',
  },
  {
    selector: '#text-to-json-converter',
    title: "Démarrez avec l'IA",
    content: "Vous n'avez qu'une idée ? Décrivez-la ici, choisissez un style, et l'IA générera une Bible structurée complète pour vous. C'est le moyen le plus rapide de commencer !",
    position: 'bottom',
  },
  {
    selector: '#json-loader-section',
    title: "Chargez votre Univers",
    content: "Si vous avez déjà une Bible au format JSON, vous pouvez la charger directement en utilisant le sélecteur de fichier ou en collant son contenu dans la zone de texte.",
    position: 'top',
  },
  {
    selector: '#mainNav',
    title: "Navigation Principale",
    content: "Une fois un univers chargé, tous ces onglets deviendront accessibles pour explorer en détail chaque aspect de votre monde.",
    position: 'bottom',
  },
  {
    selector: 'body',
    title: "Vous êtes prêt !",
    content: "Vous avez maintenant toutes les clés en main. Chargez ou générez une Bible et commencez votre aventure créative. Un autre guide apparaîtra pour vous présenter les fonctionnalités post-chargement.",
    position: 'center',
  }
] as const;


export const POST_LOAD_TOUR_STEPS = [
  {
    selector: '#dashboard-grid',
    title: "Tableau de Bord",
    content: "Félicitations, votre univers est chargé ! Ceci est votre tableau de bord. Il vous donne un aperçu rapide de votre projet et des raccourcis vers les outils IA.",
    position: 'bottom',
  },
  {
    selector: '#globalSearchInput',
    title: "Recherche Globale",
    content: "Besoin de trouver rapidement une information ? Utilisez cette barre pour rechercher n'importe quel terme dans toute votre Bible.",
    position: 'bottom',
  },
  {
    selector: 'button[data-tab="cartographie_relations"]',
    title: "Cartographie des Relations",
    content: "Visualisez les liens complexes entre vos personnages, lieux et objets. C'est un excellent moyen de repérer de nouvelles opportunités narratives.",
    position: 'bottom',
    scrollInline: 'center',
  },
  {
    selector: 'button[data-tab="laboratoire_ia"]',
    title: "Le Laboratoire Créatif IA",
    content: "C'est ici que la magie opère ! Générez des visuels, des dialogues, des arcs de personnages et bien plus encore pour donner vie à votre histoire.",
    position: 'bottom',
    scrollInline: 'center',
  },
  {
    selector: 'button[aria-label="Ouvrir le chat avec l\'univers"]',
    title: "Discutez avec votre Univers",
    content: "Maintenant, vous pouvez vraiment engager une conversation avec vos personnages. Testez leurs personnalités et explorez des scénarios en temps réel.",
    position: 'left',
  },
  {
    selector: 'button[aria-label="Afficher l\'affiche du film"]',
    title: "Générateur d'Affiche",
    content: "Créez un visuel promotionnel (affiche de film, jaquette de jeu, etc.) pour votre projet en un seul clic, basé sur les informations de votre Bible.",
    position: 'left',
  },
  {
    selector: 'body',
    title: "Exploration Libre",
    content: "Le tour est terminé ! N'hésitez pas à explorer tous les onglets et outils à votre disposition. Vous pouvez relancer ce guide à tout moment depuis l'onglet 'Processus & Outils'.",
    position: 'center',
  }
] as const;
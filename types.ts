// Base types
export interface IdItem {
    id: string;
    nom: string;
    description?: string;
    icon?: string;
    relations?: Relation[];
}

export interface Relation {
    targetId: string;
    type: string;
    details?: string;
}

// Project Info
export interface ProjectInfo {
    title: string;
    subtitle: string;
    version?: string;
    author?: string;
}

// Pitch Section
export interface PitchSection {
    titre: string;
    pitchGlobal: string;
    logline: string;
    intentionAuteur: string;
    positionnement: {
        type: string;
        cible: string;
        format: string;
    };
    referencesTonEsthetique: string[];
    ambianceSpecifique: string;
}

// Univers Section
export interface ElementUnique extends IdItem {
    // Inherits id, nom, description, icon, relations
}
export interface UniversSection {
    titre: string;
    introduction: string;
    fondationsSystemeMemoire?: string;
    elementsUniques: ElementUnique[];
}

// Système Mémoire Section
export interface TypeElementSysteme extends IdItem {
    nature: string;
    fonctionNarrative: string;
    // Inherits id, nom, description, icon, relations
}
export interface RegleImpactante {
    titre: string;
    description: string;
    impacts?: Array<{niveau: string, effet: string}>;
    labelsImpact?: string[];
    dataPointsImpact?: number[];
}
export interface AutreRegleImportante {
    titre: string;
    description: string;
    phraseCle?: string;
}
export interface ElementSpecifiqueSysteme {
    titre: string;
    description: string;
    role?: string;
}
export interface ReglesCruciales {
    regleImpactante?: RegleImpactante;
    autreRegleImportante?: AutreRegleImportante;
    elementSpecifiqueSysteme?: ElementSpecifiqueSysteme;
    [key: string]: any; // For other dynamic rules
}
export interface SystemeMemoireSection {
    titre: string;
    introductionSysteme?: string;
    typesElementsSysteme: TypeElementSysteme[];
    reglesCruciales?: ReglesCruciales;
}

// Personnages Section
export interface BasePersonnage extends IdItem {
    nomComplet?: string; // Heros has this
    roleNarratif: string;
    psychologieMotivation: string;
    arc?: string;
    promptDescription?: string;
    // Inherits id, nom, icon, relations
}
export interface Heros extends BasePersonnage {
    nomComplet: string; // Mandatory for Heros
    age?: string;
    origine?: string;
    metier?: string;
    physique?: string;
    styleVestimentaire?: string;
    accessoireCle?: string;
    acteurReference?: string;
    liensCanoniques?: string; // Moved from PersonnagePrincipal for consistency
}
export interface PersonnagePrincipal extends BasePersonnage {
    liensCanoniques?: string;
    acteurReference?: string; // Added acteurReference for personnagesPrincipaux
}
export interface PersonnagesSection {
    titre: string;
    heros?: Heros;
    personnagesPrincipaux: PersonnagePrincipal[];
}

// Environnements Section
export interface LieuPrincipal extends IdItem {
    // Inherits id, nom, description, icon, relations
}
export interface Lieu extends IdItem {
    importanceNarrative?: string;
    ambiance?: string;
    refletEtatMental?: string;
    manifestationEntites?: string;
    // Inherits id, nom, description, icon, relations
}
export interface EnvironnementsSection {
    titre: string;
    laVille?: LieuPrincipal; // Can also be regionPrincipale
    lieux: Lieu[];
}

// Objets & Mystères Section
export interface ObjetOuMystere extends IdItem {
    type: string;
    origine?: string;
    fonction?: string;
    danger?: string;
    utilisationNarrative?: string;
    elementsConnus?: string; // For mysteries
    pistesInitiales?: string; // For mysteries
    importanceNarrative?: string; // For mysteries
    // Inherits id, nom, description, icon, relations
}
export interface ObjetsMysteresSection {
    titre: string;
    objets: ObjetOuMystere[];
}

// Chronologie Section
export interface EvenementChronologie {
    id: string | number; // vis.js accepts both
    content: string;
    start: string; // Date string "YYYY-MM-DD"
    end?: string; // Date string "YYYY-MM-DD"
    group?: string;
    className?: string;
    type?: 'point' | 'range' | 'background';
    details?: string;
    title?: string; // For vis.js tooltip, can be HTML
}
export interface ChronologieSection {
    titre: string;
    introduction?: string;
    evenements: EvenementChronologie[];
}

// Structure Saison Section
export interface StructureGlobale {
    format: string;
    progression: string;
}
export interface ArcMajeur {
    acte: string;
    objectifProtagoniste?: string; // also objectifSolan in sample
    description: string;
}
export interface Episode {
    num: string;
    titreProvisoire: string;
    resume: string;
}
export interface StructureSaisonSection {
    titre: string;
    structureGlobale?: StructureGlobale;
    arcsMajeursSaison1?: ArcMajeur[]; // also actesPrincipaux in sample
    episodesSaison1?: Episode[]; // also chapitres in sample
    pointsDeConnexion?: string;
}

// Thèmes Section
export interface ThemePrincipal {
    theme: string;
    exploration: string;
}
export interface ThemesSection {
    titre: string;
    themesPrincipaux: ThemePrincipal[];
}

// Glossaire Section
export interface TermeGlossaire {
    terme: string;
    definition: string;
}
export interface GlossaireSection {
    titre: string;
    termes: TermeGlossaire[];
}

// Journal Protagoniste Section
export interface JournalProtagonisteSection {
    titre: string;
    introduction?: string;
}

// Laboratoire IA Section
export interface LaboratoireIASection {
    titre: string;
    introduction?: string;
}

// ADAPTIK Section
export interface AdaptikSection {
    titre: string;
    introduction?: string;
    // savedSuggestions?: BrandSuggestion[]; // For future use
}

// Pager Generator Section - New
export interface PagerGeneratorSection {
    titre: string;
    introduction?: string;
}

// Pager Generator - Section structure based on PDF
export interface PagerSectionContent {
    id: string;
    title: string;
    content: string | React.ReactNode;
    isAIGenerated?: boolean;
    aiPrompt?: (bible: BibleData | null, casPratiqueData?: any) => string; 
    dataExtractor?: (bible: BibleData | null, casPratiqueData?: any) => string | React.ReactNode; 
}


// Main Bible Data Structure
export interface BibleData {
    projectInfo: ProjectInfo;
    pitchSection: PitchSection;
    universSection: UniversSection;
    systemeMemoireSection: SystemeMemoireSection;
    personnagesSection: PersonnagesSection;
    environnementsSection: EnvironnementsSection;
    objetsMysteresSection: ObjetsMysteresSection;
    chronologieSection: ChronologieSection;
    structureSaisonSection?: StructureSaisonSection; // Optional as per sample
    themesSection?: ThemesSection; // Optional as per sample
    glossaireSection?: GlossaireSection; // Optional as per sample
    journalProtagonisteSection?: JournalProtagonisteSection; // Optional as per sample
    laboratoireIASection?: LaboratoireIASection; // Optional as per sample
    adaptikSection?: AdaptikSection; // Optional section
    pagerGeneratorSection?: PagerGeneratorSection; // New optional section
}

// For AI Tools
export interface StoryboardShot {
    type_plan: string;
    action_dialogue: string;
    elements_visuels_ambiance: string;
    imagePromptForImagen?: string;
    imageUrl?: string;
    imageLoading?: boolean;
    imageError?: string;
}

export interface StoryboardData {
    sceneDescription: string;
    char1Name?: string;
    char2Name?: string;
    shotsDetails: StoryboardShot[];
}

// Types for ADAPTIK™ feature
export type IntegrationLevel = 'Évident' | 'Implicite' | 'Subliminal';
export type BrandTypePreference = 'Fictive' | 'RéelleAdaptée' | 'Mixte'; 

export interface BrandSuggestion {
    nomMarque: string;
    typeMarque: string; // e.g., Technologie, Alimentation, Mode
    estFictive: boolean;
    slogan?: string;
    objetPlacement?: string; // e.g., "Ordinateur portable du personnage"
    niveauIntegration: IntegrationLevel;
    detailsIntegration: string;
    justification?: string;
    logoDescription?: string; // If fictive
}

export interface AdaptikRequestParams {
    sceneDescription: string;
    projectGenre: string;
    projectUniverse: string;
    projectValues: string;
    integrationLevel: IntegrationLevel;
    objectTypes: string[]; // Specific objects to consider for placement
    brandTypePreference: BrandTypePreference; 
}

export interface ScriptAnalysis {
  summary: string;
  precepts: { title: string; description: string }[];
}

export interface CharacterArcStep {
  stepTitle: string;
  description: string;
  internalConflict?: string;
  externalChallenge?: string;
  realization?: string;
}

export interface CharacterArcData {
  characterName: string;
  startPoint: string;
  endGoal?: string; // Optional end goal
  steps: CharacterArcStep[];
}

// New types for Character Relationship Weaver
export interface CharacterRelationshipSuggestion {
  typeRelation: string;
  justification: string;
  evenementsPassesPotentiels?: string[];
  pointsInteractionsFuturs?: string[];
  ideesScenesTypes?: string[];
}

export interface CharacterRelationshipWeaverResult {
  character1Name: string;
  character2Name: string;
  suggestions: CharacterRelationshipSuggestion[];
}


// Search results
export interface SearchResultItem {
  path: string; // User-friendly path
  text: string; // Matched text snippet
  rawPath: (string | number)[]; // Raw path array for navigation/linking
}

// Chat Feature Types
export type ChatMode = 'general' | 'private';

export interface ChatMessage {
  id: string;
  sender: string; // 'Utilisateur' or Character Name/ID or 'Système' or 'L'Univers'
  text: string;
  timestamp: number;
  type: 'user' | 'character' | 'system' | 'error'; // To style messages differently, added 'error' type
  isTyping?: boolean; // For "is typing..." indicator
}

export interface ChatHistories {
  [chatKey: string]: ChatMessage[]; // e.g., general: ChatMessage[], private_heroId: ChatMessage[]
}

// Mood Board Generator Types
export interface MoodBoardImage {
    id: string; // Unique ID for the image, e.g., generated from its prompt or index
    prompt: string; // The prompt used to generate this specific image
    imageUrl?: string;
    isLoading?: boolean;
    error?: string;
}

export interface MoodBoardData {
    title: string; // e.g., "Mood Board for [Project Title]"
    description?: string; // Optional brief description or keywords used
    images: MoodBoardImage[];
}


// Vis Network types
export declare namespace vis {
    class DataSet<T> {
      constructor(data?: T[]);
      add(data: T | T[], senderId?: string | number): (string | number)[];
      remove(id: (string | number) | (string | number)[], senderId?: string | number): (string | number)[];
      update(data: T | T[], senderId?: string | number): (string | number)[];
      get(id: string | number): T | null;
      get(ids: (string | number)[]): T[];
      get(options?: any): T[]; // Overload for getting all items with options
      clear(senderId?: string | number): (string | number)[];
      length: number;
      on(event: string, callback: (event: string, properties: any, senderId: string | number) => void): void;
      off(event: string, callback: (event: string, properties: any, senderId: string | number) => void): void;
    }
  
    class Timeline {
      constructor(container: HTMLElement, items: DataSet<any> | any[], groups?: DataSet<any> | any[], options?: any);
      destroy(): void;
      on(event: string, callback: (properties: any) => void): void;
      setOptions(options: any): void;
      setItems(items: DataSet<any> | any[]): void;
      setGroups(groups: DataSet<any> | any[]): void;
      fit(options?: any): void;
      getSelection(): (string|number)[];
    }
  
    class Network {
      constructor(container: HTMLElement, data: any, options: any);
      destroy(): void;
      on(event: string, callback: (params?: any) => void): void;
      setOptions(options: any): void;
      fit(options?: any): void;
      stabilize(iterations?: number): void;
    }
  }
  
  // Global declaration for vis and Chart
  declare global {
      interface Window {
          vis: typeof vis;
          Chart: any; 
      }
  }
  
export {};
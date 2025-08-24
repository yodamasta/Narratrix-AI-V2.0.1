
import { GoogleGenAI, GenerateContentResponse, GenerateContentParameters, GenerateImagesResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL } from '../constants';
import { StoryboardShot, BrandSuggestion, AdaptikRequestParams, BibleData, ScriptAnalysis, CharacterArcStep, ChatMode, ChatMessage, Heros, PersonnagePrincipal, CharacterRelationshipSuggestion } from "../types"; // Added CharacterRelationshipSuggestion

let genAI: GoogleGenAI | null = null;

// This is a STRING pattern for the RegExp constructor, not a regex literal.
// It matches Markdown-style code fences.
const FENCE_REGEX_PATTERN = "^```(\\w*)?\\s*\\n?([\\s\\S]*?)\\n?\\s*```$";
const FENCE_REGEX = new RegExp(FENCE_REGEX_PATTERN);

// Helper function to safely get API_KEY
const getApiKey = (): string | undefined => {
  if (typeof process !== 'undefined' && process.env && typeof process.env.API_KEY === 'string') {
    return process.env.API_KEY;
  }
  return undefined;
};

const getGenAI = (): GoogleGenAI => {
    if (!genAI) {
        const apiKey = getApiKey();
        if (!apiKey) {
            console.error("API_KEY environment variable is not set or process.env is not available.");
            throw new Error("API_KEY environment variable is not set or process.env is not available.");
        }
        genAI = new GoogleGenAI({ apiKey });
    }
    return genAI;
};

export const isGeminiApiKeyAvailable = (): boolean => {
    return !!getApiKey();
};

export async function generateText(prompt: string, systemInstruction?: string, disableThinking?: boolean): Promise<string> {
    if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");
    const ai = getGenAI();
    
    const params: GenerateContentParameters = {
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {},
    };

    if (systemInstruction && params.config) {
        params.config.systemInstruction = systemInstruction;
    }

    if (disableThinking && params.config && GEMINI_TEXT_MODEL === 'gemini-2.5-flash') { // thinkingConfig only for flash
        params.config.thinkingConfig = { thinkingBudget: 0 };
    }
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent(params);
        return response.text;
    } catch (error) {
        console.error("Error generating text from Gemini:", error);
        throw error;
    }
}

export async function generateJson<T,>(
    prompt: string, 
    systemInstruction?: string,
    disableThinking?: boolean
): Promise<T> {
    if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");
    const ai = getGenAI();

    const params: GenerateContentParameters = {
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        },
    };
    
    if (systemInstruction && params.config) {
        params.config.systemInstruction = systemInstruction;
    }
    if (disableThinking && params.config && GEMINI_TEXT_MODEL === 'gemini-2.5-flash') { // thinkingConfig only for flash
        params.config.thinkingConfig = { thinkingBudget: 0 };
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent(params);
        let jsonStr = response.text.trim();
        
        const match = jsonStr.match(FENCE_REGEX);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        return JSON.parse(jsonStr) as T;
    } catch (error) {
        console.error("Error generating JSON from Gemini or parsing it:", error);
        throw error;
    }
}


export async function generateImage(prompt: string): Promise<string> {
    if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");
    const ai = getGenAI();
    
    // The properties 'numberOfImages' and 'outputMimeType' are at the root of the request object.
    const params = {
        model: GEMINI_IMAGE_MODEL,
        prompt: prompt,
        numberOfImages: 1, 
        outputMimeType: 'image/png'
    };

    try {
        const response: GenerateImagesResponse = await ai.models.generateImages(params);
        // The check is more robust with optional chaining for the 'image' property.
        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image generated or image data is missing.");
        }
    } catch (error) {
        console.error("Error generating image from Imagen:", error);
        throw error;
    }
}

export async function generateStoryboardShots(
    sceneDescription: string,
    characterContext: string,
    biblePitch: string,
    bibleAmbiance: string
): Promise<StoryboardShot[]> {
    const prompt = `
Contexte général de l'univers: ${biblePitch || 'Non défini'}. 
Style visuel général et ambiance: ${bibleAmbiance || 'N/A'}. 
${characterContext}

Décomposer la scène suivante en exactement 6 plans distincts et séquentiels pour un storyboard. Pour chaque plan, fournir:
1. "type_plan": Type de plan cinématographique (ex: Gros plan sur les yeux de [Personnage], Plan moyen large du lieu, Plan d'ensemble du décor de nuit, Plan américain de [Personnage] qui marche).
2. "action_dialogue": Description concise de l'action principale ou du dialogue clé du plan (max 15-20 mots).
3. "elements_visuels_ambiance": Description des éléments visuels cruciaux, de l'éclairage, et de l'ambiance spécifique du plan, optimisée pour une IA de génération d'images (max 25-30 mots). Être descriptif et évocateur.

Scène à décomposer: "${sceneDescription}"
`;
    return generateJson<StoryboardShot[]>(prompt, "Tu es un réalisateur expert en décomposition de scènes pour storyboards.");
}

export async function correctJsonWithAI(invalidJson: string, expectedStructure: object): Promise<string> {
    if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");
    const prompt = `
The following JSON string is invalid and causing a parsing error.
The expected structure is approximately: 
\`\`\`json
${JSON.stringify(expectedStructure, null, 2).substring(0, 1000)}... 
\`\`\`
(The provided structure might be truncated for brevity, but focus on making the user's JSON valid).

Please analyze the invalid JSON, identify the errors (syntax errors like missing commas, incorrect brackets, unescaped strings, etc.), and correct them so that it becomes a valid JSON object.
If parts of the structure seem to be missing or malformed based on common JSON patterns, try to infer sensible corrections.
Output ONLY the corrected, valid JSON object. Do not add any explanations, apologies, or introductory/concluding text.

Invalid JSON:
---
${invalidJson}
---

Corrected JSON:
`;
    const ai = getGenAI();
     const params: GenerateContentParameters = {
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
    };
    const response: GenerateContentResponse = await ai.models.generateContent(params);
    let correctedJsonStr = response.text.trim();

    const match = correctedJsonStr.match(FENCE_REGEX);
    if (match && match[2]) {
        correctedJsonStr = match[2].trim();
    }
    
    try {
        JSON.parse(correctedJsonStr);
        return correctedJsonStr; 
    } catch (e) {
        console.error("AI corrected JSON is still invalid:", e);
        throw new Error("AI-based JSON correction failed to produce valid JSON.");
    }
}


export async function convertTextToBibleJson(
  freeFormText: string,
  bibleStructure: object,
  precept?: string // New optional parameter
): Promise<string> {
  if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");

  let systemInstruction = "You are an expert at structuring narrative information into a specific JSON format.";
  let fullPrompt = "";

  // Heuristic: if text is short (e.g., less than 250 chars) and a precept is given, assume AI should generate the story.
  const isShortText = freeFormText.length < 250; 

  if (precept && precept !== "Aucun (Texte libre / Histoire complète)" && isShortText) {
    // Mode: Precept-driven story generation
    systemInstruction = `You are an expert storyteller and world-builder specializing in the ${precept} genre/style.`;
    fullPrompt = `
The user has selected the style/genre: "${precept}".
They have provided a brief initial idea or description: "${freeFormText}"

Your task is to:
1. Develop a compelling narrative concept based on this style and idea. This includes inventing a basic plot, key characters (including a protagonist), unique world elements, settings, and conflicts that fit the "${precept}" genre. Be detailed and imaginative.
2. Then, populate the provided JSON Bible structure with this developed narrative. Be creative and fill all sections as comprehensively as possible, ensuring coherence with the chosen style.
3. For fields like 'id', generate unique, descriptive IDs (e.g., "${precept.toLowerCase().replace(/[\s\/]/g, '_').replace(/[^a-z0-9_]/gi, '')}_hero_001", "gen_item_xyz"). Ensure IDs are consistent if an element is referenced in multiple places (e.g., character ID in relations).
4. For arrays (like 'elementsUniques', 'personnagesPrincipaux', 'evenements'), generate at least 1-2 relevant and detailed items if specific details aren't part of your core generated story. These items should also align with the "${precept}" genre and the user's initial idea. For example, if generating characters, provide names, roles, and basic motivations.
5. Do not leave major sections or essential fields empty or undefined. Aim for a complete, usable Bible JSON structure that strongly reflects the "${precept}" genre based on the user's initial idea. Critically, ensure 'projectInfo.title' is filled, deriving a title from your generated story if not specified by the user.
6. Pay close attention to data types (strings, arrays of objects, nested objects, booleans, numbers where appropriate).
7. Ensure all string values are properly JSON escaped.
8. The output MUST be a single, valid JSON object that strictly adheres to the following Bible structure. Do not include any explanatory text, apologies, or markdown formatting around the JSON block.

Target JSON Structure:
\`\`\`json
${JSON.stringify(bibleStructure)}
\`\`\`

User's brief idea for "${precept}" style:
---
${freeFormText}
---

Valid JSON Output based on your generated story for "${precept}":
`;
  } else {
    // Mode: Mapping user's text (potentially guided by precept if provided and text is longer)
    let preceptGuidance = "";
    if (precept && precept !== "Aucun (Texte libre / Histoire complète)") {
        systemInstruction = `You are an expert at structuring narrative information into a specific JSON format, with a talent for the ${precept} genre/style.`;
        preceptGuidance = `The user has indicated an interest in the "${precept}" style. Interpret their text and fill the Bible structure with this style in mind. If their text is sparse or requires creative filling for some sections of the Bible, ensure your generated placeholders or inferences align with this style.`;
    }

    fullPrompt = `
You are an expert at structuring narrative information into a specific JSON format.
The user has provided free-form text describing a fictional universe, characters, plot points, etc.
${preceptGuidance}

Your task is to parse this text and convert it into a valid JSON object that strictly adheres to the following Bible structure:

\`\`\`json
${JSON.stringify(bibleStructure)}
\`\`\`

Analyze the user's text and map the information to the appropriate fields in the JSON structure.
- For fields like 'id', if not inferable from the text, generate a unique ID (e.g., "gen_char_001", "gen_event_xyz").
- For any section or field in the provided Bible structure where specific information is not found in the user's text, you MUST still include that section/field in the JSON.
- If possible, creatively infer or generate plausible placeholder content (e.g., 'Description à compléter par l'auteur', 'Nom de personnage à définir', [{ nom: 'Exemple d\'élément 1', description: 'Description exemple'}]) that fits the overall theme derived from the user's text and the nature of the section. If a style ("${precept || 'general narrative'}") was indicated, align placeholders with it. Ensure 'projectInfo.title' is filled, even if you have to derive it from the text.
- For arrays expecting objects (like 'elementsUniques', 'personnagesPrincipaux', 'evenements', 'termes', etc.), if no specific items are described, generate at least one or two placeholder items with minimal but structurally correct content reflecting the type of items expected in that array and fitting the overall theme/style.
- Do not leave major sections or essential fields empty or undefined unless it's truly impossible to generate something sensible that aligns with the structure. Aim for a complete, usable Bible JSON structure.
- Pay close attention to data types (strings, arrays of objects, nested objects).
- Ensure all string values are properly JSON escaped.
- The output MUST be a single, valid JSON object. Do not include any explanatory text, apologies, or markdown formatting around the JSON block.

User's free-form text:
---
${freeFormText}
---

Valid JSON Output:
`;
  }

  const ai = getGenAI();
  const params: GenerateContentParameters = {
    model: GEMINI_TEXT_MODEL,
    contents: fullPrompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: systemInstruction, 
    }
  };
    
  try {
    const response: GenerateContentResponse = await ai.models.generateContent(params);
    let jsonStr = response.text.trim();

    const match = jsonStr.match(FENCE_REGEX);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    // Validate that the AI returned something resembling the bible structure
    const parsedForValidation = JSON.parse(jsonStr);
    if (!parsedForValidation.projectInfo || typeof parsedForValidation.projectInfo.title !== 'string' || !parsedForValidation.projectInfo.title.trim()) {
        console.warn("AI response missing projectInfo.title or it's empty. Attempting to add a default one.");
        parsedForValidation.projectInfo = parsedForValidation.projectInfo || {};
        parsedForValidation.projectInfo.title = parsedForValidation.projectInfo.title || `Projet Généré (${precept || 'Style Libre'})`;
        jsonStr = JSON.stringify(parsedForValidation, null, 2); // Re-stringify if modified
    }

    return jsonStr;

  } catch (error: any) {
    console.error("Error converting text to Bible JSON or parsing Gemini response:", error);
    if (error instanceof SyntaxError || (error.message && error.message.toLowerCase().includes('json'))) {
         throw new Error(`Gemini returned malformed JSON for Bible conversion. Error: ${error.message}`);
    }
    throw error;
  }
}

export async function generateBrandPlacementSuggestions(
    params: AdaptikRequestParams,
    bibleData: BibleData | null
): Promise<BrandSuggestion[]> {
    if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");

    let bibleContext = "Contexte général de la Bible du projet:\n";
    if (bibleData?.projectInfo) {
        bibleContext += `- Titre: ${bibleData.projectInfo.title || 'Non défini'}\n`;
    }
    if (bibleData?.pitchSection) {
        bibleContext += `- Pitch Global: ${bibleData.pitchSection.pitchGlobal || 'Non défini'}\n`;
        bibleContext += `- Ambiance Spécifique: ${bibleData.pitchSection.ambianceSpecifique || 'Non défini'}\n`;
    }
    if (bibleData?.themesSection?.themesPrincipaux && bibleData.themesSection.themesPrincipaux.length > 0) {
        bibleContext += `- Thèmes Principaux: ${bibleData.themesSection.themesPrincipaux.map(t => t.theme).join(', ')}\n`;
    }
    bibleContext += "\n";

    const integrationLevelExplanation = {
        'Évident': "Placement direct, mentionné ou visuellement proéminent.",
        'Implicite': "Apparition visuelle en arrière-plan, sans mention directe.",
        'Subliminal': "Suggestion via formes, couleurs, sons, symbolisme subtil."
    };

    const objectTypesString = params.objectTypes.join(', ') || 'non spécifié';

    const prompt = `
${bibleContext}
Vous êtes ADAPTIK™, un moteur de placement narratif intelligent. Votre objectif est d'intégrer des marques de manière créative et cohérente dans le contexte fourni, en respectant toutes les contraintes.

Paramètres de la demande de placement:
- Scène/Contexte à considérer: "${params.sceneDescription}"
- Genre du Projet: "${params.projectGenre}"
- Style d'Univers du Projet: "${params.projectUniverse}"
- Valeurs du Projet: "${params.projectValues}"
- Niveau d'Intégration Souhaité: "${params.integrationLevel}" (Signification: ${integrationLevelExplanation[params.integrationLevel]})
- Types d'Objets pour Placement: "${objectTypesString}"
- Préférence Type de Marque: "${params.brandTypePreference}"

Instructions Spécifiques:
Générez 2 à 3 suggestions de placement de marque.
Pour chaque suggestion, vous devez fournir les informations suivantes sous forme d'un objet JSON avec les clés exactes:
  "nomMarque": (string) Le nom de la marque (original si réelle adaptée, inventé si fictive).
  "typeMarque": (string) Catégorie de la marque (ex: Technologie, Alimentation, Mode, Automobile, Service).
  "estFictive": (boolean) True si la marque est inventée pour ce placement, false si c'est une marque réelle adaptée.
  "slogan": (string, optionnel) Un slogan pour la marque, surtout si elle est fictive.
  "objetPlacement": (string, optionnel) L'objet spécifique dans la scène où la marque apparaît (ex: "Ordinateur portable du personnage", "Canette sur la table"). Doit être lié aux types d'objets fournis.
  "niveauIntegration": (string, doit être l'une des valeurs: "Évident", "Implicite", "Subliminal") Correspond au niveau demandé.
  "detailsIntegration": (string) Description précise de comment la marque est intégrée visuellement ou narrativement, respectant le niveau d'intégration. Soyez descriptif.
  "justification": (string, optionnel) Brève explication de pourquoi cette marque/placement est pertinent pour le genre, l'univers, les valeurs ou la scène.
  "logoDescription": (string, optionnel) Si la marque est fictive, décrivez une idée de logo (aspect, symbolisme).

Types de marques à générer selon la préférence "${params.brandTypePreference}":
- Si "Fictive": Inventez des marques originales avec tous les détails demandés (nom, type, slogan, logo...). Indiquez "estFictive": true.
- Si "RéelleAdaptée": Suggérez des marques réelles qui correspondent bien, OU proposez des "détournements intelligents" (parodies, noms légèrement modifiés, versions alternatives ex: "Pear" pour Apple, "Nuka-Cola" pour Coca-Cola dans un contexte post-apocalyptique, "Sprawlmart" pour Walmart). Indiquez clairement l'adaptation et "estFictive": true si c'est une parodie/adaptation, ou "estFictive": false si c'est une marque réelle existante utilisée telle quelle (même si son usage est adapté).
- Si "Mixte": Proposez un mélange équilibré des deux types ci-dessus (marques purement fictives et marques réelles/adaptées/parodiques).

Assurez-vous que les suggestions soient hautement créatives et profondément intégrées à l'ADN narratif et aux paramètres fournis.
Le résultat doit être un tableau JSON d'objets de suggestion de marque. Ne retournez RIEN d'autre que ce tableau JSON.
`;

    const systemInstruction = "Tu es ADAPTIK™, un moteur expert en placement narratif intelligent. Ta réponse DOIT être un tableau JSON valide d'objets 'BrandSuggestion'.";

    try {
        const suggestions = await generateJson<BrandSuggestion[]>(prompt, systemInstruction, false);
        return suggestions;
    } catch (error) {
        console.error("Error generating brand placement suggestions from Gemini:", error);
        throw error;
    }
}

export async function generateNameOrConcept(
  type: 'name' | 'concept',
  theme: string,
  count: number,
  itemType?: string // e.g., "personnages", "lieux" for names
): Promise<string[]> {
  if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");
  
  let promptText = "";
  if (type === 'name') {
    promptText = `Génère ${count} noms uniques et créatifs ${itemType ? `pour des ${itemType}` : ''} dans un contexte de "${theme}". Les noms doivent être originaux et correspondre à l'ambiance du thème. Fournis uniquement la liste des noms, chacun sur une nouvelle ligne, sans numérotation ni texte d'introduction/conclusion.`;
  } else { // concept
    promptText = `Génère ${count} idées de concepts bruts et originaux (par exemple: types de créatures, technologies distinctives, événements marquants, règles sociales uniques) pour un univers ayant pour thème/contexte "${theme}". Chaque concept doit être une phrase ou une courte description (max 20 mots). Fournis uniquement la liste des concepts, chacun sur une nouvelle ligne, sans numérotation ni texte d'introduction/conclusion.`;
  }

  const systemInstruction = "Tu es un générateur d'idées créatives pour des auteurs et des concepteurs de jeux. Réponds uniquement avec la liste demandée.";
  const responseText = await generateText(promptText, systemInstruction);
  return responseText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
}

export async function analyzeScriptAndExtractPrecepts(scriptText: string): Promise<ScriptAnalysis> {
  if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");
  
  const prompt = `
Analyse le script/texte de scénario suivant.
Fournis une réponse JSON structurée avec les clés "summary" et "precepts".
1. "summary": Un résumé concis du scénario (environ 100-150 mots).
2. "precepts": Un tableau de 3 à 5 'préceptes' clés. Chaque précepte doit être un objet avec les clés "title" (un titre court et percutant pour le précepte) et "description" (une explication claire du précepte, environ 1-2 phrases). Les préceptes sont les règles fondamentales de l'univers (implicites ou explicites dans le texte), les thèmes majeurs abordés, ou les leçons importantes/morales qui s'en dégagent.

Assure-toi que la sortie soit uniquement un objet JSON valide, sans formatage markdown autour.

Script:
---
${scriptText}
---
`;
  const systemInstruction = "Tu es un analyste de scénarios expert, capable d'identifier les thèmes centraux, les règles d'univers et les messages clés d'un texte narratif. Ta réponse doit être un objet JSON valide.";
  return generateJson<ScriptAnalysis>(prompt, systemInstruction);
}

export async function generateCharacterArc(
    bibleData: BibleData,
    characterName: string,
    startPoint: string,
    endGoal: string | undefined,
    numSteps: number
): Promise<CharacterArcStep[]> {
    if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");

    const personnage = bibleData.personnagesSection?.heros?.nom === characterName || bibleData.personnagesSection?.heros?.nomComplet === characterName
        ? bibleData.personnagesSection.heros
        : bibleData.personnagesSection?.personnagesPrincipaux?.find(p => p.nom === characterName || p.nomComplet === characterName);

    let charDesc = `Personnage: ${characterName}.`;
    if (personnage) {
        charDesc += ` Rôle: ${personnage.roleNarratif || 'Non défini'}. Psychologie/Motivation: ${personnage.psychologieMotivation || 'Non définie'}. Arc initial prévu: ${personnage.arc || 'Non défini'}.`;
    }

    const prompt = `
Contexte Général de l'Univers:
Titre: ${bibleData.projectInfo.title}
Pitch: ${bibleData.pitchSection.pitchGlobal}
Ambiance: ${bibleData.pitchSection.ambianceSpecifique}
Thèmes principaux: ${bibleData.themesSection?.themesPrincipaux?.map(t => t.theme).join(', ') || 'Non définis'}

Personnage Concerné:
${charDesc}

Point de Départ du Personnage:
"${startPoint}"

${endGoal ? `Objectif ou État Final (optionnel) du Personnage:\n"${endGoal}"` : ''}

Nombre d'Étapes Clés pour l'Arc: ${numSteps}

Instructions pour l'IA:
Développe un arc narratif pour le personnage ${characterName} en ${numSteps} étapes clés.
Pour chaque étape, fournis un objet JSON avec les clés suivantes:
- "stepTitle": (string) Un titre court et évocateur pour l'étape (ex: "Le Refus de l'Appel", "Première Confrontation et Échec").
- "description": (string) Description détaillée de ce qui arrive au personnage à ce stade, tant sur le plan des événements extérieurs que de son évolution interne (environ 50-80 mots).
- "internalConflict": (string, optionnel) Le conflit interne principal du personnage durant cette phase.
- "externalChallenge": (string, optionnel) Le défi externe majeur auquel il est confronté.
- "realization": (string, optionnel) La prise de conscience ou la leçon qu'il pourrait tirer.

Assure-toi que l'évolution soit cohérente avec le personnage, le contexte de l'univers et les thèmes.
Si un objectif final est fourni, l'arc doit tendre vers cet objectif.
Le résultat doit être un tableau JSON contenant ${numSteps} objets, chacun représentant une étape de l'arc.
Ne retourne RIEN d'autre que ce tableau JSON.
`;

    const systemInstruction = "Tu es un scénariste expert en développement d'arcs de personnages. Ta réponse DOIT être un tableau JSON valide d'objets 'CharacterArcStep'.";
    return generateJson<CharacterArcStep[]>(prompt, systemInstruction);
}

export async function generateChatResponse(
  bibleData: BibleData,
  chatMode: ChatMode,
  userMessage: string,
  targetParticipantIds: string[] = [],
  chatHistory: ChatMessage[] = []
): Promise<string> {
  if (!isGeminiApiKeyAvailable()) {
    throw new Error("La clé API Gemini n'est pas disponible.");
  }
  const ai = getGenAI();

  let systemInstruction = "";
  let participantContextInfo = "";
  let targetNamesDisplay = "L'Univers"; // Default for general or if no participants
  
  const { projectInfo, pitchSection, personnagesSection, universSection, themesSection } = bibleData;

  const generalContext = `
Contexte général de l'univers du projet "${projectInfo.title}":
- Pitch global: ${pitchSection.pitchGlobal}
- Ambiance spécifique: ${pitchSection.ambianceSpecifique}
- Introduction à l'univers: ${universSection.introduction}
- Thèmes principaux: ${themesSection?.themesPrincipaux?.map(t => t.theme).join(', ') || 'Non spécifiés'}
`;

  const participants: (Heros | PersonnagePrincipal | undefined | null)[] = targetParticipantIds.map(id => {
    const hero = personnagesSection.heros;
    if (hero?.id === id) return hero;
    return personnagesSection.personnagesPrincipaux?.find(p => p.id === id);
  }).filter(p => p); // Filter out undefined/null participants

  if (chatMode === 'general' || participants.length === 0) {
    systemInstruction = `Tu es "L'Oracle de l'Univers", une IA omnisciente qui connaît tous les aspects de ce monde fictif. L'utilisateur va te poser des questions ou discuter de cet univers. Réponds de manière immersive, informative et cohérente avec le ton de l'univers. Tu peux faire référence aux personnages, aux lieux ou aux événements comme s'ils étaient réels. Si l'utilisateur demande une opinion ou une réaction spécifique d'un personnage, tu peux la synthétiser en te basant sur sa description dans la Bible.`;
    targetNamesDisplay = "L'Univers";
  } else if (chatMode === 'private') {
    if (participants.length === 1) { // Monologue / Interaction 1-to-1
        const targetCharacter = participants[0];
        targetNamesDisplay = targetCharacter!.nomComplet || targetCharacter!.nom;
        participantContextInfo = `Tu incarnes le personnage: ${targetNamesDisplay}.\nVoici des informations clés te concernant, extraites de la Bible de l'univers:\n`;
        if (targetCharacter) { 
            participantContextInfo += `- Ton nom complet (si spécifié): ${targetCharacter.nomComplet || 'Non spécifié'}\n`;
            participantContextInfo += `- Ton nom court: ${targetCharacter.nom}\n`;
            participantContextInfo += `- Ton rôle narratif: ${targetCharacter.roleNarratif}\n`;
            participantContextInfo += `- Ta psychologie et tes motivations: ${targetCharacter.psychologieMotivation}\n`;
            participantContextInfo += `- Ton arc narratif (si défini): ${targetCharacter.arc || 'Non défini'}\n`;
            participantContextInfo += `- Description pour IA visuelle (apparence/style): ${targetCharacter.promptDescription || 'Non spécifié'}\n`;
            if ('age' in targetCharacter && (targetCharacter as Heros).age) participantContextInfo += `- Ton âge: ${(targetCharacter as Heros).age}\n`;
            const charWithActorRef = targetCharacter as (Heros | PersonnagePrincipal); // Type assertion for actorReference
            if (charWithActorRef.acteurReference) participantContextInfo += `- Acteur/Actrice de référence (pour inspiration visuelle): ${charWithActorRef.acteurReference}\n`;
        }
        systemInstruction = `Tu es ${targetNamesDisplay}. Réponds à l'utilisateur en t'immergeant complètement dans ce rôle. Utilise tes connaissances, ta personnalité, ton ton et tes relations comme définis. Sois crédible et cohérent. Si l'utilisateur pose une question à laquelle tu ne pourrais pas connaître la réponse, réagis de manière appropriée. Ne sors jamais de ton rôle.`;
    } else { // Group chat logic
        targetNamesDisplay = participants.map(p => p!.nomComplet || p!.nom).join(' & ');
        participantContextInfo = `Tu animes une discussion entre l'Utilisateur et les personnages suivants: ${targetNamesDisplay}.\nVoici leurs informations clés:\n`;
        participants.forEach(p => {
            if (p) {
                 participantContextInfo += `\nPersonnage: ${p.nomComplet || p.nom}\n`;
                 participantContextInfo += `  - Rôle: ${p.roleNarratif}\n`;
                 participantContextInfo += `  - Psychologie: ${p.psychologieMotivation}\n`;
                 const pWithActorRef = p as (Heros | PersonnagePrincipal);
                 if (pWithActorRef.acteurReference) participantContextInfo += `  - Acteur de référence: ${pWithActorRef.acteurReference}\n`;
            }
        });
        systemInstruction = `Tu es un modérateur de discussion et l'incarnation des personnages : ${targetNamesDisplay}. Fais interagir ces personnages avec l'Utilisateur et entre eux de manière naturelle. Fais répondre le personnage le plus pertinent à la question de l'utilisateur, ou plusieurs s'ils ont des points de vue différents ou complémentaires. Quand un personnage spécifique parle, préfixe sa réponse par son nom (Ex: "${participants[0]?.nom || 'Personnage1'}: ..."). Sois cohérent avec leurs personnalités. Si l'utilisateur s'adresse à un personnage en particulier, fais-le répondre. Si la question est générale au groupe, orchestre une réponse ou fais parler le plus pertinent.`;
    }
  } else {
    throw new Error("Mode de chat invalide ou personnages cibles non spécifiés pour le chat privé.");
  }

  let promptContent = `${generalContext}\n${participantContextInfo}\n\n===\n\n`;

  if (chatHistory && chatHistory.length > 0) {
    promptContent += "Historique récent de cette conversation (les 6 derniers échanges, pour contexte):\n";
    chatHistory.slice(-6).forEach(msg => {
      let senderPrefix = msg.sender; // Default to the stored sender
      if (msg.type === 'user') senderPrefix = "Utilisateur";
      // For AI messages, msg.sender should already be correct ("L'Univers" or character name(s))
      promptContent += `${senderPrefix}: ${msg.text}\n`;
    });
    promptContent += "\n";
  }
  
  promptContent += `Utilisateur: ${userMessage}\n`;
  if (participants.length > 1 && chatMode === 'private') {
      promptContent += `Réponse du groupe (fais parler le personnage le plus pertinent ou plusieurs, en préfixant leur nom si un personnage spécifique parle): `;
  } else {
      promptContent += `Réponse de ${targetNamesDisplay}: `; 
  }

  const params: GenerateContentParameters = {
    model: GEMINI_TEXT_MODEL,
    contents: promptContent,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.8, 
      topP: 0.95,
      topK: 40,
    },
  };
   if (GEMINI_TEXT_MODEL === 'gemini-2.5-flash' && params.config) { 
        params.config.thinkingConfig = { thinkingBudget: 0 }; 
    }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent(params);
    let aiText = response.text.trim();
    
    // The AI is prompted to prefix names for group chat. We rely on that.
    // No additional client-side prefixing logic needed here unless AI fails.
    
    return aiText;
  } catch (error) {
    console.error(`Error generating chat response from Gemini for ${targetNamesDisplay}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue avec Gemini.";
    throw new Error(`Erreur de Gemini (${targetNamesDisplay}): ${errorMessage}`);
  }
}

export async function generateCharacterRelationshipSuggestions(
    bibleData: BibleData,
    char1Id: string,
    char2Id: string
): Promise<CharacterRelationshipSuggestion[]> {
    if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");

    const getCharDetails = (id: string): string => {
        const { heros, personnagesPrincipaux } = bibleData.personnagesSection;
        let char: Heros | PersonnagePrincipal | undefined = undefined;
        if (heros?.id === id) char = heros;
        else char = personnagesPrincipaux?.find(p => p.id === id);

        if (!char) return `Personnage ID ${id} (non trouvé ou détails manquants)`;
        return `
    - Nom: ${char.nomComplet || char.nom} (ID: ${char.id})
    - Rôle Narratif: ${char.roleNarratif || 'Non défini'}
    - Psychologie/Motivations: ${char.psychologieMotivation || 'Non définies'}
    - Arc Narratif Prévu: ${char.arc || 'Non défini'}
    - Prompt Description (pour IA visuelle): ${char.promptDescription || 'Non défini'}
    ${'age' in char ? `- Âge: ${(char as Heros).age || 'Non défini'}` : ''}
    ${'acteurReference' in char ? `- Acteur/Actrice de Référence: ${(char as any).acteurReference || 'Non défini'}` : ''}
        `.trim();
    };

    const char1Details = getCharDetails(char1Id);
    const char2Details = getCharDetails(char2Id);

    const prompt = `
Contexte Général de l'Univers:
Titre du Projet: ${bibleData.projectInfo.title}
Pitch Global: ${bibleData.pitchSection.pitchGlobal}
Ambiance Spécifique: ${bibleData.pitchSection.ambianceSpecifique}
Thèmes Principaux: ${bibleData.themesSection?.themesPrincipaux?.map(t => t.theme).join(', ') || 'Non définis'}

Personnage 1:
${char1Details}

Personnage 2:
${char2Details}

Instructions pour l'IA:
Tu es un expert en dynamique des personnages et en développement narratif.
Analyse les profils des deux personnages ci-dessus ainsi que le contexte général de l'univers.
Propose 2 à 3 suggestions de dynamiques relationnelles distinctes et complexes entre ces deux personnages.
Pour chaque suggestion, fournis un objet JSON avec les clés suivantes:
- "typeRelation": (string) Un titre descriptif pour la dynamique (ex: "Rivaux devenus alliés par nécessité", "Mentor réticent et disciple rebelle", "Amour interdit par les factions opposées").
- "justification": (string) Une brève explication de pourquoi cette dynamique serait intéressante, comment elle pourrait s'appuyer sur leurs profils et enrichir l'histoire.
- "evenementsPassesPotentiels": (string[], optionnel) 1-2 idées d'événements passés qui auraient pu forger ou compliquer leur relation actuelle (ex: "Un ancien malentendu jamais résolu", "Ils ont survécu ensemble à une catastrophe").
- "pointsInteractionsFuturs": (string[], optionnel) 1-2 idées de points de friction ou de synergie qui pourraient se manifester à l'avenir (ex: "Leurs objectifs finiront par s'opposer violemment", "Ils devront mettre de côté leurs différences pour affronter une menace commune").
- "ideesScenesTypes": (string[], optionnel) 1-2 exemples de scènes types qui pourraient illustrer cette dynamique relationnelle (ex: "Une confrontation verbale tendue où leurs idéologies s'affrontent", "Un moment de vulnérabilité partagée où ils se découvrent un point commun").

Assure-toi que les suggestions soient créatives, cohérentes avec les informations fournies et propices au développement narratif.
Le résultat doit être un tableau JSON contenant 2 ou 3 objets de suggestion. Ne retourne RIEN d'autre que ce tableau JSON.
`;

    const systemInstruction = "Tu es un expert en développement de personnages et de relations narratives. Ta réponse DOIT être un tableau JSON valide d'objets 'CharacterRelationshipSuggestion'.";
    return generateJson<CharacterRelationshipSuggestion[]>(prompt, systemInstruction);
}

export async function generateMoodBoardImagePrompts(
    bibleData: BibleData,
    numImages: number = 6,
    userKeywords?: string,
    sceneDescription?: string // New optional parameter
): Promise<string[]> {
    if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");

    const { projectInfo, pitchSection, personnagesSection, environnementsSection, universSection, themesSection } = bibleData;

    let contextSummary = `
Titre du Projet: ${projectInfo.title}
Pitch Global: ${pitchSection.pitchGlobal}
Ambiance Spécifique: ${pitchSection.ambianceSpecifique}
Genre: ${pitchSection.positionnement.type}
Références Ton & Esthétique: ${pitchSection.referencesTonEsthetique.join(', ') || 'N/A'}
Thèmes Principaux: ${themesSection?.themesPrincipaux?.map(t => t.theme).join(', ') || 'N/A'}
`;

    if (personnagesSection?.heros) {
        contextSummary += `\nHéros Principal (${personnagesSection.heros.nom}): ${personnagesSection.heros.promptDescription || personnagesSection.heros.psychologieMotivation || 'Détails à définir'}.`;
    }
    if (environnementsSection?.laVille) {
        contextSummary += `\nLieu Principal (${environnementsSection.laVille.nom}): ${environnementsSection.laVille.description || 'Détails à définir'}.`;
    } else if (environnementsSection?.lieux && environnementsSection.lieux.length > 0) {
         contextSummary += `\nLieu Clé (${environnementsSection.lieux[0].nom}): ${environnementsSection.lieux[0].description || 'Détails à définir'}. Ambiance: ${environnementsSection.lieux[0].ambiance || 'N/A'}.`;
    }
    if (universSection?.elementsUniques && universSection.elementsUniques.length > 0) {
        contextSummary += `\nConcept Unique (${universSection.elementsUniques[0].nom}): ${universSection.elementsUniques[0].description || 'Détails à définir'}.`;
    }
     if (sceneDescription) {
        contextSummary += `\nDescription de scène spécifique pour inspiration (prioritaire): ${sceneDescription}`;
    }
    if (userKeywords) {
        contextSummary += `\nMots-clés supplémentaires de l'utilisateur pour orienter le mood board: ${userKeywords}`;
    }

    const prompt = `
Tu es un Directeur Artistique expert en création de mood boards visuels pour des projets narratifs.
Basé sur le contexte de l'univers fourni ci-dessous (avec une attention particulière à la description de scène si fournie), génère une liste de ${numImages} prompts distincts et variés pour un générateur d'images (comme Imagen).
Ces prompts doivent, ensemble, former un mood board cohérent qui capture l'essence visuelle et thématique du projet, ou de la scène spécifique si elle est décrite.
Varie les types de prompts: certains peuvent se concentrer sur la palette de couleurs, d'autres sur une texture clé, un personnage emblématique (s'il est pertinent pour la scène ou le thème global), un lieu important, un objet symbolique, ou une représentation abstraite d'une émotion ou d'un thème.
Chaque prompt doit être concis (max 30-40 mots), descriptif, et optimisé pour la génération d'images photoréalistes ou stylisées selon l'ambiance du projet/scène.
Assure-toi que chaque prompt demande une image sans texte incrusté. Mentionne "format cinématographique" ou "format affiche" si approprié.

Contexte de l'Univers / Scène:
---
${contextSummary}
---

Le résultat doit être UNIQUEMENT un tableau JSON de chaînes de caractères, où chaque chaîne est un prompt pour Imagen.
Exemple de format de sortie (pour numImages=3):
["Prompt pour image 1...", "Prompt pour image 2...", "Prompt pour image 3..."]
`;

    const systemInstruction = "Tu es un Directeur Artistique générant des prompts pour un mood board visuel. Ta réponse DOIT être un tableau JSON de chaînes de caractères.";
    
    try {
        const imagePrompts = await generateJson<string[]>(prompt, systemInstruction, false);
        if (Array.isArray(imagePrompts) && imagePrompts.every(p => typeof p === 'string')) {
            return imagePrompts.slice(0, numImages); // Ensure correct number of prompts
        }
        throw new Error("La réponse de l'IA n'est pas un tableau de prompts valide.");
    } catch (error) {
        console.error("Error generating mood board image prompts from Gemini:", error);
        throw error;
    }
}

export async function generateSinglePageMoodBoardPrompt(
    bibleData: BibleData,
    userKeywords?: string,
    sceneDescription?: string
): Promise<string> {
    if (!isGeminiApiKeyAvailable()) throw new Error("Gemini API key not available.");

    const { projectInfo, pitchSection, universSection, themesSection, personnagesSection, environnementsSection } = bibleData;

    let contextSummary = `
Titre du Projet: ${projectInfo.title}
Pitch Global: ${pitchSection.pitchGlobal}
Ambiance Spécifique: ${pitchSection.ambianceSpecifique}
Genre: ${pitchSection.positionnement.type}
Références Ton & Esthétique: ${pitchSection.referencesTonEsthetique.join(', ') || 'N/A'}
Thèmes Principaux: ${themesSection?.themesPrincipaux?.map(t => t.theme).join(', ') || 'N/A'}
`;
    if (sceneDescription) {
        contextSummary += `\nFocus principal sur la scène suivante: "${sceneDescription}"`;
    } else {
        if (personnagesSection?.heros) {
            contextSummary += `\nHéros: ${personnagesSection.heros.nom} (${personnagesSection.heros.promptDescription || 'description à définir'}).`;
        }
        if (environnementsSection?.lieux?.[0]) {
            contextSummary += `\nLieu clé: ${environnementsSection.lieux[0].nom} (${environnementsSection.lieux[0].description || 'description à définir'}).`;
        }
    }
    if (userKeywords) {
        contextSummary += `\nMots-clés/Style de l'utilisateur: ${userKeywords}`;
    }

    const prompt = `
Tu es un Directeur Artistique expert. Basé sur le contexte suivant, génère UN SEUL prompt détaillé pour Imagen afin de créer une image unique de type "mood board" ou "collage artistique".
Cette image doit synthétiser visuellement l'essence du projet ou de la scène décrite.
Le prompt pour Imagen doit décrire :
- Le style général (ex: photoréaliste, peinture digitale sombre, aquarelle lumineuse, style manga, art déco).
- Une composition d'éléments clés : suggère d'intégrer des zones pour une palette de couleurs dominante, des échantillons de textures (ex: métal rouillé, tissu soyeux), de petits croquis ou silhouettes de personnages/lieux, des objets symboliques, et éventuellement des mots-clés stylisés.
- L'atmosphère générale (ex: mystérieux, énergique, mélancolique).
- Indique clairement "mood board image", "artistic collage", "concept art inspiration board".
- Assure-toi que le prompt demande une image SANS texte incrusté généré par l'IA.
- Format de l'image: 16:9 ou format carré.

Contexte :
---
${contextSummary}
---

Le résultat doit être UNIQUEMENT une chaîne de caractères contenant le prompt pour Imagen.
Exemple de prompt pour Imagen (tu dois adapter le contenu entre crochets):
"Image de type mood board artistique pour un [Genre] [Ambiance Spécifique], présentant une palette de couleurs [couleurs], des textures de [textures], un aperçu de [personnage/lieu clé], et le symbole de [symbole]. Format 16:9, digital painting, sans texte."
`;

    const systemInstruction = "Tu es un Directeur Artistique qui crée un prompt unique et descriptif pour une image de mood board/collage pour Imagen. Ta réponse DOIT être une seule chaîne de caractères.";
    
    try {
        const singlePrompt = await generateText(prompt, systemInstruction);
        return singlePrompt.trim();
    } catch (error) {
        console.error("Error generating single page mood board prompt from Gemini:", error);
        throw error;
    }
}
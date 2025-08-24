
import { BibleData, Heros, PersonnagePrincipal, SearchResultItem } from '../types';

// Regex for sanitizing bibleTitle in getNoteKey
const NON_ALPHANUM_HYPHEN_UNDERSCORE_REGEX = new RegExp('[^a-zA-Z0-9-_]', 'g');

// This is a STRING pattern designed to match special regex characters.
// It's used with "new RegExp()" to create SPECIAL_REGEX_CHARS_REGEX.
// It is NOT a regex literal itself (which would start and end with /).
const SPECIAL_REGEX_CHARS_PATTERN = "[.*+?^${}()|\\[\\]\\\\]"; // Escaped [ as \\[ and ] as \\]
const SPECIAL_REGEX_CHARS_REGEX = new RegExp(SPECIAL_REGEX_CHARS_PATTERN, 'g');


export function getCharacterByName(charName: string, personnagesSection?: BibleData['personnagesSection']): Heros | PersonnagePrincipal | null {
    if (!personnagesSection || !charName) return null;
    if (personnagesSection.heros && (personnagesSection.heros.nomComplet === charName || personnagesSection.heros.nom === charName)) {
        return personnagesSection.heros;
    }
    if (personnagesSection.personnagesPrincipaux) {
        return personnagesSection.personnagesPrincipaux.find(c => c.nom === charName || c.nomComplet === charName) || null;
    }
    return null;
}

const sectionPathMap: { [key: string]: string } = {
    projectInfo: "Informations Projet",
    pitchSection: "Pitch & Intention",
    universSection: "Univers",
    systemeMemoireSection: "Système Principal",
    personnagesSection: "Personnages",
    environnementsSection: "Environnements",
    objetsMysteresSection: "Objets & Mystères",
    chronologieSection: "Chronologie",
    structureSaisonSection: "Structure Narrative",
    themesSection: "Thèmes & Signification",
    glossaireSection: "Glossaire",
    journalProtagonisteSection: "Journal du Protagoniste",
    laboratoireIASection: "Laboratoire IA",
    processusOutilsSection: "Processus & Outils"
};

export function getFriendlyPath(pathArray: (string | number)[], rootDataContext: BibleData | null): string {
    if (!pathArray || pathArray.length === 0 || !rootDataContext) return "Donnée racine";

    const displayPathParts: string[] = [];
    const mainSectionKey = pathArray[0] as string;

    if (sectionPathMap[mainSectionKey]) {
        displayPathParts.push(sectionPathMap[mainSectionKey]);
    } else {
        displayPathParts.push(mainSectionKey.charAt(0).toUpperCase() + mainSectionKey.slice(1));
    }
    
    let currentContextForSegment: any = rootDataContext;

    for (let i = 1; i < pathArray.length; i++) {
        const segmentKey = pathArray[i-1];
        if(currentContextForSegment && typeof currentContextForSegment === 'object' && segmentKey in currentContextForSegment) {
            currentContextForSegment = currentContextForSegment[segmentKey];
        } else {
            currentContextForSegment = null; // Path broken
            break;
        }

        let segment = pathArray[i];
        if (currentContextForSegment && Array.isArray(currentContextForSegment) && typeof segment === 'number') {
            const itemIndex = segment;
            let itemLabel = `Élément ${itemIndex + 1}`;
            const itemData = currentContextForSegment[itemIndex];
            if (itemData && typeof itemData === 'object') {
                if ('nom' in itemData && itemData.nom) itemLabel = itemData.nom as string;
                else if ('titreProvisoire' in itemData && itemData.titreProvisoire) itemLabel = itemData.titreProvisoire as string;
                else if ('terme' in itemData && itemData.terme) itemLabel = itemData.terme as string;
                else if ('acte' in itemData && itemData.acte) itemLabel = itemData.acte as string;
                else if ('theme' in itemData && itemData.theme) itemLabel = itemData.theme as string;
                else if ('content' in itemData && itemData.content) itemLabel = String(itemData.content).substring(0,30)+'...';
            }
            displayPathParts.push(itemLabel);
        } else {
            displayPathParts.push(String(segment));
        }
    }
    return displayPathParts.join(' > ');
}


export function performSearch(query: string, bibleData: BibleData | null): SearchResultItem[] {
    const results: SearchResultItem[] = [];
    if (!bibleData || query.length < 2) return results;
    const lowerCaseQuery = query.toLowerCase();

    function searchInValue(value: any, currentPath: (string | number)[]) {
        if (typeof value === 'string') {
            if (value.toLowerCase().includes(lowerCaseQuery)) {
                results.push({
                    path: getFriendlyPath([...currentPath], bibleData),
                    text: value,
                    rawPath: [...currentPath]
                });
            }
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => searchInValue(item, [...currentPath, index]));
        } else if (typeof value === 'object' && value !== null) {
            for (const key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    // Skip noisy or irrelevant keys
                    if (key === 'icon' || key.startsWith('titreDynamic') || key.toLowerCase().includes('prompt') || key.toLowerCase().includes('imagepromptforimagen') || key === 'labelsImpact' || key === 'dataPointsImpact' || key === 'id' || key === 'className' ) {
                        continue;
                    }
                    searchInValue(value[key], [...currentPath, key]);
                }
            }
        }
    }
    searchInValue(bibleData, []);
    
    // Deduplicate results based on path and a snippet of text to avoid too many similar entries from deeply nested structures.
    const uniqueResults = new Map<string, SearchResultItem>();
    results.forEach(result => {
        const key = `${result.rawPath.join('.')}-${result.text.substring(0, 50)}`;
        if (!uniqueResults.has(key)) {
            uniqueResults.set(key, result);
        }
    });
    
    return Array.from(uniqueResults.values());
}

export function copyTextToClipboard(text: string): Promise<void> {
    if (!navigator.clipboard) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return Promise.resolve();
      } catch (err) {
        document.body.removeChild(textArea);
        return Promise.reject(new Error('Fallback: Copy to clipboard failed'));
      }
    }
    return navigator.clipboard.writeText(text);
}

// This function is used by App.tsx for highlighting search results
export function getEscapedQueryRegex(query: string): RegExp {
    const escapedQuery = query.replace(SPECIAL_REGEX_CHARS_REGEX, '\\$&'); // $& means the whole matched string
    return new RegExp(`(${escapedQuery})`, 'gi');
}
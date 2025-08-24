

// Regex for sanitizing bibleTitle in getNoteKey, matching the one in bibleUtils.ts
// This needs to be kept in sync if bibleUtils changes its sanitization.
// For simplicity, we'll assume it's the same pattern for now.
// If bibleUtils.ts is always imported before this, we could potentially reuse it,
// but for modularity, defining it (or a compatible one) here is safer if direct import isn't desired.
const NON_ALPHANUM_HYPHEN_UNDERSCORE_REGEX_LOCAL = new RegExp('[^a-zA-Z0-9-_]', 'g');


export function getNoteKey(bibleTitle: string | undefined, sectionId: string): string | null {
    if (!bibleTitle) {
        return null;
    }
    const safeBibleTitle = bibleTitle.replace(NON_ALPHANUM_HYPHEN_UNDERSCORE_REGEX_LOCAL, '_');
    return `bibleNotes_${safeBibleTitle}_${sectionId}`;
}

export function loadNote(noteKey: string): string {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            return localStorage.getItem(noteKey) || "";
        } catch (e) {
            console.error("Error accessing localStorage (loading note):", e);
            return "";
        }
    }
    return "";
}

export function saveNote(noteKey: string, content: string): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            localStorage.setItem(noteKey, content);
            return true;
        } catch (e) {
            console.error("Error accessing localStorage (saving note):", e);
            return false;
        }
    }
    return false;
}

// --- Initial Tour Guide Functions ---
const TOUR_COMPLETED_KEY = 'narratrix_tour_completed_v1.1'; // Versioning to allow re-showing tour on major updates

export function hasCompletedTour(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            return localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
        } catch (e) {
            console.error("Error accessing localStorage (checking tour status):", e);
            return true; // Fail safe to not show tour
        }
    }
    return true; // No localStorage, don't show tour
}

export function setTourCompleted(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        } catch (e) {
            console.error("Error accessing localStorage (setting tour status):", e);
        }
    }
}

export function resetTourStatus(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            localStorage.removeItem(TOUR_COMPLETED_KEY);
        } catch (e) {
            console.error("Error accessing localStorage (resetting tour status):", e);
        }
    }
}

// --- Post-Load Tour Guide Functions ---
const POST_LOAD_TOUR_COMPLETED_KEY = 'narratrix_post_load_tour_completed_v1';

export function hasCompletedPostLoadTour(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            return localStorage.getItem(POST_LOAD_TOUR_COMPLETED_KEY) === 'true';
        } catch (e) {
            console.error("Error accessing localStorage (checking post-load tour):", e);
            return true; 
        }
    }
    return true; 
}

export function setPostLoadTourCompleted(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            localStorage.setItem(POST_LOAD_TOUR_COMPLETED_KEY, 'true');
        } catch (e) {
            console.error("Error accessing localStorage (setting post-load tour):", e);
        }
    }
}

export function resetPostLoadTourStatus(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            localStorage.removeItem(POST_LOAD_TOUR_COMPLETED_KEY);
        } catch (e) {
            console.error("Error accessing localStorage (resetting post-load tour):", e);
        }
    }
}

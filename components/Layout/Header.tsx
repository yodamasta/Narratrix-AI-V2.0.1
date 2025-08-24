

import React from 'react';
import { APP_NAME, APP_VERSION } from '../../constants'; // Import APP_NAME and APP_VERSION

interface HeaderProps {
  bibleTitle: string; // This will be projectInfo.title OR APP_NAME from App.tsx
  bibleSubtitle: string;
  isBibleLoaded: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onShowPoster?: () => void;
  isGeminiKeyAvailable: boolean;
}

const Header: React.FC<HeaderProps> = ({
  bibleTitle,
  bibleSubtitle,
  isBibleLoaded,
  searchQuery,
  onSearchQueryChange,
  onShowPoster,
  isGeminiKeyAvailable,
}) => {
  return (
    <header className="bg-slate-800 text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="flex-grow min-w-0">
            <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight text-teal-400 ${isBibleLoaded ? 'truncate' : 'overflow-visible'}`}>
              {isBibleLoaded ? bibleTitle : (
                <>
                  {APP_NAME}
                  <sup className="text-[0.55em] sm:text-[0.6em] font-normal ml-1 opacity-80 relative -top-[0.4em]">
                    {APP_VERSION}
                  </sup>
                </>
              )}
            </h1>
            <p className="mt-1 text-md sm:text-lg text-slate-400 truncate" title={bibleSubtitle}>
              {bibleSubtitle}
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {isBibleLoaded && isGeminiKeyAvailable && onShowPoster && (
              <button
                onClick={onShowPoster}
                title="Afficher l'affiche du film"
                aria-label="Afficher l'affiche du film"
                className="p-2 rounded-full text-teal-400 hover:text-teal-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition-colors duration-150"
              >
                <span className="material-icons-outlined text-2xl sm:text-3xl">movie</span>
              </button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <input
            type="search"
            id="globalSearchInput"
            placeholder="Rechercher dans la Bible..."
            className="w-full p-2.5 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isBibleLoaded}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
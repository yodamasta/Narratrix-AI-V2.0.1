

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BibleData, SearchResultItem } from './types';
import { APP_NAME, COMPLETE_BLANK_BIBLE_STRUCTURE, TABS_CONFIG, INITIAL_LOADING_MESSAGE, API_KEY_ERROR_MESSAGE, TOUR_STEPS, POST_LOAD_TOUR_STEPS } from './constants';
import { performSearch, getEscapedQueryRegex } from './services/bibleUtils';
import { isGeminiApiKeyAvailable } from './services/geminiService';
import { hasCompletedTour, setTourCompleted, resetTourStatus, hasCompletedPostLoadTour, setPostLoadTourCompleted, resetPostLoadTourStatus } from './services/localStorageService';

import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import BibleLoader from './components/BibleLoader/BibleLoader';
import Modal from './components/UI/Modal';
import TourGuide from './components/UI/TourGuide';
import ChatModal from './components/ChatModal/ChatModal';
import MoviePosterModal from './components/UI/MoviePosterModal'; 

// Tab Components
import DashboardTab from './components/Tabs/DashboardTab';
import PitchTab from './components/Tabs/PitchTab';
import UniversTab from './components/Tabs/UniversTab';
import SystemeMemoireTab from './components/Tabs/SystemeMemoireTab';
import PersonnagesTab from './components/Tabs/PersonnagesTab';
import EnvironnementsTab from './components/Tabs/EnvironnementsTab';
import ObjetsMysteresTab from './components/Tabs/ObjetsMysteresTab';
import ChronologieTab from './components/Tabs/ChronologieTab';
import CartographieRelationsTab from './components/Tabs/CartographieRelationsTab';
import StructureTab from './components/Tabs/StructureTab';
import ThemesTab from './components/Tabs/ThemesTab';
import GlossaireTab from './components/Tabs/GlossaireTab';
import JournalProtagonisteTab from './components/Tabs/JournalProtagonisteTab';
import LaboratoireIATab from './components/Tabs/LaboratoireIATab/LaboratoireIATab';
import AdaptikTab from './components/Tabs/AdaptikTab/AdaptikTab';
import PagerGeneratorTab from './components/Tabs/PagerGeneratorTab/PagerGeneratorTab';
import ProcessusOutilsTab from './components/Tabs/ProcessusOutilsTab';

const App: React.FC = () => {
  const [bibleData, setBibleData] = useState<BibleData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('processus_outils');
  const [statusMessage, setStatusMessage] = useState<string>(INITIAL_LOADING_MESSAGE);
  const [isStatusError, setIsStatusError] = useState<boolean>(false);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalMaxWidth, setModalMaxWidth] = useState<string>('max-w-2xl');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  
  const navRef = useRef<HTMLElement>(null);
  const [navHeight, setNavHeight] = useState(60); 

  const isBibleLoaded = useMemo(() => !!bibleData, [bibleData]);
  const geminiKeyAvailable = isGeminiApiKeyAvailable();
  const [activeLabToolId, setActiveLabToolId] = useState<string | null>(null);

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false); 
  
  const [tourState, setTourState] = useState({ stepIndex: 0, isActive: false });
  const [postLoadTourState, setPostLoadTourState] = useState({ stepIndex: 0, isActive: false });

  const openChatModal = () => setIsChatModalOpen(true);
  const closeChatModal = () => setIsChatModalOpen(false);
  const openPosterModal = () => setIsPosterModalOpen(true);
  const closePosterModal = () => setIsPosterModalOpen(false);

  const handleSetStatusMessage: (message: string, isError?: boolean) => void = useCallback((message: string, isError: boolean = false) => {
    setStatusMessage(message);
    setIsStatusError(isError);
    if (message) {
        if (!isError) {
            setTimeout(() => {
                setStatusMessage(prev => prev === message ? "" : prev);
            }, 4000);
        }
    }
  }, [setStatusMessage, setIsStatusError]);

  const showPosterAfterTour = useCallback(() => {
    if (geminiKeyAvailable && bibleData) {
        handleSetStatusMessage("Le guide est terminé. Préparation de l'affiche...", false);
        setIsPosterModalOpen(true);
    } else if (!geminiKeyAvailable && bibleData) {
        handleSetStatusMessage("Le guide est terminé. L'affiche ne peut être générée sans clé API Gemini.", false);
    }
  }, [geminiKeyAvailable, bibleData, handleSetStatusMessage]);

  // --- Initial Tour Logic ---
  const handleTourSkip = useCallback(() => {
    setTourState({ stepIndex: 0, isActive: false });
    setTourCompleted();
  }, []);
  
  const handleTourNext = useCallback(() => {
    if (tourState.stepIndex < TOUR_STEPS.length - 1) {
        setTourState(prev => ({ ...prev, stepIndex: prev.stepIndex + 1 }));
    } else {
        handleTourSkip();
    }
  }, [tourState.stepIndex, handleTourSkip]);

  const handleTourPrev = () => {
      if (tourState.stepIndex > 0) {
          setTourState(prev => ({ ...prev, stepIndex: prev.stepIndex - 1 }));
      }
  };
  
  const handleRestartTour = () => {
      if(postLoadTourState.isActive) handlePostLoadTourSkip(); // Ensure only one tour is active
      resetTourStatus();
      setTimeout(() => {
          setTourState({ stepIndex: 0, isActive: true });
      }, 100);
  }

  // --- Post-Load Tour Logic ---
  const handlePostLoadTourSkip = useCallback(() => {
    setPostLoadTourState({ stepIndex: 0, isActive: false });
    setPostLoadTourCompleted();
    showPosterAfterTour();
    setActiveTab('dashboard'); // Reset view to dashboard
    setActiveLabToolId(null); // Also reset any selected tool in the lab
  }, [showPosterAfterTour]);

  const handlePostLoadTourNext = useCallback(() => {
    if (postLoadTourState.stepIndex < POST_LOAD_TOUR_STEPS.length - 1) {
      const nextStepIndex = postLoadTourState.stepIndex + 1;
      const nextStep = POST_LOAD_TOUR_STEPS[nextStepIndex];
      // Check if the next step is a tab button and switch to it
      const tabMatch = nextStep.selector.match(/button\[data-tab="([^"]+)"\]/);
      if (tabMatch && tabMatch[1]) {
        setActiveTab(tabMatch[1]);
      }
      setPostLoadTourState(prev => ({ ...prev, stepIndex: nextStepIndex }));
    } else {
      handlePostLoadTourSkip();
    }
  }, [postLoadTourState.stepIndex, handlePostLoadTourSkip]);
  
  const handlePostLoadTourPrev = () => {
    if (postLoadTourState.stepIndex > 0) {
      const prevStepIndex = postLoadTourState.stepIndex - 1;
      const prevStep = POST_LOAD_TOUR_STEPS[prevStepIndex];
      const currentStep = POST_LOAD_TOUR_STEPS[postLoadTourState.stepIndex];
  
      // Check if the previous step is a tab button and switch to it
      const tabMatch = prevStep.selector.match(/button\[data-tab="([^"]+)"\]/);
      if (tabMatch && tabMatch[1]) {
        setActiveTab(tabMatch[1]);
      } else if (currentStep.selector.match(/button\[data-tab="([^"]+)"\]/)) {
        // If moving away from a tab step to a non-tab step, revert to dashboard
        setActiveTab('dashboard');
      }
      
      setPostLoadTourState(prev => ({ ...prev, stepIndex: prevStepIndex }));
    }
  };

  const handleRestartPostLoadTour = () => {
      if(tourState.isActive) handleTourSkip(); // Ensure only one tour is active
      resetPostLoadTourStatus();
      setTimeout(() => {
          setPostLoadTourState({ stepIndex: 0, isActive: true });
      }, 100);
  }

  // Effect to start initial tour on first visit
  useEffect(() => {
    const tourHasBeenCompleted = hasCompletedTour();
    if (!tourHasBeenCompleted && !isBibleLoaded) {
        const timer = setTimeout(() => {
            setTourState({ stepIndex: 0, isActive: true });
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [isBibleLoaded]);
  

 useEffect(() => {
    if (!geminiKeyAvailable) {
      handleSetStatusMessage(API_KEY_ERROR_MESSAGE, true);
    }
  
    if (!isBibleLoaded) {
      if (activeTab !== 'processus_outils') {
        setActiveTab('processus_outils'); 
      }
      setActiveLabToolId(null); 
    } else {
      const aiTabsRequiringKey = ['adaptik', 'laboratoire_ia', 'journal_protagoniste', 'pager_generator'];
      if (aiTabsRequiringKey.includes(activeTab) && !geminiKeyAvailable && activeTab !== "dashboard") {
        setActiveTab('dashboard'); 
        setActiveLabToolId(null); 
        handleSetStatusMessage(API_KEY_ERROR_MESSAGE + " L'onglet actif a été changé car il nécessite une clé API.", true);
      }
    }
  }, [isBibleLoaded, geminiKeyAvailable, handleSetStatusMessage, activeTab]);


  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === navRef.current) {
          setNavHeight((entry.target as HTMLElement).offsetHeight);
        }
      }
    });

    if (navRef.current) {
      observer.observe(navRef.current);
      setNavHeight(navRef.current.offsetHeight); 
    }
    
    return () => {
      if (navRef.current) observer.unobserve(navRef.current);
      observer.disconnect();
    };
  }, []); 


  const handleBibleLoad = (data: BibleData) => {
    if(tourState.isActive) handleTourSkip();

    setBibleData(data);
    handleSetStatusMessage("Bible chargée avec succès ! Démarrage du guide...", false);
    setActiveTab('dashboard'); 
    setSearchQuery(''); 
    setSearchResults([]);
    setActiveLabToolId(null);

    // Trigger post-load tour if not completed
    if (!hasCompletedPostLoadTour()) {
        setTimeout(() => {
            setPostLoadTourState({ stepIndex: 0, isActive: true });
        }, 700);
    }
  };

  const handleBibleClear = () => {
    setBibleData(null);
    handleSetStatusMessage(`Application réinitialisée. Chargez une nouvelle Bible dans ${APP_NAME}.`, false);
    setActiveTab('processus_outils'); 
    setSearchQuery('');
    setSearchResults([]);
    setActiveLabToolId(null);
    setIsPosterModalOpen(false); 
  };

  const handleTabChange = (tabId: string) => {
    if (!isBibleLoaded && tabId !== 'processus_outils' && tabId !== 'dashboard') { 
        handleSetStatusMessage("Veuillez d'abord charger une Bible JSON.", true);
        setActiveTab('processus_outils'); 
        return;
    }
    if (tabId === 'dashboard' && !isBibleLoaded) {
        handleSetStatusMessage("Veuillez d'abord charger une Bible JSON pour voir le Tableau de Bord.", true);
        setActiveTab('processus_outils');
        return;
    }

    const aiTabsRequiringKey = ['laboratoire_ia', 'adaptik', 'journal_protagoniste', 'pager_generator'];
    if (aiTabsRequiringKey.includes(tabId) && !geminiKeyAvailable) {
      handleSetStatusMessage(API_KEY_ERROR_MESSAGE + " L'onglet sélectionné nécessite une clé API.", true);
      return;
    }
    if (tabId === 'laboratoire_ia' && activeLabToolId) {
      // Keep activeLabToolId if switching to the main lab tab
    } else if (tabId !== 'laboratoire_ia' && activeLabToolId) {
      setActiveLabToolId(null); 
    }
    setActiveTab(tabId);
  };

  const openModal = useCallback((content: React.ReactNode, title?: string, maxWidthClass: string = 'max-w-2xl') => {
    setModalContent(content);
    setModalTitle(title);
    setModalMaxWidth(maxWidthClass);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalContent(null);
    setModalTitle(undefined);
  }, []);

  const renderActiveTabContent = () => {
    const commonProps = {
        bibleTitle: bibleData?.projectInfo.title,
        bibleData: bibleData,
        onSetStatusMessageGlobal: handleSetStatusMessage,
    };
    
    const aiTabsRequiringKey = ['laboratoire_ia', 'adaptik', 'journal_protagoniste', 'pager_generator'];
    if (isBibleLoaded && aiTabsRequiringKey.includes(activeTab) && !geminiKeyAvailable) {
        return (
            <div className="p-4 text-center bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">Clé API Gemini Manquante</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-2">{API_KEY_ERROR_MESSAGE}</p>
                <p className="text-slate-600 dark:text-slate-400">Cet onglet nécessite une clé API Gemini configurée pour fonctionner. Veuillez vous référer à la documentation pour savoir comment configurer votre clé API.</p>
            </div>
        );
    }

    switch (activeTab) {
      case 'dashboard':
        return isBibleLoaded ? <DashboardTab {...commonProps} onTabChange={handleTabChange} onSetActiveToolId={setActiveLabToolId} isGeminiKeyAvailable={geminiKeyAvailable} /> : null;
      case 'pitch':
        return isBibleLoaded ? <PitchTab data={bibleData?.pitchSection} bibleTitle={bibleData?.projectInfo.title} /> : null;
      case 'univers':
        return isBibleLoaded ? <UniversTab data={bibleData?.universSection} bibleTitle={bibleData?.projectInfo.title} /> : null;
      case 'systeme_memoire':
        return isBibleLoaded ? <SystemeMemoireTab data={bibleData?.systemeMemoireSection} bibleTitle={bibleData?.projectInfo.title} activeTab={activeTab} /> : null;
      case 'personnages':
        return isBibleLoaded ? <PersonnagesTab data={bibleData?.personnagesSection} bibleTitle={bibleData?.projectInfo.title} onOpenModal={openModal} /> : null;
      case 'environnements':
        return isBibleLoaded ? <EnvironnementsTab data={bibleData?.environnementsSection} bibleTitle={bibleData?.projectInfo.title} /> : null;
      case 'objets_mysteres':
        return isBibleLoaded ? <ObjetsMysteresTab data={bibleData?.objetsMysteresSection} bibleTitle={bibleData?.projectInfo.title} /> : null;
      case 'chronologie':
        return isBibleLoaded ? <ChronologieTab data={bibleData?.chronologieSection} bibleTitle={bibleData?.projectInfo.title} activeTab={activeTab} onOpenModal={openModal}/> : null;
      case 'cartographie_relations':
        return isBibleLoaded ? <CartographieRelationsTab bibleData={bibleData} bibleTitle={bibleData?.projectInfo.title} activeTab={activeTab} onOpenModal={openModal}/> : null;
      case 'structure':
        return isBibleLoaded ? <StructureTab data={bibleData?.structureSaisonSection} bibleTitle={bibleData?.projectInfo.title} /> : null;
      case 'themes':
        return isBibleLoaded ? <ThemesTab data={bibleData?.themesSection} bibleTitle={bibleData?.projectInfo.title} /> : null;
      case 'glossaire':
        return isBibleLoaded ? <GlossaireTab data={bibleData?.glossaireSection} bibleTitle={bibleData?.projectInfo.title} /> : null;
      case 'journal_protagoniste':
        return isBibleLoaded ? <JournalProtagonisteTab {...commonProps} data={bibleData?.journalProtagonisteSection} /> : null;
      case 'laboratoire_ia':
        return isBibleLoaded ? <LaboratoireIATab {...commonProps} data={bibleData?.laboratoireIASection} activeToolId={activeLabToolId} onSetActiveToolId={setActiveLabToolId} /> : null;
      case 'adaptik':
        return isBibleLoaded ? <AdaptikTab {...commonProps} data={bibleData?.adaptikSection} /> : null;
      case 'pager_generator': 
        return isBibleLoaded ? <PagerGeneratorTab {...commonProps} data={bibleData?.pagerGeneratorSection} /> : null;
      case 'processus_outils':
        return <ProcessusOutilsTab bibleData={bibleData} isBibleLoaded={isBibleLoaded} onRestartTour={handleRestartTour} onRestartPostLoadTour={handleRestartPostLoadTour} />;
      default:
        return <div className="p-4">Contenu non trouvé pour l'onglet: {activeTab}</div>;
    }
  };
  
  const mainContentActualPaddingTop = navHeight + 16; 

  useEffect(() => {
    if (searchQuery.length >= 2 && bibleData) {
      setSearchResults(performSearch(searchQuery, bibleData));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, bibleData]);


  return (
    <div className="flex flex-col min-h-screen font-sans antialiased bg-slate-100 text-slate-900 transition-colors duration-500 ease-in-out">
      <BibleLoader
        onBibleLoad={handleBibleLoad}
        onBibleClear={handleBibleClear}
        statusMessage={isStatusError ? statusMessage : (statusMessage || (!geminiKeyAvailable && !isBibleLoaded ? API_KEY_ERROR_MESSAGE : ''))}
        setStatusMessage={handleSetStatusMessage}
        isBibleLoaded={isBibleLoaded}
        bibleData={bibleData}
      />
      
      <Header
        bibleTitle={bibleData?.projectInfo.title || APP_NAME}
        bibleSubtitle={bibleData?.projectInfo.subtitle || (isBibleLoaded ? "Explorez votre univers." : "Chargez votre univers...")}
        isBibleLoaded={isBibleLoaded}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onShowPoster={openPosterModal} 
        isGeminiKeyAvailable={geminiKeyAvailable}
      />

      <Navigation
        ref={navRef}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isBibleLoaded={isBibleLoaded}
        bibleData={bibleData}
      />
      
      <main 
        className="flex-grow container mx-auto px-2 sm:px-4 lg:px-6 py-6" 
        style={{ paddingTop: `${mainContentActualPaddingTop}px`}} 
      >
        {searchResults.length > 0 ? (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-xl">
            <h2 className="text-xl sm:text-2xl font-semibold text-teal-700 dark:text-teal-300 mb-4">Résultats de la recherche pour "{searchQuery}"</h2>
            <ul className="space-y-3">
              {searchResults.map((result, index) => (
                <li key={index} className="border-b border-slate-200 dark:border-slate-700 pb-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{result.path}</p>
                  <p 
                      className="text-slate-700 dark:text-slate-300" 
                      dangerouslySetInnerHTML={{ __html: result.text.replace(getEscapedQueryRegex(searchQuery), '<mark class="bg-yellow-200 text-yellow-800 px-0.5 rounded">$1</mark>') }} 
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={`p-3 sm:p-5 rounded-lg shadow-xl min-h-[calc(100vh-300px)] ${!isBibleLoaded ? '' : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'}`}>
             {renderActiveTabContent()}
          </div>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle} maxWidthClass={modalMaxWidth}>
        {modalContent}
      </Modal>

      {isBibleLoaded && bibleData && (
        <MoviePosterModal
            isOpen={isPosterModalOpen}
            onClose={closePosterModal}
            bibleData={bibleData}
            onSetStatusMessageGlobal={handleSetStatusMessage}
        />
      )}

      <ChatModal
          isOpen={isChatModalOpen}
          onClose={closeChatModal}
          bibleData={bibleData}
      />
      
      {isBibleLoaded && (
        <button
          onClick={openChatModal}
          className="fixed bottom-6 right-6 bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out z-40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75"
          aria-label="Ouvrir le chat avec l'univers"
          title="Ouvrir le Chat"
        >
          <span className="material-icons-outlined text-2xl leading-none">chat</span>
        </button>
      )}

      <TourGuide
          steps={TOUR_STEPS}
          isActive={tourState.isActive}
          stepIndex={tourState.stepIndex}
          onNext={handleTourNext}
          onPrev={handleTourPrev}
          onSkip={handleTourSkip}
      />
      
      <TourGuide
          steps={POST_LOAD_TOUR_STEPS}
          isActive={postLoadTourState.isActive}
          stepIndex={postLoadTourState.stepIndex}
          onNext={handlePostLoadTourNext}
          onPrev={handlePostLoadTourPrev}
          onSkip={handlePostLoadTourSkip}
      />

      <footer className="bg-slate-800 text-center py-4 text-xs text-slate-400 print:hidden">
        © {new Date().getFullYear()} Saüla Mbelo. Tous droits réservés et propriété intellectuelle.
      </footer>
    </div>
  );
};

export default App;

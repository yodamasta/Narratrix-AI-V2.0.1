import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TABS_CONFIG } from '../../constants';
import { BibleData } from '../../types';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isBibleLoaded: boolean;
  bibleData: BibleData | null;
}

const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  ({ activeTab, onTabChange, isBibleLoaded, bibleData }, ref) => {
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollLeft, setShowScrollLeft] = useState(false);
    const [showScrollRight, setShowScrollRight] = useState(false);

    const checkScrollButtonsVisibility = useCallback(() => {
      const container = tabsContainerRef.current;
      if (container) {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        setShowScrollLeft(scrollLeft > 5); 
        setShowScrollRight(scrollLeft + clientWidth < scrollWidth - 5); 
      }
    }, []);

    useEffect(() => {
      checkScrollButtonsVisibility();
      window.addEventListener('resize', checkScrollButtonsVisibility);
      return () => window.removeEventListener('resize', checkScrollButtonsVisibility);
    }, [checkScrollButtonsVisibility]);

    useEffect(() => {
      const activeTabElement = tabsContainerRef.current?.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
      if (activeTabElement) {
        activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
      const timer = setTimeout(() => checkScrollButtonsVisibility(), 350); 
      return () => clearTimeout(timer);
    }, [activeTab, checkScrollButtonsVisibility]);


    const handleScroll = (direction: 'left' | 'right') => {
      const container = tabsContainerRef.current;
      if (container) {
        const scrollAmount = direction === 'left' ? -container.clientWidth / 1.5 : container.clientWidth / 1.5;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setTimeout(checkScrollButtonsVisibility, 350); 
      }
    };

    useEffect(() => {
        const container = tabsContainerRef.current;
        if (!container) return;

        const handleWheelScroll = (event: WheelEvent) => {
            if (container.scrollWidth > container.clientWidth) {
                event.preventDefault(); 
                container.scrollLeft += event.deltaY; 
                checkScrollButtonsVisibility(); 
            }
        };

        container.addEventListener('wheel', handleWheelScroll, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheelScroll);
        };
    }, [checkScrollButtonsVisibility]);


    const getTabLabel = (tab: typeof TABS_CONFIG[0]) => {
      if (tab.dynamicLabelKey && bibleData) {
          if (tab.id === 'journal_protagoniste' && bibleData.personnagesSection?.heros?.nom) {
              return `Journal de ${bibleData.personnagesSection.heros.nom.split(' ')[0]}`;
          }
      }
      return tab.label;
    }

    return (
      <nav 
          ref={ref}
          id="mainNav" 
          className="bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-700 sticky top-0 z-40 w-full" 
      >
        <div className="container mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex items-center py-1">
            {showScrollLeft && (
              <button
                onClick={() => handleScroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 transition text-teal-600 dark:text-teal-400"
                aria-label="Scroll tabs left"
              >
                <span className="material-icons-outlined text-lg sm:text-xl">chevron_left</span>
              </button>
            )}
            <div
              ref={tabsContainerRef}
              id="tabsContainer"
              className="flex border-b border-slate-300 dark:border-slate-700 -mb-px overflow-x-auto w-full scrollbar-thin scrollbar-thin-dark"
              onScroll={checkScrollButtonsVisibility}
            >
              {TABS_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  disabled={!isBibleLoaded && tab.id !== 'processus_outils'}
                  className={`
                    py-3 sm:py-4 px-2 sm:px-3 md:px-4 border-b-2 
                    text-xs sm:text-sm md:text-base whitespace-nowrap flex items-center 
                    focus:outline-none transition-colors duration-150
                    ${activeTab === tab.id
                      ? 'border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 font-semibold' 
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-300 hover:border-teal-300 dark:hover:border-teal-500'} 
                    ${(!isBibleLoaded && tab.id !== 'processus_outils') ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {tab.icon && <span className="material-icons-outlined mr-1 sm:mr-1.5 text-sm sm:text-base md:text-lg leading-none">{tab.icon}</span>}
                  {getTabLabel(tab)}
                  {tab.newBadge && <span className="ml-1.5 bg-amber-400 text-amber-900 text-[0.6rem] sm:text-[0.65rem] font-bold px-1 py-0.5 rounded-sm leading-none align-super">MAJ</span>}
                </button>
              ))}
            </div>
            {showScrollRight && (
              <button
                onClick={() => handleScroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 transition text-teal-600 dark:text-teal-400"
                aria-label="Scroll tabs right"
              >
                <span className="material-icons-outlined text-lg sm:text-xl">chevron_right</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    );
  }
);

export default Navigation;

import React, { useEffect, useRef, useState } from 'react';
import { ChronologieSection as ChronologieSectionType, EvenementChronologie, BibleData, vis } from '../../types'; 
import { SectionTitle, Paragraph, renderSectionShell, createDefaultMessage } from './TabContentUtils';
import Modal from '../UI/Modal';

interface ChronologieTabProps {
  data?: ChronologieSectionType;
  bibleTitle?: string;
  activeTab: string; 
  onOpenModal: (content: React.ReactNode, title?: string) => void;
}

const groupColorPalettes: { [key: string]: { light: { bgColor: string, textColor: string, borderColor: string }, dark: { bgColor: string, textColor: string, borderColor: string } } } = {
    'Ère des Fondations': {
      light: { bgColor: '#e0f2fe', textColor: '#0c4a6e', borderColor: '#7dd3fc' }, // sky-100, sky-800, sky-300
      dark: { bgColor: '#0c4a6e', textColor: '#e0f2fe', borderColor: '#38bdf8' }, // sky-800, sky-100, sky-500
    },
    'Conflits Majeurs': {
      light: { bgColor: '#fee2e2', textColor: '#991b1b', borderColor: '#fca5a5' }, // red-100, red-800, red-300
      dark: { bgColor: '#7f1d1d', textColor: '#fee2e2', borderColor: '#ef4444' }, // red-900, red-100, red-500
    },
    'Période Sombre': {
        light: { bgColor: '#e5e7eb', textColor: '#1f2937', borderColor: '#9ca3af' }, // gray-200, gray-800, gray-400
        dark: { bgColor: '#374151', textColor: '#f3f4f6', borderColor: '#6b7280' }, // gray-700, gray-100, gray-500
    },
    'Découvertes Scientifiques': {
        light: { bgColor: '#ccfbf1', textColor: '#0f766e', borderColor: '#5eead4' }, // teal-100, teal-700, teal-300
        dark: { bgColor: '#134e4a', textColor: '#99f6e4', borderColor: '#2dd4bf' }, // teal-800, teal-200, teal-400
    },
    'Âge d\'Or': {
        light: { bgColor: '#fef9c3', textColor: '#a16207', borderColor: '#fde047' }, // yellow-100, yellow-700, yellow-400
        dark: { bgColor: '#713f12', textColor: '#fef08a', borderColor: '#facc15' }, // yellow-900, yellow-200, yellow-500
    },
    'Crise Actuelle': { // Example for the screenshot
        light: { bgColor: '#ffedd5', textColor: '#9a3412', borderColor: '#fdba74' }, // orange-100, orange-800, orange-300
        dark: { bgColor: '#7c2d12', textColor: '#fed7aa', borderColor: '#fb923c' }, // orange-900, orange-200, orange-500
    },
    'Conséquences': {
        light: { bgColor: '#ede9fe', textColor: '#5b21b6', borderColor: '#c4b5fd' }, // violet-100, violet-800, violet-300
        dark: { bgColor: '#4c1d95', textColor: '#ddd6fe', borderColor: '#a78bfa' }, // violet-900, violet-100, violet-400
    },
     'Préambule': {
        light: { bgColor: '#e0e7ff', textColor: '#3730a3', borderColor: '#a5b4fc' }, // indigo-100, indigo-800, indigo-300
        dark: { bgColor: '#312e81', textColor: '#c7d2fe', borderColor: '#818cf8' }, // indigo-900, indigo-200, indigo-400
    }
};


const ChronologieTab: React.FC<ChronologieTabProps> = ({ data, bibleTitle, activeTab, onOpenModal }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const visTimelineInstanceRef = useRef<vis.Timeline | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  useEffect(() => {
    const rootElement = document.getElementById('root'); 
    const observer = new MutationObserver((mutationsList) => {
        for(const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                setIsDarkTheme(rootElement?.classList.contains('dark') ?? false);
            }
        }
    });
    if (rootElement) {
        setIsDarkTheme(rootElement.classList.contains('dark'));
        observer.observe(rootElement, { attributes: true });
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (activeTab !== 'chronologie' || !data?.evenements || !timelineRef.current) {
      if (visTimelineInstanceRef.current) {
        visTimelineInstanceRef.current.destroy();
        visTimelineInstanceRef.current = null;
      }
      return;
    }

    if (typeof window.vis === 'undefined' || typeof window.vis.DataSet === 'undefined' || typeof window.vis.Timeline === 'undefined') {
        console.error("vis.js library is not available. Timeline cannot be created.");
        if (timelineRef.current) {
            timelineRef.current.innerHTML = "<p class='text-center text-red-600 dark:text-red-400 p-4'>Erreur : La librairie de chronologie (vis.js) n'a pas pu être chargée.</p>";
        }
        return;
    }

    if (visTimelineInstanceRef.current) {
        visTimelineInstanceRef.current.destroy();
    }

    const itemsArray = data.evenements.map((event: EvenementChronologie) => {
      let item: any = { 
        id: event.id,
        content: event.content || "Événement sans titre",
        start: event.start,
        group: event.group, // Important for group-based styling
        className: event.className || '', // For any other custom, non-color styling
      };
      if (event.end) item.end = event.end;
      if (event.type) item.type = event.type;
      
      let tooltipHtml = `<strong style="color: #E2E8F0;">${(item.content || "").replace(/"/g, '&quot;')}</strong>`;
      if (event.details) {
        tooltipHtml += `<hr class='my-1 border-slate-500'><p class='text-xs !text-slate-300'>${event.details.replace(/\n/g, "<br>")}</p>`;
      }
      item.title = tooltipHtml;
      return item;
    });

    const items = new window.vis.DataSet(itemsArray);
    
    const uniqueGroupObjects = Array.from(new Set(data.evenements.map(event => event.group).filter(g => g)))
        .map(groupName => ({ id: groupName, content: groupName }));
    const groups = new window.vis.DataSet(uniqueGroupObjects);

    const options = {
      stack: true,
      stackSubgroups: false, // Usually false if groups are distinct lanes
      orientation: 'bottom',
      showCurrentTime: true,
      groupOrder: 'content',
      editable: false,
      zoomMin: 1000 * 60 * 60 * 24 * 7, 
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 2000, 
      tooltip: {
        followMouse: true,
        overflowMethod: 'flip', 
        delay: 300,
      },
      selectable: true,
      // No start/end specified here, timeline will auto-fit or use default range
      // This allows the dynamic min/max to work without conflict if data exists
    };

    if (data.evenements.length > 0) {
        const startDates = data.evenements.map(e => new Date(e.start).getTime()).filter(d => !isNaN(d));
        const endDates = data.evenements.map(e => new Date(e.end || e.start).getTime()).filter(d => !isNaN(d));
        
        if (startDates.length > 0) {
            const minTimestamp = Math.min(...startDates);
            (options as any).min = new Date(new Date(minTimestamp).setFullYear(new Date(minTimestamp).getFullYear() -1)); 
            (options as any).start = new Date(minTimestamp);
        }
        if (endDates.length > 0) {
            const maxTimestamp = Math.max(...endDates);
            (options as any).max = new Date(new Date(maxTimestamp).setFullYear(new Date(maxTimestamp).getFullYear() + 1)); 
            (options as any).end = new Date(maxTimestamp);
        }
    }


    try {
        visTimelineInstanceRef.current = new window.vis.Timeline(
            timelineRef.current, 
            items, 
            groups.length > 0 ? groups : undefined, 
            options
        );

        visTimelineInstanceRef.current.on('select', (properties: { items: (string|number)[] }) => {
            const selectedItemIds = properties.items;
            if (selectedItemIds.length > 0) {
                const selectedItemId = selectedItemIds[0];
                const originalEvent = data.evenements.find(e => String(e.id) === String(selectedItemId));
                if (originalEvent && originalEvent.details) {
                    onOpenModal(
                        <Paragraph content={originalEvent.details} className="text-sm text-slate-700 dark:text-slate-200" />,
                        originalEvent.content || "Détails de l'Événement"
                    );
                }
            }
        });
        if (data.evenements.length > 0) visTimelineInstanceRef.current.fit();

    } catch (error) {
        console.error("Erreur lors de la création de la timeline:", error);
        if (timelineRef.current) {
            timelineRef.current.innerHTML = "<p class='text-center text-red-600 dark:text-red-400 p-4'>Erreur lors de la création de la chronologie. Vérifiez la console.</p>";
        }
    }

    return () => {
      if (visTimelineInstanceRef.current) {
        visTimelineInstanceRef.current.destroy();
        visTimelineInstanceRef.current = null;
      }
    };
  }, [data, activeTab, onOpenModal, isDarkTheme]); // Re-render if isDarkTheme changes to apply new styles

  // Dynamic CSS based on isDarkTheme and groupColorPalettes
  const dynamicStyles = `
    /* General vis-item text color and background defaults */
    .vis-item {
      border-color: ${isDarkTheme ? '#475569' : '#cbd5e1'} !important; /* slate-600 dark, slate-300 light */
      background-color: ${isDarkTheme ? '#334155' : '#e2e8f0'} !important; /* slate-700 dark, slate-200 light */
    }
    .vis-item .vis-item-content {
      color: ${isDarkTheme ? '#e2e8f0' : '#1e293b'} !important; /* slate-200 dark, slate-800 light */
    }
    .vis-item.vis-selected {
      border-color: ${isDarkTheme ? '#60a5fa' : '#2563eb'} !important; /* blue-400 dark, blue-600 light */
      background-color: ${isDarkTheme ? '#2563eb' : '#bfdbfe'} !important; /* blue-600 dark, blue-200 light */
    }
    .vis-item.vis-selected .vis-item-content {
      color: ${isDarkTheme ? '#eff6ff' : '#1e40af'} !important; /* blue-50 dark, blue-800 light */
    }

    /* Timeline axis, labels, and grid */
    .vis-time-axis .vis-text { /* Date labels */
      color: ${isDarkTheme ? '#cbd5e1' : '#334155'} !important; /* slate-300 dark, slate-700 light */
    }
    .vis-labelset .vis-label .vis-inner { /* Group labels on the left */
      color: ${isDarkTheme ? '#cbd5e1' : '#334155'} !important; /* slate-300 dark, slate-700 light */
    }
    .vis-panel.vis-left, .vis-panel.vis-right, .vis-panel.vis-center, .vis-panel.vis-top, .vis-panel.vis-bottom {
      border-color: ${isDarkTheme ? '#475569' : '#cbd5e1'} !important; /* slate-600 dark, slate-300 light */
    }
    .vis-time-axis .vis-grid.vis-major {
      border-color: ${isDarkTheme ? '#475569' : '#cbd5e1'} !important; /* slate-600 dark, slate-300 light */
    }
    .vis-time-axis .vis-grid.vis-minor {
      border-color: ${isDarkTheme ? '#334155' : '#e2e8f0'} !important; /* slate-700 dark, slate-200 light */
    }
    .vis-current-time {
      background-color: ${isDarkTheme ? '#f43f5e' : '#ec4899'} !important; /* rose-500 dark, pink-500 light */
    }
    .vis-timeline { /* Background of the timeline chart area */
        background: ${isDarkTheme ? '#1e293b' : '#f8fafc'}; /* slate-800 dark, slate-50 light */
    }
    .vis-panel.vis-left { /* Background of the group labels panel */
        background: ${isDarkTheme ? '#1e293b' : '#f8fafc'}; /* slate-800 dark, slate-50 light */
    }


    /* Event group color palettes */
    ${Object.entries(groupColorPalettes).map(([group, palettes]) => {
        const groupSlug = group.replace(/[\s\/]+/g, '-').replace(/[^a-z0-9_-]/gi, '').toLowerCase();
        const palette = isDarkTheme ? palettes.dark : palettes.light;
        return `
          .vis-item.vis-group-${groupSlug} {
            background-color: ${palette.bgColor} !important;
            border-color: ${palette.borderColor} !important;
          }
          .vis-item.vis-group-${groupSlug} .vis-item-content {
            color: ${palette.textColor} !important;
          }
          .vis-item.vis-group-${groupSlug}.vis-selected { /* Ensure selected styles for groups also have contrast */
            background-color: ${isDarkTheme ? '#60a5fa' : '#2563eb'} !important; /* Example: blue highlight */
            border-color: ${isDarkTheme ? '#3b82f6' : '#1d4ed8'} !important;
          }
          .vis-item.vis-group-${groupSlug}.vis-selected .vis-item-content {
            color: ${isDarkTheme ? '#eff6ff' : '#1e3a8a'} !important; /* Ensure text is readable on highlight */
          }
        `;
    }).join('')}
  `;

  return renderSectionShell(
    "chronologie",
    data,
    "Chronologie Principale",
    "⏳",
    bibleTitle,
    "Données de chronologie non disponibles. Vérifiez que votre JSON contient une section 'chronologieSection' avec des 'evenements'.",
    <>
      <style>{dynamicStyles}</style>
      {data?.introduction && <Paragraph content={data.introduction} />}
      <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1 mb-3">Double-cliquez sur un événement pour afficher ses détails s'ils existent.</p>
      <div id="timelineContainerWrapper" className="mt-6">
        {(!data || !data.evenements || data.evenements.length === 0) ? (
            createDefaultMessage("Aucun événement défini pour cette chronologie.")
        ) : (
            <div ref={timelineRef} className="h-[500px] w-full border border-transparent rounded-lg shadow-inner"></div>
        )}
      </div>
    </>
  );
};

export default ChronologieTab;

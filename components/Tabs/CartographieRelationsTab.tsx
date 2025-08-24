import React, { useEffect, useRef, useState } from 'react';
import { BibleData, Relation, vis } from '../../types';
import { SectionTitle, Paragraph, renderSectionShell, createDefaultMessage } from './TabContentUtils';

interface CartographieRelationsTabProps {
  bibleData: BibleData | null; 
  bibleTitle?: string;
  activeTab: string;
  onOpenModal: (content: React.ReactNode, title?: string) => void;
}

interface VisNode {
  id: string;
  label: string;
  group?: string;
  title?: string; 
  originalData?: any; 
}

interface VisEdge {
  from: string;
  to: string;
  label?: string;
  arrows?: string;
  title?: string; 
  color?: { color?: string; highlight?: string; hover?: string };
  font?: { align?: string; size?: number; color?: string };
}

const CartographieRelationsTab: React.FC<CartographieRelationsTabProps> = ({ bibleData, bibleTitle, activeTab, onOpenModal }) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const visNetworkInstanceRef = useRef<vis.Network | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
        const darkThemeApplied = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark') || document.getElementById('root')?.classList.contains('dark');
        setIsDarkTheme(!!darkThemeApplied);
    };
    checkTheme();
  }, [bibleData, activeTab]);


  useEffect(() => {
    if (activeTab !== 'cartographie_relations' || !bibleData || !networkRef.current) {
      if (visNetworkInstanceRef.current) {
        visNetworkInstanceRef.current.destroy();
        visNetworkInstanceRef.current = null;
      }
      return;
    }

    if (typeof window.vis === 'undefined' || typeof window.vis.DataSet === 'undefined' || typeof window.vis.Network === 'undefined') {
        console.error("vis.js library is not available. Network graph cannot be created.");
        if (networkRef.current) {
            networkRef.current.innerHTML = "<p class='text-center text-red-600 dark:text-red-400 p-4'>Erreur : La librairie de cartographie (vis.js) n'a pas pu être chargée.</p>";
        }
        return;
    }
    
    if (visNetworkInstanceRef.current) {
        visNetworkInstanceRef.current.destroy();
        visNetworkInstanceRef.current = null;
    }

    const nodes = new window.vis.DataSet<VisNode>([]);
    const edges = new window.vis.DataSet<VisEdge>([]);
    
    const collectedItems: {item: any, group: string, labelField: string}[] = [];

    if (bibleData.personnagesSection) {
      if (bibleData.personnagesSection.heros?.id) collectedItems.push({item: bibleData.personnagesSection.heros, group: 'Personnages', labelField: 'nomComplet'});
      bibleData.personnagesSection.personnagesPrincipaux?.forEach(p => { if(p?.id) collectedItems.push({item: p, group: 'Personnages', labelField: 'nom'}) });
    }
    if (bibleData.environnementsSection) {
      if (bibleData.environnementsSection.laVille?.id) collectedItems.push({item: bibleData.environnementsSection.laVille, group: 'Lieux', labelField: 'nom'});
      bibleData.environnementsSection.lieux?.forEach(l => { if(l?.id) collectedItems.push({item: l, group: 'Lieux', labelField: 'nom'}) });
    }
    if (bibleData.objetsMysteresSection?.objets) {
      bibleData.objetsMysteresSection.objets.forEach(o => { if(o?.id) collectedItems.push({item: o, group: 'Objets/Mystères', labelField: 'nom'}) });
    }
    if (bibleData.universSection?.elementsUniques) {
      bibleData.universSection.elementsUniques.forEach(u => { if(u?.id) collectedItems.push({item: u, group: 'Concepts Univers', labelField: 'nom'}) });
    }
    if (bibleData.systemeMemoireSection?.typesElementsSysteme) {
      bibleData.systemeMemoireSection.typesElementsSysteme.forEach(s => { if(s?.id) collectedItems.push({item: s, group: 'Éléments Système', labelField: 'nom'}) });
    }
    
    collectedItems.forEach(({item, group, labelField}) => {
        if (!item || typeof item.id !== 'string' || item.id.trim() === '') return;
        let nodeLabel = (item && typeof item[labelField] === 'string' && item[labelField].trim()) ? item[labelField].trim() : (typeof item.id === 'string' ? item.id.trim() : '');
        if (nodeLabel === '') return;

        if (!nodes.get(item.id)) {
             nodes.add({ 
                id: item.id, 
                label: nodeLabel, 
                group: group, 
                title: `<strong>${nodeLabel.replace(/"/g, '&quot;')}</strong><br><small><em>${group}</em> - ID: ${item.id}</small>`,
                originalData: item 
            });
        }
    });

    collectedItems.forEach(({item}) => {
        if (item && item.relations && Array.isArray(item.relations)) {
            item.relations.forEach((rel: Relation) => {
                if (typeof item.id === 'string' && item.id.trim() !== '' && 
                    typeof rel.targetId === 'string' && rel.targetId.trim() !== '' && 
                    typeof rel.type === 'string' && rel.type.trim() !== '' &&
                    nodes.get(item.id) && nodes.get(rel.targetId)) {
                    edges.add({ 
                        from: item.id, 
                        to: rel.targetId, 
                        label: rel.type, 
                        arrows: 'to',
                        title: `<strong>${rel.type.replace(/"/g, '&quot;')}</strong>${rel.details ? `<hr><small>${rel.details.replace(/\n/g, "<br>").replace(/"/g, '&quot;')}</small>` : ''}`
                    });
                }
            });
        }
    });

    const groupColorsLight: { [key: string]: { background: string, border: string } } = {
      'Personnages': { background: '#0d9488', border: '#0f766e' }, // Teal
      'Lieux': { background: '#f59e0b', border: '#d97706' },        // Amber
      'Objets/Mystères': { background: '#8b5cf6', border: '#7c3aed'}, // Violet
      'Concepts Univers': { background: '#3b82f6', border: '#2563eb'}, // Blue
      'Éléments Système': { background: '#ec4899', border: '#db2777'},// Pink
    };
    const groupColorsDark: { [key: string]: { background: string, border: string } } = {
      'Personnages': { background: '#14b8a6', border: '#0d9488' },    // Lighter Teal
      'Lieux': { background: '#fbbf24', border: '#f59e0b' },        // Lighter Amber
      'Objets/Mystères': { background: '#a78bfa', border: '#8b5cf6'}, // Lighter Violet
      'Concepts Univers': { background: '#60a5fa', border: '#3b82f6'}, // Lighter Blue
      'Éléments Système': { background: '#f472b6', border: '#ec4899'},// Lighter Pink
    };
    const currentGroupColors = isDarkTheme ? groupColorsDark : groupColorsLight;


    const options = {
      nodes: {
        shape: 'dot',
        size: 18, 
        font: {
          size: 14, 
          color: isDarkTheme ? '#e5e7eb' : '#1f2937' // gray-200 for dark, slate-800 for light
        },
        borderWidth: 3, 
        shadow: true,
        color: {
            background: isDarkTheme ? '#374151' : '#e0e7ff', // gray-700 for dark, indigo-100 for light
            border: isDarkTheme ? '#4b5563' : '#a5b4fc',     // gray-600 for dark, indigo-300 for light
            highlight: {
                background: isDarkTheme ? '#4b5563' : '#C7D2FE',
                border: isDarkTheme ? '#6b7280' : '#818CF8'
            },
            hover: {
                background: isDarkTheme ? '#4b5563' : '#C7D2FE',
                border: isDarkTheme ? '#6b7280' : '#818CF8'
            }
        }
      },
      edges: {
        width: 1.5,
        smooth: {
          type: 'continuous'
        },
        font: { 
           size: 12, 
           color: isDarkTheme ? '#d1d5db' : '#374151', // gray-300 for dark, gray-700 for light
           strokeWidth: 0, 
           align: 'middle'
        },
        color: {
          color: isDarkTheme ? '#4b5563' : '#cbd5e1', // gray-600 for dark, slate-300 for light
          highlight: isDarkTheme ? '#5eead4' : '#0d9488', // teal-300 for dark, teal-600 for light
          hover: isDarkTheme ? '#2dd4bf' : '#14b8a6',   // teal-400 for dark, teal-500 for light
        }
      },
      groups: Object.keys(currentGroupColors).reduce((acc, key) => {
        acc[key] = { 
          color: { 
            background: currentGroupColors[key].background, 
            border: currentGroupColors[key].border 
          }, 
          font: { color: isDarkTheme ? '#0f172a' : '#ffffff', size: 14 } // slate-900 for dark text on light group, white for light text on dark group
        }; 
        return acc;
      }, {} as any),
      physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50, 
          centralGravity: 0.01,   
          springLength: 150,     
          springConstant: 0.18,  
          damping: 0.45 
        },
        minVelocity: 0.75,
        stabilization: { iterations: 250, fit: true } 
      },
      interaction: {
        hover: true,
        tooltipDelay: 200, 
        navigationButtons: true,
        keyboard: true,
      },
      layout: {
        improvedLayout: true,
      },
    };

    try {
      if (!networkRef.current) throw new Error("Network container ref is null.");
      visNetworkInstanceRef.current = new window.vis.Network(networkRef.current, { nodes, edges }, options);
      
      visNetworkInstanceRef.current.on("doubleClick", function (params: { nodes: (string | number)[] }) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const nodeData: VisNode | null = nodes.get(nodeId);
            if (nodeData && nodeData.originalData) {
                 const content = (
                    <> 
                        <Paragraph content={nodeData.originalData.description || "Aucune description détaillée disponible."} />
                        {nodeData.originalData.relations && nodeData.originalData.relations.length > 0 && (
                            <>
                                <h5 className="font-semibold mt-3 mb-1 text-slate-700 dark:text-slate-300">Relations:</h5>
                                <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400">
                                    {nodeData.originalData.relations.map((rel: Relation, idx: number) => {
                                        const targetNode = nodes.get(rel.targetId);
                                        return (
                                            <li key={idx}>
                                                {rel.type} <strong className="text-slate-700 dark:text-slate-200">{targetNode?.label || rel.targetId}</strong> {rel.details ? `(${rel.details})` : ''}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                    </>
                );
                onOpenModal(
                    content,
                    `${nodeData.originalData.icon || ''} ${nodeData.label || 'Détails'}`
                );
            }
        }
      });
      visNetworkInstanceRef.current.fit(); 

    } catch (error) {
      console.error("Erreur détaillée lors de la création du réseau vis.js:", error);
      if (networkRef.current) {
          const errorMessage = error instanceof Error ? error.message : "Erreur inconnue.";
          networkRef.current.innerHTML = `<p class='text-center text-red-600 dark:text-red-400 p-4'>Erreur lors de la création de la cartographie: ${errorMessage}. Vérifiez la console pour plus de détails.</p>`;
      }
    }

    return () => {
      if (visNetworkInstanceRef.current) {
        visNetworkInstanceRef.current.destroy();
        visNetworkInstanceRef.current = null;
      }
    };
  }, [bibleData, activeTab, onOpenModal, isDarkTheme]);

  return renderSectionShell(
    "cartographie_relations",
    bibleData ? { titre: "Cartographie des Relations" } : undefined, 
    "Cartographie des Relations",
    "lan",
    bibleTitle,
    "Données de la Bible non chargées ou insuffisantes pour la cartographie. Chargez une Bible avec des éléments et des relations définis.",
    <>
      <Paragraph content="Visualisez les connexions entre les personnages, lieux, objets et concepts de votre univers. Double-cliquez sur un nœud pour plus de détails." />
      {(!bibleData || (!bibleData.personnagesSection && !bibleData.environnementsSection && !bibleData.objetsMysteresSection)) ? (
        createDefaultMessage("La Bible ne contient pas assez de données (personnages, lieux, objets) pour générer une cartographie.")
      ) : (
        <div ref={networkRef} className="h-[600px] w-full border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 shadow-inner mt-4"></div>
      )}
    </>
  );
};

export default CartographieRelationsTab;
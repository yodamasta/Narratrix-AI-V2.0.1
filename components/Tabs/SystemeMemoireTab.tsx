import React, { useState, useEffect, useRef } from 'react';
import { SystemeMemoireSection as SystemeMemoireSectionType, TypeElementSysteme, ReglesCruciales } from '../../types';
import { SectionTitle, SubTitle, Paragraph, renderSectionShell, createDefaultMessage } from './TabContentUtils';
import Card from '../UI/Card';
import SortControls from '../UI/SortControls';

interface SystemeMemoireTabProps {
  data?: SystemeMemoireSectionType;
  bibleTitle?: string;
  activeTab: string;
}

const SystemeMemoireTab: React.FC<SystemeMemoireTabProps> = ({ data, bibleTitle, activeTab }) => {
  const [sortedTypesElements, setSortedTypesElements] = useState<TypeElementSysteme[]>(data?.typesElementsSysteme || []);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null); // Using any for Chart.js instance
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    // Check if the document body or a relevant parent has the 'dark' class
    const checkTheme = () => {
        const darkThemeApplied = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark') || document.getElementById('root')?.classList.contains('dark');
        setIsDarkTheme(!!darkThemeApplied);
    };
    checkTheme();
    // Optional: Use a MutationObserver if the theme can change dynamically without a page reload
    // For now, checking once on mount and when data/activeTab changes is likely sufficient.
  }, [data, activeTab]);


  useEffect(() => {
    setSortedTypesElements(data?.typesElementsSysteme || []);
  }, [data]);

  useEffect(() => {
    if (activeTab === 'systeme_memoire' && data?.reglesCruciales?.regleImpactante && chartRef.current) {
      const rule = data.reglesCruciales.regleImpactante;
      if (rule.labelsImpact && rule.dataPointsImpact && rule.impacts &&
          rule.impacts.length === rule.labelsImpact.length &&
          rule.labelsImpact.length === rule.dataPointsImpact.length) {
        
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (ctx && typeof window.Chart !== 'undefined') { 
          chartInstanceRef.current = new window.Chart(ctx, { 
            type: 'bar',
            data: {
              labels: rule.labelsImpact,
              datasets: [{
                label: rule.titre || 'Impact de la Règle',
                data: rule.dataPointsImpact,
                backgroundColor: isDarkTheme 
                  ? ['rgba(20,184,166,0.7)', 'rgba(13,148,136,0.7)', 'rgba(15,118,110,0.7)', 'rgba(19,78,74,0.7)'].slice(0, rule.dataPointsImpact.length) // Darker Teals
                  : ['rgba(20,184,166,0.5)', 'rgba(13,148,136,0.5)', 'rgba(15,118,110,0.5)', 'rgba(19,78,74,0.5)'].slice(0, rule.dataPointsImpact.length), // Lighter Teals
                borderColor: isDarkTheme
                  ? ['#0D9488', '#0F766E', '#134E4A', '#042f2e'].slice(0, rule.dataPointsImpact.length) // Darker Teals border
                  : ['#14B8A6', '#0D9488', '#0F766E', '#134E4A'].slice(0, rule.dataPointsImpact.length),
                borderWidth: 1,
                borderRadius: 5,
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { 
                    beginAtZero: true, 
                    display: false, 
                    max: Math.max(...(rule.dataPointsImpact || [0]), 0) + 1,
                    ticks: { color: isDarkTheme ? '#9ca3af' : '#374151' } // gray-400 for dark, gray-700 for light
                },
                x: { 
                    ticks: { color: isDarkTheme ? '#9ca3af' : '#4b5563', font: { size: 10 } }  // gray-400 for dark, gray-600 for light
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  enabled: true, 
                  callbacks: {
                    label: function(context) {
                        const impactIndex = context.dataIndex;
                        if (rule.impacts && rule.impacts[impactIndex]) {
                            return `${rule.impacts[impactIndex].niveau}: ${rule.impacts[impactIndex].effet}`;
                        }
                        return '';
                    }
                  }
                }
              }
            }
          });
        }
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, activeTab, isDarkTheme]); // Add isDarkTheme to dependencies

  const renderTypesElements = (items: TypeElementSysteme[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {items.map((type) => (
        <Card key={type.id} title={type.nom} icon={type.icon || '🧩'}>
          {type.nature && <Paragraph content={`<strong>Nature:</strong> ${type.nature}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1" />}
          {type.fonctionNarrative && <Paragraph content={`<strong>Fonction Narrative:</strong> ${type.fonctionNarrative}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1" />}
        </Card>
      ))}
    </div>
  );
  
  const renderReglesCruciales = (regles?: ReglesCruciales) => {
    if (!regles) return createDefaultMessage("Aucune règle cruciale définie.");
    const { regleImpactante, autreRegleImportante, elementSpecifiqueSysteme, ...autresRegles } = regles;
    
    return (
        <div className="space-y-6">
            {regleImpactante && (
                <Card title={regleImpactante.titre || "Règle à Impact Fort"} icon="📈">
                    <Paragraph content={regleImpactante.description} className="text-sm text-slate-600 dark:text-slate-400 mb-2" />
                    {regleImpactante.impacts && (
                        <ul className="list-disc list-inside space-y-1 mt-2 pl-1 text-sm text-slate-600 dark:text-slate-400">
                            {regleImpactante.impacts.map((impact, idx) => (
                                <li key={idx}><strong>{impact.niveau}:</strong> {impact.effet}</li>
                            ))}
                        </ul>
                    )}
                    {regleImpactante.labelsImpact && regleImpactante.dataPointsImpact && (
                        <div className="bg-white dark:bg-slate-700 p-4 sm:p-6 rounded-xl shadow-lg mt-4">
                            <div className="relative h-64 sm:h-80 w-full max-w-2xl mx-auto">
                                <canvas ref={chartRef}></canvas>
                            </div>
                        </div>
                    )}
                </Card>
            )}
            {autreRegleImportante && (
                <Card title={autreRegleImportante.titre || "Autre Règle Importante"} icon="📜">
                    <Paragraph content={autreRegleImportante.description} className="text-sm text-slate-600 dark:text-slate-400 mb-2" />
                    {autreRegleImportante.phraseCle && <Paragraph content={`<em>"${autreRegleImportante.phraseCle}"</em>`} className="italic text-teal-600 dark:text-teal-400 text-center mt-2 text-sm" />}
                </Card>
            )}
            {elementSpecifiqueSysteme && (
                 <Card title={elementSpecifiqueSysteme.titre || "Élément Spécifique"} icon="🧪">
                    <Paragraph content={elementSpecifiqueSysteme.description} className="text-sm text-slate-600 dark:text-slate-400 mb-1" />
                    {elementSpecifiqueSysteme.role && <Paragraph content={`<strong>Rôle principal:</strong> ${elementSpecifiqueSysteme.role}`} className="text-sm text-slate-600 dark:text-slate-400 mb-1" />}
                </Card>
            )}
            {Object.entries(autresRegles).map(([key, rule]) => {
                if (rule && typeof rule === 'object' && rule.titre && rule.description) {
                    return (
                        <Card key={key} title={rule.titre} icon="⚙️">
                            <Paragraph content={rule.description} className="text-sm text-slate-600 dark:text-slate-400 mb-1" />
                        </Card>
                    );
                }
                return null;
            })}
        </div>
    );
  };


  return renderSectionShell(
    "systeme_memoire",
    data,
    "Système Principal / Mécaniques Clés",
    "🧠",
    bibleTitle,
    "Données de système principal non disponibles.",
    <>
      {data?.introductionSysteme ? <Paragraph content={data.introductionSysteme} /> : <Paragraph content="Cette section détaille le système principal de votre univers et ses règles." /> }
      
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <SubTitle text="Types d'Éléments du Système" className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-200 mt-0 mb-0"/>
            {data?.typesElementsSysteme && data.typesElementsSysteme.length > 0 && (
                 <SortControls
                    data={data.typesElementsSysteme}
                    sortKey="nom"
                    onSort={setSortedTypesElements}
                />
            )}
        </div>
        {sortedTypesElements.length > 0
            ? renderTypesElements(sortedTypesElements)
            : createDefaultMessage("Aucun type d'élément du système défini.")
        }
      </div>

      {data?.reglesCruciales && (
        <div className="mt-8">
            <SubTitle text="Règles Cruciales du Système" />
            {renderReglesCruciales(data.reglesCruciales)}
        </div>
      )}
    </>
  );
};

export default SystemeMemoireTab;

import React, { useState, useLayoutEffect, useRef } from 'react';
import Button from './Button';

interface TourStep {
  selector: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  scrollInline?: ScrollLogicalPosition;
  scrollBlock?: ScrollLogicalPosition;
}

interface TourGuideProps {
  steps: readonly TourStep[];
  stepIndex: number;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

// This interface allows using CSS custom properties (variables) in React's style object.
interface CSSPropertiesWithVars extends React.CSSProperties {
  '--arrow-left'?: string;
  '--arrow-top'?: string;
}

const TourGuide: React.FC<TourGuideProps> = ({ steps, stepIndex, isActive, onNext, onPrev, onSkip }) => {
  const [popupStyle, setPopupStyle] = useState<CSSPropertiesWithVars>({ visibility: 'hidden' });
  const [arrowClass, setArrowClass] = useState('');
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const currentStep = steps[stepIndex];

  useLayoutEffect(() => {
    if (!isActive || !currentStep) {
      setPopupStyle({ visibility: 'hidden' });
      setTargetRect(null);
      setArrowClass('');
      return;
    }

    if (currentStep.selector === 'body') {
      setPopupStyle({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        visibility: 'visible',
      });
      setTargetRect(null);
      setArrowClass('');
      return;
    }

    try {
      const element = document.querySelector(currentStep.selector);
      if (element && popupRef.current) {
        // Use 'auto' for an instantaneous scroll to avoid race conditions with 'smooth' animations.
        // This ensures the element is in its final position before we calculate the popup's location.
        element.scrollIntoView({ 
          behavior: 'auto', 
          block: currentStep.scrollBlock || 'nearest', 
          inline: currentStep.scrollInline || 'nearest' 
        });

        // A very short timeout allows the browser to re-paint before we get the element's new position.
        const timer = setTimeout(() => {
          const newTargetRect = element.getBoundingClientRect();
          const popupRect = popupRef.current!.getBoundingClientRect();
          const PADDING = 15;
          const { innerHeight: vh, innerWidth: vw } = window;

          setTargetRect(newTargetRect);

          const positionPreference: TourStep['position'][] = [
            currentStep.position, 'top', 'bottom', 'left', 'right'
          ];
          const uniquePositions = [...new Set(positionPreference)];

          let finalStyle: CSSPropertiesWithVars = {};
          let finalArrowClass = '';
          let positionFound = false;

          for (const pos of uniquePositions) {
            if (positionFound) break;
            
            let hLeft = newTargetRect.left + newTargetRect.width / 2 - popupRect.width / 2;
            if (hLeft < PADDING) hLeft = PADDING;
            if (hLeft + popupRect.width > vw - PADDING) hLeft = vw - PADDING - popupRect.width;
            
            let vTop = newTargetRect.top + newTargetRect.height / 2 - popupRect.height / 2;
            if (vTop < PADDING) vTop = PADDING;
            if (vTop + popupRect.height > vh - PADDING) vTop = vh - PADDING - popupRect.height;
            
            const targetCenterX = newTargetRect.left + newTargetRect.width / 2;
            const targetCenterY = newTargetRect.top + newTargetRect.height / 2;

            switch (pos) {
              case 'top':
                if (newTargetRect.top - popupRect.height - PADDING > 0) {
                  finalStyle = {
                    top: `${newTargetRect.top - PADDING}px`,
                    left: `${hLeft}px`,
                    transform: 'translateY(-100%)',
                    '--arrow-left': `${targetCenterX - hLeft}px`,
                  };
                  finalArrowClass = 'before:absolute before:left-[var(--arrow-left)] before:-translate-x-1/2 before:-bottom-2 before:border-x-8 before:border-x-transparent before:border-t-8 before:border-t-slate-800';
                  positionFound = true;
                }
                break;
              case 'bottom':
                if (newTargetRect.bottom + popupRect.height + PADDING < vh) {
                  finalStyle = {
                    top: `${newTargetRect.bottom + PADDING}px`,
                    left: `${hLeft}px`,
                    '--arrow-left': `${targetCenterX - hLeft}px`,
                  };
                  finalArrowClass = 'before:absolute before:left-[var(--arrow-left)] before:-translate-x-1/2 before:-top-2 before:border-x-8 before:border-x-transparent before:border-b-8 before:border-b-slate-800';
                  positionFound = true;
                }
                break;
              case 'left':
                if (newTargetRect.left - popupRect.width - PADDING > 0) {
                  finalStyle = {
                    top: `${vTop}px`,
                    left: `${newTargetRect.left - PADDING}px`,
                    transform: 'translateX(-100%)',
                    '--arrow-top': `${targetCenterY - vTop}px`,
                  };
                  finalArrowClass = 'before:absolute before:top-[var(--arrow-top)] before:-translate-y-1/2 before:-right-2 before:border-y-8 before:border-y-transparent before:border-l-8 before:border-l-slate-800';
                  positionFound = true;
                }
                break;
              case 'right':
                if (newTargetRect.right + popupRect.width + PADDING < vw) {
                  finalStyle = {
                    top: `${vTop}px`,
                    left: `${newTargetRect.right + PADDING}px`,
                    '--arrow-top': `${targetCenterY - vTop}px`,
                  };
                  finalArrowClass = 'before:absolute before:top-[var(--arrow-top)] before:-translate-y-1/2 before:-left-2 before:border-y-8 before:border-y-transparent before:border-r-8 before:border-r-slate-800';
                  positionFound = true;
                }
                break;
            }
          }

          if (!positionFound) {
            finalStyle = { top: '15px', left: '15px', transform: 'none' };
            finalArrowClass = '';
          }

          setPopupStyle({ ...finalStyle, visibility: 'visible' });
          setArrowClass(finalArrowClass);
        }, 50); // Reduced timeout significantly, as scrolling is now instant.

        return () => clearTimeout(timer);
      } else {
        console.warn(`TourGuide: Element with selector "${currentStep.selector}" not found. Skipping step.`);
        onNext();
      }
    } catch (e) {
      console.error("TourGuide error:", e);
      onSkip();
    }
  }, [isActive, stepIndex, currentStep, onNext, onSkip]);

  if (!isActive || !currentStep) {
    return null;
  }

  const highlightStyle: React.CSSProperties = targetRect ? {
    position: 'fixed',
    top: `${targetRect.top - 5}px`,
    left: `${targetRect.left - 5}px`,
    width: `${targetRect.width + 10}px`,
    height: `${targetRect.height + 10}px`,
    boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.7)',
    borderRadius: '8px',
    zIndex: 50000,
    pointerEvents: 'none',
    transition: 'all 0.35s ease-in-out',
  } : {
    position: 'fixed',
    inset: 0,
    zIndex: 50000,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    pointerEvents: 'none',
  };

  return (
    <>
      <div style={highlightStyle}></div>
      <div
        ref={popupRef}
        style={popupStyle}
        className={`fixed bg-slate-800 text-white p-5 rounded-lg shadow-2xl w-80 max-w-[90vw] z-[50001] transition-opacity duration-300 ease-in-out animate-tour-popup-show ${arrowClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
      >
        <h3 id="tour-title" className="text-lg font-bold text-teal-300 mb-2">{currentStep.title}</h3>
        <p className="text-sm text-slate-300 mb-4">{currentStep.content}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-slate-400">{stepIndex + 1} / {steps.length}</span>
          <div className="flex gap-2">
            <Button onClick={onSkip} size="sm" variant="light" className="!bg-transparent !text-slate-400 hover:!text-white !shadow-none !border-0">Passer</Button>
            {stepIndex > 0 && <Button onClick={onPrev} size="sm" variant="secondary">Précédent</Button>}
            {stepIndex < steps.length - 1 ? (
              <Button onClick={onNext} size="sm" variant="primary">Suivant</Button>
            ) : (
              <Button onClick={onSkip} size="sm" variant="success">Terminer</Button>
            )}
          </div>
        </div>
        <button onClick={onSkip} className="absolute top-2 right-2 text-slate-400 hover:text-white p-1" aria-label="Fermer le guide">&times;</button>
      </div>
      <style>{`
        @keyframes tour-popup-show {
          from { opacity: 0; transform: scale(0.95) ${popupStyle.transform || ''}; }
          to { opacity: 1; transform: scale(1) ${popupStyle.transform || ''}; }
        }
        .animate-tour-popup-show { animation: tour-popup-show 0.3s ease-out forwards; }
      `}</style>
    </>
  );
};

export default TourGuide;

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClass?: string; // e.g., 'max-w-2xl', 'max-w-xl'
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidthClass = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thin-dark relative transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow`}
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        {title && (
          <h3 className="text-xl sm:text-2xl font-semibold text-teal-700 dark:text-teal-400 mb-4 sm:mb-6">{title}</h3>
        )}
        <div className="prose prose-slate dark:prose-invert max-w-none">
            {children}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full sm:w-auto bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
        >
          Fermer
        </button>
      </div>
      <style>
        {`
        @keyframes modalShow {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modalShow { animation: modalShow 0.3s forwards; }
        `}
      </style>
    </div>
  );
};

export default Modal;
import React from 'react';

interface CardProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  additionalClasses?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, icon, children, additionalClasses = '', onClick }) => {
  const baseClasses = "bg-white dark:bg-slate-800 shadow-lg rounded-xl p-4 sm:p-6"; // Changed padding
  const clickableClasses = onClick ? "cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 border-2 border-transparent transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-xl" : "";

  return (
    <div className={`${baseClasses} ${clickableClasses} ${additionalClasses}`} onClick={onClick}>
      <div className="flex items-center mb-3">
        {icon && <span className="material-icons-outlined text-3xl mr-3 text-teal-500 dark:text-teal-400 leading-none">{icon}</span>}
        <h4 className="text-lg sm:text-xl font-semibold text-teal-700 dark:text-teal-300">{title}</h4>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
        {children}
      </div>
    </div>
  );
};

export default Card;
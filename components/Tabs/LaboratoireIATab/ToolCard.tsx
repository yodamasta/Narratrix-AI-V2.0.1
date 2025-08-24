

import React from 'react';

export interface ToolCardProps {
  id: string;
  title: string;
  icon: string; // Material icon name or SVG path for custom icons
  description: string;
  gradientClasses: string; // Tailwind CSS gradient classes e.g., "from-red-500 to-orange-400"
  isNew?: boolean;
  onClick: (id: string) => void;
  status?: 'active' | 'construction' | 'default'; // For "En Construction" etc.
}

const ToolCard: React.FC<ToolCardProps> = ({
  id,
  title,
  icon,
  description,
  gradientClasses,
  isNew,
  onClick,
  status = 'default',
}) => {
  const badgeText = status === 'construction' ? 'En Construction' : (isNew ? 'Nouveau!' : null);
  const badgeColor = status === 'construction' ? 'bg-orange-400 text-orange-900' : 'bg-yellow-400 text-yellow-900';
  
  const isClickable = status !== 'construction';
  const cardClasses = `
    relative p-5 rounded-xl shadow-lg text-white 
    min-h-[180px] flex flex-col justify-between 
    transition-all duration-300 ease-in-out 
    bg-gradient-to-br ${gradientClasses}
    ${isClickable ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1' : 'opacity-60 filter grayscale blur-[0.5px] cursor-not-allowed'}
  `;

  const handleClick = () => {
    if (isClickable) {
      onClick(id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      onClick(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cardClasses}
      role="button"
      tabIndex={isClickable ? 0 : -1}
      onKeyPress={handleKeyPress}
      aria-label={`Ouvrir l'outil ${title}${!isClickable ? ' (en construction)' : ''}`}
      aria-disabled={!isClickable}
    >
      <div>
        <div className="flex items-start mb-3">
          {icon.startsWith('/') || icon.startsWith('data:') ? (
            <img src={icon} alt={`${title} icon`} className="w-8 h-8 mr-3" />
          ) : (
            <span className="material-icons-outlined text-3xl mr-3 leading-none opacity-90">{icon}</span>
          )}
          <h3 className="text-xl font-bold leading-tight">{title}</h3>
        </div>
        <p className="text-sm opacity-90 leading-snug">{description}</p>
      </div>

      {badgeText && (
        <span className={`absolute bottom-3 left-3 text-xs font-semibold px-2 py-1 rounded-md ${badgeColor}`}>
          {badgeText}
        </span>
      )}
    </div>
  );
};

export default ToolCard;

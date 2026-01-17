import React from 'react';
import { 
  Circle, 
  Dribbble, 
  Trophy,
  Bike,
  Waves,
  Dumbbell,
  Target,
  Sparkles,
  Activity
} from 'lucide-react';

const sportIcons = {
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  volleyball: '🏐',
  running: '🏃',
  cycling: '🚴',
  swimming: '🏊',
  padel: '🎾',
  yoga: '🧘',
  fitness: '💪',
  other: '🏅',
};

const sportColors = {
  football: 'bg-green-500',
  basketball: 'bg-orange-500',
  tennis: 'bg-yellow-500',
  volleyball: 'bg-blue-500',
  running: 'bg-red-500',
  cycling: 'bg-purple-500',
  swimming: 'bg-cyan-500',
  padel: 'bg-lime-500',
  yoga: 'bg-pink-500',
  fitness: 'bg-indigo-500',
  other: 'bg-gray-500',
};

export default function SportIcon({ sport, size = 'md', showBg = true, className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-base',
    md: 'w-10 h-10 text-lg',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-4xl',
  };

  const icon = sportIcons[sport] || sportIcons.other;
  const bgColor = sportColors[sport] || sportColors.other;

  if (!showBg) {
    return <span className={className}>{icon}</span>;
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${bgColor} 
        rounded-xl flex items-center justify-center
        shadow-lg
        ${className}
      `}
    >
      <span>{icon}</span>
    </div>
  );
}

export { sportIcons, sportColors };
import React from 'react';
import { cn } from '@/lib/utils';

export default function LevelBadge({ level, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  // Different colors for different level ranges
  const getLevelStyle = (level) => {
    if (level >= 50) return 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-amber-200';
    if (level >= 30) return 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-purple-200';
    if (level >= 20) return 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-200';
    if (level >= 10) return 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-200';
    return 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-gray-200';
  };

  return (
    <div 
      className={cn(
        sizeClasses[size],
        getLevelStyle(level),
        'rounded-full flex items-center justify-center font-bold shadow-lg',
        className
      )}
    >
      {level}
    </div>
  );
}
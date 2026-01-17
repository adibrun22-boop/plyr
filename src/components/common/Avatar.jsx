import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Avatar({ 
  src, 
  name = '', 
  size = 'md', 
  className = '',
  showBorder = false,
  borderColor = 'border-white'
}) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-3xl',
  };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  // Generate consistent color based on name
  const colors = [
    'bg-gradient-to-br from-rose-400 to-rose-600',
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-green-400 to-green-600',
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-orange-400 to-orange-600',
    'bg-gradient-to-br from-cyan-400 to-cyan-600',
    'bg-gradient-to-br from-pink-400 to-pink-600',
    'bg-gradient-to-br from-indigo-400 to-indigo-600',
  ];
  
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={cn(
        sizeClasses[size],
        'rounded-full overflow-hidden flex items-center justify-center',
        'shadow-md',
        showBorder && `border-2 ${borderColor}`,
        !src && bgColor,
        className
      )}
    >
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <span className="font-semibold text-white">{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2 text-white/80" />
      )}
    </div>
  );
}
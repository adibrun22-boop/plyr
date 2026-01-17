import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function StatsCard({ player }) {
  const { t, isRTL } = useLanguage();

  const stats = [
    { 
      label: t('profile.gamesPlayed'), 
      value: player.games_played || 0,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      label: t('profile.gamesOrganized'), 
      value: player.games_organized || 0,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      label: t('profile.totalPoints'), 
      value: player.total_points || 0,
      color: 'from-emerald-500 to-emerald-600'
    },
    { 
      label: t('profile.friends'), 
      value: player.friends?.length || 0,
      color: 'from-pink-500 to-pink-600'
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => (
        <div 
          key={i}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className={cn(
            "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
            stat.color
          )}>
            {stat.value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
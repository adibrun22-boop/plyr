import React from 'react';
import { Trophy, Lock } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '@/lib/utils';

const achievementIcons = {
  first_game: '🎮',
  team_player: '🤝',
  social_butterfly: '🦋',
  organizer: '📋',
  veteran: '⭐',
  super_organizer: '🏆',
  all_star: '🌟',
};

export default function AchievementBadge({ achievement, unlocked = false, size = 'md' }) {
  const { t, language, isRTL } = useLanguage();

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const name = language === 'he' ? achievement.name_he : achievement.name_en;
  const description = language === 'he' ? achievement.description_he : achievement.description_en;
  const icon = achievementIcons[achievement.achievement_id] || '🏅';

  return (
    <div className={cn(
      "flex flex-col items-center p-3 rounded-xl transition-all",
      unlocked 
        ? "bg-gradient-to-br from-amber-50 to-yellow-100" 
        : "bg-gray-100 opacity-60"
    )}>
      <div className={cn(
        sizeClasses[size],
        "rounded-full flex items-center justify-center text-2xl mb-2",
        unlocked
          ? "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-200"
          : "bg-gray-200"
      )}>
        {unlocked ? icon : <Lock className="w-6 h-6 text-gray-400" />}
      </div>
      <span className={cn(
        "text-xs font-medium text-center",
        unlocked ? "text-amber-800" : "text-gray-500"
      )}>
        {name}
      </span>
      {achievement.points && unlocked && (
        <span className="text-xs text-amber-600 mt-1">
          +{achievement.points} {t('achievements.points')}
        </span>
      )}
    </div>
  );
}
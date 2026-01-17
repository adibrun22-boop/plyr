import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import StarRating from '../common/StarRating';
import { cn } from '@/lib/utils';

export default function RatingsCard({ player }) {
  const { t, isRTL } = useLanguage();

  const ratings = [
    { label: t('profile.avgEffort'), value: player.avg_effort_rating || 0 },
    { label: t('profile.avgTeamwork'), value: player.avg_teamwork_rating || 0 },
    { label: t('profile.avgSportsmanship'), value: player.avg_sportsmanship_rating || 0 },
    { label: t('profile.avgOverall'), value: player.avg_overall_rating || 0 },
  ];

  if (player.total_ratings_received === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500">{t('profile.noAchievements')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">{t('profile.ratings')}</h3>
      <div className="space-y-3">
        {ratings.map((rating, i) => (
          <div 
            key={i}
            className={cn(
              "flex items-center justify-between",
              isRTL && "flex-row-reverse"
            )}
          >
            <span className="text-sm text-gray-600">{rating.label}</span>
            <StarRating value={rating.value} readonly size="sm" showValue />
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <span className="text-xs text-gray-400">
          {player.total_ratings_received} {t('profile.ratings').toLowerCase()}
        </span>
      </div>
    </div>
  );
}
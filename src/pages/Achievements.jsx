import React from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/i18n/LanguageContext';
import AchievementBadge from '@/components/profile/AchievementBadge';
import { cn } from '@/lib/utils';

// Complete achievements data
const ALL_ACHIEVEMENTS = [
  { 
    achievement_id: 'first_game', 
    name_en: 'First Game', 
    name_he: 'משחק ראשון', 
    description_en: 'Play your first game',
    description_he: 'שחק את המשחק הראשון שלך',
    points: 10,
    category: 'participation',
    requirement_type: 'games_played',
    requirement_value: 1
  },
  { 
    achievement_id: 'team_player', 
    name_en: 'Team Player', 
    name_he: 'שחקן קבוצתי', 
    description_en: 'Play 10 games',
    description_he: 'שחק 10 משחקים',
    points: 50,
    category: 'participation',
    requirement_type: 'games_played',
    requirement_value: 10
  },
  { 
    achievement_id: 'veteran', 
    name_en: 'Veteran', 
    name_he: 'ותיק', 
    description_en: 'Play 50 games',
    description_he: 'שחק 50 משחקים',
    points: 200,
    category: 'participation',
    requirement_type: 'games_played',
    requirement_value: 50
  },
  { 
    achievement_id: 'social_butterfly', 
    name_en: 'Social Butterfly', 
    name_he: 'חברותי', 
    description_en: 'Make 5 friends',
    description_he: 'הוסף 5 חברים',
    points: 30,
    category: 'social',
    requirement_type: 'friends_count',
    requirement_value: 5
  },
  { 
    achievement_id: 'popular', 
    name_en: 'Popular', 
    name_he: 'פופולרי', 
    description_en: 'Make 20 friends',
    description_he: 'הוסף 20 חברים',
    points: 100,
    category: 'social',
    requirement_type: 'friends_count',
    requirement_value: 20
  },
  { 
    achievement_id: 'organizer', 
    name_en: 'Event Organizer', 
    name_he: 'מארגן אירועים', 
    description_en: 'Organize your first event',
    description_he: 'ארגן את האירוע הראשון שלך',
    points: 25,
    category: 'participation',
    requirement_type: 'games_organized',
    requirement_value: 1
  },
  { 
    achievement_id: 'super_organizer', 
    name_en: 'Super Organizer', 
    name_he: 'סופר מארגן', 
    description_en: 'Organize 10 events',
    description_he: 'ארגן 10 אירועים',
    points: 150,
    category: 'participation',
    requirement_type: 'games_organized',
    requirement_value: 10
  },
  { 
    achievement_id: 'all_star', 
    name_en: 'All Star', 
    name_he: 'כוכב על', 
    description_en: 'Maintain 4.5+ overall rating',
    description_he: 'שמור על דירוג כללי מעל 4.5',
    points: 100,
    category: 'performance',
    requirement_type: 'overall_rating',
    requirement_value: 4.5
  },
  { 
    achievement_id: 'fair_play', 
    name_en: 'Fair Play Player', 
    name_he: 'שחקן הוגן', 
    description_en: 'Maintain excellent sportsmanship',
    description_he: 'שמור על ספורטיביות מעולה',
    points: 150,
    category: 'performance',
    requirement_type: 'sportsmanship_rating',
    requirement_value: 4.7
  },
  { 
    achievement_id: 'best_player', 
    name_en: 'Best Player', 
    name_he: 'שחקן הטוב ביותר', 
    description_en: 'Top performer of the season',
    description_he: 'הביצועים הטובים ביותר בעונה',
    points: 300,
    category: 'special',
    requirement_type: 'seasonal_rank',
    requirement_value: 1,
    is_seasonal: true
  },
  { 
    achievement_id: 'most_active', 
    name_en: 'Most Active Player', 
    name_he: 'השחקן הפעיל ביותר', 
    description_en: 'Most games played this season',
    description_he: 'הכי הרבה משחקים בעונה',
    points: 200,
    category: 'special',
    requirement_type: 'seasonal_games',
    requirement_value: 1,
    is_seasonal: true
  },
];

export default function Achievements() {
  const { t, isRTL, language } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: player, isLoading } = useQuery({
    queryKey: ['currentPlayer', user?.id],
    queryFn: async () => {
      const players = await base44.entities.Player.filter({ user_id: user.id });
      return players[0];
    },
    enabled: !!user?.id,
  });

  const getProgress = (achievement) => {
    if (!player) return 0;
    
    let current = 0;
    switch (achievement.requirement_type) {
      case 'games_played':
        current = player.games_played || 0;
        break;
      case 'games_organized':
        current = player.games_organized || 0;
        break;
      case 'friends_count':
        current = player.friends?.length || 0;
        break;
      case 'overall_rating':
        current = player.avg_overall_rating || 0;
        break;
    }
    
    return Math.min(100, (current / achievement.requirement_value) * 100);
  };

  const isUnlocked = (achievement) => {
    return getProgress(achievement) >= 100;
  };

  // Group by category
  const categories = {
    participation: ALL_ACHIEVEMENTS.filter(a => a.category === 'participation'),
    social: ALL_ACHIEVEMENTS.filter(a => a.category === 'social'),
    performance: ALL_ACHIEVEMENTS.filter(a => a.category === 'performance'),
  };

  const categoryNames = {
    participation: language === 'he' ? 'השתתפות' : 'Participation',
    social: language === 'he' ? 'חברתי' : 'Social',
    performance: language === 'he' ? 'ביצועים' : 'Performance',
  };

  const totalPoints = ALL_ACHIEVEMENTS
    .filter(a => isUnlocked(a))
    .reduce((sum, a) => sum + a.points, 0);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Skeleton className="h-32 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-14 md:top-16 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => window.history.back()}
            className={cn("flex items-center gap-1 text-gray-600", isRTL && "flex-row-reverse")}
          >
            <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
            <span>{t('common.back')}</span>
          </button>
          <h1 className="flex-1 text-center font-semibold">{t('achievements.title')}</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl p-6 text-white mb-6">
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/80 text-sm">{t('gamification.pointsEarned')}</p>
              <p className="text-3xl font-bold">{totalPoints}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>{ALL_ACHIEVEMENTS.filter(a => isUnlocked(a)).length} / {ALL_ACHIEVEMENTS.length} {language === 'he' ? 'הישגים' : 'achievements'}</span>
            </div>
            <Progress 
              value={(ALL_ACHIEVEMENTS.filter(a => isUnlocked(a)).length / ALL_ACHIEVEMENTS.length) * 100}
              className="h-2 bg-white/30"
            />
          </div>
        </div>

        {/* Achievements by Category */}
        {Object.entries(categories).map(([category, achievements]) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{categoryNames[category]}</h2>
            <div className="space-y-3">
              {achievements.map(achievement => {
                const unlocked = isUnlocked(achievement);
                const progress = getProgress(achievement);
                const name = language === 'he' ? achievement.name_he : achievement.name_en;
                const description = language === 'he' ? achievement.description_he : achievement.description_en;

                return (
                  <div 
                    key={achievement.achievement_id}
                    className={cn(
                      "bg-white rounded-xl p-4 border transition-all",
                      unlocked ? "border-amber-200" : "border-gray-100"
                    )}
                  >
                    <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                      <AchievementBadge 
                        achievement={achievement} 
                        unlocked={unlocked}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                          <h3 className={cn("font-medium", unlocked && "text-amber-700")}>{name}</h3>
                          <span className={cn(
                            "text-sm font-medium",
                            unlocked ? "text-amber-600" : "text-gray-400"
                          )}>
                            +{achievement.points} {t('achievements.points')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                        {!unlocked && (
                          <div className="mt-2">
                            <Progress value={progress} className="h-1.5" />
                            <p className="text-xs text-gray-400 mt-1">
                              {Math.round(progress)}% {t('achievements.progress')}
                            </p>
                          </div>
                        )}
                        {unlocked && (
                          <span className="text-xs text-emerald-600 font-medium mt-1 block">
                            ✓ {t('achievements.unlocked')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
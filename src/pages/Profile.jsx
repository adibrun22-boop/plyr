import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Settings, 
  Edit, 
  Trophy,
  Calendar,
  Users,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/components/i18n/LanguageContext';
import Avatar from '@/components/common/Avatar';
import LevelBadge from '@/components/common/LevelBadge';
import SportIcon from '@/components/common/SportIcon';
import StatsCard from '@/components/profile/StatsCard';
import RatingsCard from '@/components/profile/RatingsCard';
import AchievementBadge from '@/components/profile/AchievementBadge';
import { cn } from '@/lib/utils';

// Sample achievements data
const SAMPLE_ACHIEVEMENTS = [
  { achievement_id: 'first_game', name_en: 'First Game', name_he: 'משחק ראשון', points: 10 },
  { achievement_id: 'team_player', name_en: 'Team Player', name_he: 'שחקן קבוצתי', points: 50 },
  { achievement_id: 'social_butterfly', name_en: 'Social Butterfly', name_he: 'חברותי', points: 30 },
  { achievement_id: 'organizer', name_en: 'Event Organizer', name_he: 'מארגן אירועים', points: 25 },
];

export default function Profile() {
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

  const { data: recentGames = [] } = useQuery({
    queryKey: ['playerRecentGames', player?.id],
    queryFn: async () => {
      const events = await base44.entities.Event.filter({ status: 'completed' }, '-date', 50);
      return events.filter(e => e.participants?.includes(player.id)).slice(0, 5);
    },
    enabled: !!player?.id,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Skeleton className="h-48 w-full rounded-2xl mb-6" />
        <Skeleton className="h-24 w-full rounded-2xl mb-4" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">{language === 'he' ? 'לא נמצא פרופיל' : 'Profile not found'}</p>
        <Link to={createPageUrl('Onboarding')}>
          <Button>{language === 'he' ? 'צור פרופיל' : 'Create Profile'}</Button>
        </Link>
      </div>
    );
  }

  const unlockedAchievements = player.achievements || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 mb-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        {/* Settings Button */}
        <Link 
          to={createPageUrl('Settings')}
          className={cn("absolute top-4", isRTL ? "left-4" : "right-4")}
        >
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>

        <div className={cn("relative flex items-center gap-4", isRTL && "flex-row-reverse")}>
          <div className="relative">
            <Avatar 
              src={player.avatar_url} 
              name={player.username} 
              size="2xl"
              showBorder
              borderColor="border-white/30"
            />
            <div className="absolute -bottom-2 -right-2">
              <LevelBadge level={player.level || 1} size="lg" />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">{player.username}</h1>
            {player.bio && (
              <p className="text-white/80 text-sm mb-3">{player.bio}</p>
            )}
            
            {/* Sports */}
            <div className={cn("flex flex-wrap gap-2", isRTL && "flex-row-reverse")}>
              {player.sports?.map(sport => (
                <Badge key={sport} className="bg-white/20 text-white border-0">
                  {t(`sports.${sport}`)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <Link to={createPageUrl('EditProfile')}>
          <Button 
            variant="outline" 
            className="mt-4 w-full bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2"
          >
            <Edit className="w-4 h-4" />
            {t('profile.editProfile')}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('profile.stats')}</h2>
        <StatsCard player={player} />
      </div>

      {/* Ratings */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('profile.ratings')}</h2>
        <RatingsCard player={player} />
      </div>

      {/* Friends */}
      <div className="mb-6">
        <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
          <h2 className="text-lg font-semibold text-gray-900">{t('profile.friends')}</h2>
          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            <Link to={createPageUrl('FriendRequests')}>
              <Button size="sm" variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                {language === 'he' ? 'בקשות' : 'Requests'}
              </Button>
            </Link>
            <Link to={createPageUrl('FindFriends')}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <UserPlus className="w-4 h-4" />
                {t('profile.findFriends')}
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-gray-900">{player.friends?.length || 0}</p>
            <p className="text-sm text-gray-500">{t('profile.friends')}</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
          <h2 className="text-lg font-semibold text-gray-900">{t('profile.achievements')}</h2>
          <Link 
            to={createPageUrl('Achievements')}
            className="text-emerald-600 text-sm font-medium flex items-center gap-1"
          >
            {t('common.viewAll')}
            <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
          </Link>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {SAMPLE_ACHIEVEMENTS.map(achievement => (
            <AchievementBadge
              key={achievement.achievement_id}
              achievement={achievement}
              unlocked={unlockedAchievements.includes(achievement.achievement_id) || achievement.achievement_id === 'first_game'}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Recent Games */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('profile.history')}</h2>
        
        {recentGames.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">{t('events.noEvents')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentGames.map(game => (
              <Link 
                key={game.id}
                to={createPageUrl('EventDetails') + `?id=${game.id}`}
                className="block bg-white rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-colors"
              >
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <SportIcon sport={game.sport_type} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{game.title}</p>
                    <p className="text-sm text-gray-500">{game.location_name}</p>
                  </div>
                  {game.score_team_a !== undefined && (
                    <span className="text-lg font-bold text-gray-700">
                      {game.score_team_a} - {game.score_team_b}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
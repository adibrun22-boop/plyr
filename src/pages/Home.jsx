import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  ChevronRight, 
  Trophy,
  Calendar,
  Users,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/components/i18n/LanguageContext';
import EventCard from '@/components/events/EventCard';
import Avatar from '@/components/common/Avatar';
import LevelBadge from '@/components/common/LevelBadge';
import { cn } from '@/lib/utils';

export default function Home() {
  const { t, isRTL } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: player, isLoading: playerLoading } = useQuery({
    queryKey: ['currentPlayer', user?.id],
    queryFn: async () => {
      const players = await base44.entities.Player.filter({ user_id: user.id });
      return players[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: upcomingEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: () => base44.entities.Event.filter({ status: 'upcoming' }, '-date', 6),
  });

  const { data: feedPosts = [], isLoading: feedLoading } = useQuery({
    queryKey: ['recentFeed'],
    queryFn: () => base44.entities.FeedPost.list('-created_date', 3),
  });

  // Redirect to onboarding if no player profile
  useEffect(() => {
    if (user && !playerLoading && !player) {
      window.location.href = createPageUrl('Onboarding');
    }
  }, [user, player, playerLoading]);

  const quickStats = player ? [
    { 
      icon: Calendar, 
      label: t('profile.gamesPlayed'), 
      value: player.games_played || 0,
      color: 'bg-blue-500'
    },
    { 
      icon: Trophy, 
      label: t('profile.totalPoints'), 
      value: player.total_points || 0,
      color: 'bg-amber-500'
    },
    { 
      icon: Users, 
      label: t('profile.friends'), 
      value: player.friends?.length || 0,
      color: 'bg-pink-500'
    },
  ] : [];

  if (playerLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Skeleton className="h-48 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Welcome Hero */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 md:p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className={cn("relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6", isRTL && "md:flex-row-reverse")}>
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <div className="relative">
              <Avatar 
                src={player?.avatar_url} 
                name={player?.username || user?.full_name} 
                size="xl"
                showBorder
                borderColor="border-white/30"
              />
              <div className="absolute -bottom-1 -right-1">
                <LevelBadge level={player?.level || 1} size="md" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {t('nav.home')}, {player?.username || user?.full_name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-white/80">
                {t('gamification.currentLevel')}: {player?.level || 1}
              </p>
            </div>
          </div>

          <Link to={createPageUrl('CreateEvent')}>
            <Button 
              size="lg" 
              className="bg-white text-emerald-600 hover:bg-white/90 shadow-xl gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('events.createEvent')}
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="relative grid grid-cols-3 gap-4 mt-6">
          {quickStats.map((stat, i) => (
            <div 
              key={i}
              className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center"
            >
              <stat.icon className="w-6 h-6 text-white mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <section className="mb-8">
        <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
          <h2 className="text-xl font-bold text-gray-900">{t('events.upcomingEvents')}</h2>
          <Link 
            to={createPageUrl('Events')}
            className="text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700"
          >
            {t('common.viewAll')}
            <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
          </Link>
        </div>

        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t('events.noEvents')}</p>
            <Link to={createPageUrl('CreateEvent')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                {t('events.createEvent')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity Preview */}
      <section>
        <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
          <h2 className="text-xl font-bold text-gray-900">{t('feed.socialFeed')}</h2>
          <Link 
            to={createPageUrl('Feed')}
            className="text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700"
          >
            {t('common.viewAll')}
            <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
          </Link>
        </div>

        {feedLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : feedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('feed.noPosts')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedPosts.slice(0, 2).map(post => (
              <div 
                key={post.id}
                className="bg-white rounded-xl p-4 border border-gray-100"
              >
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <Avatar src={post.player_avatar} name={post.player_name} size="sm" />
                  <div className="flex-1">
                    <span className="font-medium">{post.player_name}</span>
                    <span className="text-gray-500 text-sm"> {t(`feed.${post.type === 'game_completed' ? 'completedGame' : 'earnedAchievement'}`)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
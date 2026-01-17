import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft,
  Bell,
  Calendar,
  Star,
  Trophy,
  Users,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/components/i18n/LanguageContext';
import EmptyState from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

const notificationIcons = {
  event_reminder: { icon: Calendar, color: 'bg-blue-100 text-blue-600' },
  game_invite: { icon: Users, color: 'bg-purple-100 text-purple-600' },
  rating_pending: { icon: Star, color: 'bg-amber-100 text-amber-600' },
  achievement: { icon: Trophy, color: 'bg-emerald-100 text-emerald-600' },
  friend_request: { icon: Users, color: 'bg-pink-100 text-pink-600' },
  social: { icon: Bell, color: 'bg-gray-100 text-gray-600' },
};

export default function Notifications() {
  const { t, isRTL, language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: player } = useQuery({
    queryKey: ['currentPlayer', user?.id],
    queryFn: async () => {
      const players = await base44.entities.Player.filter({ user_id: user.id });
      return players[0];
    },
    enabled: !!user?.id,
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', player?.id],
    queryFn: () => base44.entities.Notification.filter({ player_id: player.id }, '-created_date', 50),
    enabled: !!player?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => 
      base44.entities.Notification.update(notificationId, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => 
        base44.entities.Notification.update(n.id, { is_read: true })
      ));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-14 md:top-16 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className={cn("flex items-center gap-1 text-gray-600", isRTL && "flex-row-reverse")}
          >
            <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
            <span>{t('common.back')}</span>
          </button>
          <h1 className="font-semibold">{t('notifications.title')}</h1>
          {unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              className="text-emerald-600"
            >
              <Check className="w-4 h-4 mr-1" />
              {t('notifications.markAllRead')}
            </Button>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t('notifications.noNotifications')}
          />
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => {
              const config = notificationIcons[notification.type] || notificationIcons.social;
              const Icon = config.icon;
              const title = language === 'he' ? notification.title_he : notification.title_en;
              const message = language === 'he' ? notification.message_he : notification.message_en;

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full text-left bg-white rounded-xl p-4 border transition-colors",
                    notification.is_read 
                      ? "border-gray-100" 
                      : "border-emerald-200 bg-emerald-50/50"
                  )}
                >
                  <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse text-right")}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <h3 className={cn(
                          "font-medium text-gray-900",
                          !notification.is_read && "font-semibold"
                        )}>
                          {title || t(`notifications.${notification.type}`)}
                        </h3>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      {message && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message}</p>
                      )}
                      <span className="text-xs text-gray-400 mt-2 block">
                        {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
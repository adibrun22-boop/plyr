import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, UserPlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Avatar from '@/components/common/Avatar';
import LevelBadge from '@/components/common/LevelBadge';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function FriendRequests() {
  const { t, isRTL, language } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('received');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: currentPlayer } = useQuery({
    queryKey: ['currentPlayer', user?.id],
    queryFn: async () => {
      const players = await base44.entities.Player.filter({ user_id: user.id });
      return players[0];
    },
    enabled: !!user?.id,
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => base44.entities.Player.list(),
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (requesterId) => {
      await base44.entities.Player.update(currentPlayer.id, {
        friends: [...(currentPlayer.friends || []), requesterId],
        friend_requests_received: (currentPlayer.friend_requests_received || []).filter(id => id !== requesterId)
      });

      const requester = allPlayers.find(p => p.id === requesterId);
      await base44.entities.Player.update(requesterId, {
        friends: [...(requester.friends || []), currentPlayer.id],
        friend_requests_sent: (requester.friend_requests_sent || []).filter(id => id !== currentPlayer.id)
      });

      await base44.entities.Notification.create({
        player_id: requesterId,
        type: 'friend_request',
        title_en: `${currentPlayer.username} accepted your friend request`,
        title_he: `${currentPlayer.username} אישר את בקשת החברות שלך`,
        message_en: 'You are now friends!',
        message_he: 'אתם חברים עכשיו!',
        link: '/profile',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPlayer'] });
      queryClient.invalidateQueries({ queryKey: ['allPlayers'] });
    },
  });

  const declineRequestMutation = useMutation({
    mutationFn: async (requesterId) => {
      await base44.entities.Player.update(currentPlayer.id, {
        friend_requests_received: (currentPlayer.friend_requests_received || []).filter(id => id !== requesterId)
      });

      const requester = allPlayers.find(p => p.id === requesterId);
      await base44.entities.Player.update(requesterId, {
        friend_requests_sent: (requester.friend_requests_sent || []).filter(id => id !== currentPlayer.id)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPlayer'] });
      queryClient.invalidateQueries({ queryKey: ['allPlayers'] });
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (targetPlayerId) => {
      await base44.entities.Player.update(currentPlayer.id, {
        friend_requests_sent: (currentPlayer.friend_requests_sent || []).filter(id => id !== targetPlayerId)
      });
      
      const targetPlayer = allPlayers.find(p => p.id === targetPlayerId);
      await base44.entities.Player.update(targetPlayerId, {
        friend_requests_received: (targetPlayer.friend_requests_received || []).filter(id => id !== currentPlayer.id)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPlayer'] });
      queryClient.invalidateQueries({ queryKey: ['allPlayers'] });
    },
  });

  const receivedRequests = allPlayers.filter(p => 
    currentPlayer?.friend_requests_received?.includes(p.id)
  );

  const sentRequests = allPlayers.filter(p => 
    currentPlayer?.friend_requests_sent?.includes(p.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className={cn("flex items-center gap-3 mb-4", isRTL && "flex-row-reverse")}>
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{t('profile.friendRequests')}</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('received')}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg font-medium transition-colors",
                activeTab === 'received'
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {t('profile.received')} ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg font-medium transition-colors",
                activeTab === 'sent'
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {t('profile.sent')} ({sentRequests.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'received' && (
          <>
            {receivedRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('profile.noFriendRequests')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receivedRequests.map(player => (
                  <div
                    key={player.id}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                  >
                    <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
                      <div className="relative">
                        <Avatar src={player.avatar_url} name={player.username} size="lg" />
                        <div className="absolute -bottom-1 -right-1">
                          <LevelBadge level={player.level || 1} size="sm" />
                        </div>
                      </div>

                      <div className={cn("flex-1", isRTL && "text-right")}>
                        <p className="font-semibold text-gray-900">{player.username}</p>
                        {player.bio && (
                          <p className="text-sm text-gray-500 line-clamp-1">{player.bio}</p>
                        )}
                        <div className={cn("flex items-center gap-1 mt-1", isRTL && "flex-row-reverse")}>
                          {player.sports?.slice(0, 3).map(sport => (
                            <Badge key={sport} variant="outline" className="text-xs">
                              {t(`sports.${sport}`)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                      <Button
                        onClick={() => acceptRequestMutation.mutate(player.id)}
                        disabled={acceptRequestMutation.isPending}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {t('profile.acceptRequest')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => declineRequestMutation.mutate(player.id)}
                        disabled={declineRequestMutation.isPending}
                        className="flex-1 gap-2"
                      >
                        <X className="w-4 h-4" />
                        {t('profile.declineRequest')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'sent' && (
          <>
            {sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('profile.noFriendRequests')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentRequests.map(player => (
                  <div
                    key={player.id}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                  >
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className="relative">
                        <Avatar src={player.avatar_url} name={player.username} size="lg" />
                        <div className="absolute -bottom-1 -right-1">
                          <LevelBadge level={player.level || 1} size="sm" />
                        </div>
                      </div>

                      <div className={cn("flex-1", isRTL && "text-right")}>
                        <p className="font-semibold text-gray-900">{player.username}</p>
                        {player.bio && (
                          <p className="text-sm text-gray-500 line-clamp-1">{player.bio}</p>
                        )}
                        <div className={cn("flex items-center gap-1 mt-1", isRTL && "flex-row-reverse")}>
                          {player.sports?.slice(0, 3).map(sport => (
                            <Badge key={sport} variant="outline" className="text-xs">
                              {t(`sports.${sport}`)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelRequestMutation.mutate(player.id)}
                        disabled={cancelRequestMutation.isPending}
                        className="gap-2 shrink-0"
                      >
                        <X className="w-4 h-4" />
                        {t('profile.cancelRequest')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
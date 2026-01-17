import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, UserCheck, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Avatar from '@/components/common/Avatar';
import LevelBadge from '@/components/common/LevelBadge';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function FindFriends() {
  const { t, isRTL, language } = useLanguage();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

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

  const sendRequestMutation = useMutation({
    mutationFn: async (targetPlayerId) => {
      await base44.entities.Player.update(currentPlayer.id, {
        friend_requests_sent: [...(currentPlayer.friend_requests_sent || []), targetPlayerId]
      });
      
      const targetPlayer = allPlayers.find(p => p.id === targetPlayerId);
      await base44.entities.Player.update(targetPlayerId, {
        friend_requests_received: [...(targetPlayer.friend_requests_received || []), currentPlayer.id]
      });

      await base44.entities.Notification.create({
        player_id: targetPlayerId,
        type: 'friend_request',
        title_en: `${currentPlayer.username} sent you a friend request`,
        title_he: `${currentPlayer.username} שלח לך בקשת חברות`,
        message_en: 'Check your friend requests',
        message_he: 'בדוק את בקשות החברות שלך',
        link: '?page=FriendRequests',
        related_id: currentPlayer.id,
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

  const filteredPlayers = allPlayers.filter(player => {
    if (!currentPlayer || player.id === currentPlayer.id) return false;
    if (currentPlayer.friends?.includes(player.id)) return false;
    if (!searchQuery) return true;
    
    return player.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getPlayerStatus = (player) => {
    if (currentPlayer?.friend_requests_sent?.includes(player.id)) return 'sent';
    if (currentPlayer?.friend_requests_received?.includes(player.id)) return 'received';
    return 'none';
  };

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
            <h1 className="text-xl font-bold text-gray-900">{t('profile.findFriends')}</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('profile.searchPlayers')}
              className={cn("h-11", isRTL ? "pr-10" : "pl-10")}
            />
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('profile.noPlayersFound')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPlayers.map(player => {
              const status = getPlayerStatus(player);
              
              return (
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

                    {status === 'none' && (
                      <Button
                        size="sm"
                        onClick={() => sendRequestMutation.mutate(player.id)}
                        disabled={sendRequestMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 gap-2 shrink-0"
                      >
                        <UserPlus className="w-4 h-4" />
                        {language === 'he' ? 'הוסף' : 'Add'}
                      </Button>
                    )}

                    {status === 'sent' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelRequestMutation.mutate(player.id)}
                        disabled={cancelRequestMutation.isPending}
                        className="gap-2 shrink-0"
                      >
                        <X className="w-4 h-4" />
                        {language === 'he' ? 'בטל' : 'Cancel'}
                      </Button>
                    )}

                    {status === 'received' && (
                      <Badge className="bg-blue-100 text-blue-700 shrink-0">
                        {language === 'he' ? 'קיבלת בקשה' : 'Pending'}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
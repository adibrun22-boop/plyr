import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Avatar from '../common/Avatar';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function InviteFriendsDialog({ event, currentPlayer, open, onOpenChange }) {
  const { t, isRTL, language } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedFriends, setSelectedFriends] = useState([]);

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => base44.entities.Player.list(),
    enabled: open,
  });

  const friends = allPlayers.filter(p => 
    currentPlayer?.friends?.includes(p.id) && 
    !event.participants?.includes(p.id) &&
    !event.invited_players?.includes(p.id)
  );

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const updatedInvited = [...(event.invited_players || []), ...selectedFriends];
      await base44.entities.Event.update(event.id, { invited_players: updatedInvited });

      // Send notifications
      for (const friendId of selectedFriends) {
        const friend = allPlayers.find(p => p.id === friendId);
        await base44.entities.Notification.create({
          player_id: friendId,
          type: 'game_invite',
          title_en: `${currentPlayer.username} invited you to a game`,
          title_he: `${currentPlayer.username} הזמין אותך למשחק`,
          message_en: event.title,
          message_he: event.title,
          link: `?page=EventDetails&id=${event.id}`,
          related_id: event.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
      setSelectedFriends([]);
      onOpenChange(false);
    },
  });

  const toggleFriend = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={cn(isRTL && "text-right")}>
            {language === 'he' ? 'הזמן חברים' : 'Invite Friends'}
          </DialogTitle>
          <DialogDescription className={cn(isRTL && "text-right")}>
            {language === 'he' 
              ? 'בחר חברים להזמין לאירוע הפרטי'
              : 'Select friends to invite to this private event'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto space-y-2 py-4">
          {friends.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {language === 'he' 
                ? 'אין חברים זמינים להזמנה'
                : 'No friends available to invite'}
            </p>
          ) : (
            friends.map(friend => {
              const isSelected = selectedFriends.includes(friend.id);
              return (
                <button
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  className={cn(
                    "w-full p-3 rounded-xl transition-all flex items-center gap-3",
                    isSelected 
                      ? "bg-emerald-100 ring-2 ring-emerald-500" 
                      : "bg-gray-50 hover:bg-gray-100",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <Avatar src={friend.avatar_url} name={friend.username} size="md" />
                  <div className={cn("flex-1 text-left", isRTL && "text-right")}>
                    <p className="font-medium">{friend.username}</p>
                    <p className="text-sm text-gray-500">
                      {t('profile.level')} {friend.level || 1}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className={cn("flex gap-3 pt-4 border-t", isRTL && "flex-row-reverse")}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => inviteMutation.mutate()}
            disabled={selectedFriends.length === 0 || inviteMutation.isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {language === 'he' 
              ? `הזמן (${selectedFriends.length})`
              : `Invite (${selectedFriends.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
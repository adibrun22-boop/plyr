import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  Users,
  Trophy,
  Calendar,
  Settings,
  UserPlus,
  Crown,
  UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from '@/components/i18n/LanguageContext';
import Avatar from '@/components/common/Avatar';
import SportIcon from '@/components/common/SportIcon';
import EventCard from '@/components/events/EventCard';
import { cn } from '@/lib/utils';

export default function TeamDetails() {
  const { t, isRTL, language } = useLanguage();
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('id');

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

  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const teams = await base44.entities.Team.filter({ id: teamId });
      return teams[0];
    },
    enabled: !!teamId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['teamMembers', team?.members],
    queryFn: async () => {
      if (!team?.members?.length) return [];
      const allPlayers = await base44.entities.Player.list();
      return allPlayers.filter(p => team.members.includes(p.id));
    },
    enabled: !!team?.members?.length,
  });

  const { data: teamGames = [] } = useQuery({
    queryKey: ['teamGames', teamId],
    queryFn: () => base44.entities.Event.filter({ team_id: teamId }, '-date', 20),
    enabled: !!teamId,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', player?.id],
    queryFn: async () => {
      if (!player?.friends?.length) return [];
      const allPlayers = await base44.entities.Player.list();
      return allPlayers.filter(p => player.friends.includes(p.id));
    },
    enabled: !!player?.friends?.length,
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId) => {
      const updatedMembers = team.members.filter(id => id !== memberId);
      await base44.entities.Team.update(teamId, { members: updatedMembers });
      
      const memberData = await base44.entities.Player.filter({ id: memberId });
      if (memberData[0]) {
        const updatedTeamIds = (memberData[0].team_ids || []).filter(id => id !== teamId);
        await base44.entities.Player.update(memberId, { team_ids: updatedTeamIds });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (friendId) => {
      const updatedMembers = [...(team.members || []), friendId];
      await base44.entities.Team.update(teamId, { members: updatedMembers });
      
      const friendData = await base44.entities.Player.filter({ id: friendId });
      if (friendData[0]) {
        await base44.entities.Player.update(friendId, {
          team_ids: [...(friendData[0].team_ids || []), teamId]
        });
      }

      await base44.entities.Notification.create({
        player_id: friendId,
        type: 'social',
        title_en: 'Team Invitation',
        title_he: 'הזמנה לקבוצה',
        message_en: `You've been added to ${team.name}`,
        message_he: `נוספת לקבוצה ${team.name}`,
        link: createPageUrl('TeamDetails') + `?id=${teamId}`,
        related_id: teamId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      setShowInviteDialog(false);
    },
  });

  const isCaptain = team?.captain_id === player?.id;
  const availableFriends = friends.filter(f => !team?.members?.includes(f.id));

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => window.history.back()}
            className={cn("flex items-center gap-1 text-gray-600", isRTL && "flex-row-reverse")}
          >
            <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
            <span>{t('common.back')}</span>
          </button>
        </div>
      </div>

      {/* Team Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.name} className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{team.name}</h1>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Badge variant="outline">{t(`sports.${team.sport_type}`)}</Badge>
                <span className="text-sm text-gray-500">
                  {members.length} {t('teams.members')}
                </span>
              </div>
            </div>

            {isCaptain && (
              <Button variant="outline" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            )}
          </div>

          {team.description && (
            <p className="text-gray-600 mt-4">{team.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{team.wins || 0}</p>
              <p className="text-sm text-gray-500">{t('teams.wins')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{team.losses || 0}</p>
              <p className="text-sm text-gray-500">{t('teams.losses')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{team.draws || 0}</p>
              <p className="text-sm text-gray-500">{t('teams.draws')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{team.total_points || 0}</p>
              <p className="text-sm text-gray-500">{t('teams.points')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="members">{t('teams.members')}</TabsTrigger>
            <TabsTrigger value="games">{t('teams.games')}</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6 space-y-4">
            {isCaptain && (
              <Button
                onClick={() => setShowInviteDialog(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                <UserPlus className="w-5 h-5" />
                {language === 'he' ? 'הזמן חברים' : 'Invite Friends'}
              </Button>
            )}

            <div className="space-y-3">
              {members.map(member => (
                <div
                  key={member.id}
                  className={cn("flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100", isRTL && "flex-row-reverse")}
                >
                  <Avatar src={member.avatar_url} name={member.username} size="md" />
                  <div className="flex-1">
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <span className="font-medium">{member.username}</span>
                      {member.id === team.captain_id && (
                        <Crown className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {t('profile.level')} {member.level || 1}
                    </span>
                  </div>
                  {isCaptain && member.id !== team.captain_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMemberMutation.mutate(member.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <UserMinus className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="games" className="mt-6">
            {teamGames.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'he' ? 'עדיין אין משחקים' : 'No games yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamGames.map(game => (
                  <EventCard key={game.id} event={game} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Friends Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'he' ? 'הזמן חברים' : 'Invite Friends'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableFriends.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                {language === 'he' ? 'כל החברים שלך כבר בקבוצה' : 'All your friends are already in the team'}
              </p>
            ) : (
              availableFriends.map(friend => (
                <div
                  key={friend.id}
                  className={cn("flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50", isRTL && "flex-row-reverse")}
                >
                  <Avatar src={friend.avatar_url} name={friend.username} size="sm" />
                  <span className="flex-1 font-medium">{friend.username}</span>
                  <Button
                    size="sm"
                    onClick={() => inviteMemberMutation.mutate(friend.id)}
                    disabled={inviteMemberMutation.isPending}
                  >
                    {language === 'he' ? 'הזמן' : 'Invite'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
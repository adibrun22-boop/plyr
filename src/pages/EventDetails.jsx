import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users,
  Share2,
  MoreHorizontal,
  Check,
  X,
  Play,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from '@/components/i18n/LanguageContext';
import SportIcon from '@/components/common/SportIcon';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function EventDetails() {
  const { t, isRTL, language } = useLanguage();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

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

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => base44.entities.Event.filter({ id: eventId }),
    select: (data) => data[0],
    enabled: !!eventId,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['eventParticipants', event?.participants],
    queryFn: async () => {
      if (!event?.participants?.length) return [];
      const allPlayers = await base44.entities.Player.list();
      return allPlayers.filter(p => event.participants.includes(p.id));
    },
    enabled: !!event?.participants?.length,
  });

  const isOrganizer = currentPlayer?.id === event?.organizer_id;
  const isParticipant = event?.participants?.includes(currentPlayer?.id);
  const spotsLeft = event ? event.max_players - (event.participants?.length || 0) : 0;
  const isFull = spotsLeft <= 0;

  const joinMutation = useMutation({
    mutationFn: async () => {
      const updatedParticipants = [...(event.participants || []), currentPlayer.id];
      return base44.entities.Event.update(event.id, { participants: updatedParticipants });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const updatedParticipants = event.participants.filter(id => id !== currentPlayer.id);
      return base44.entities.Event.update(event.id, { participants: updatedParticipants });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Event.update(event.id, { status: 'cancelled' });
    },
    onSuccess: () => {
      setShowCancelDialog(false);
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });

  const startGameMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Event.update(event.id, { status: 'active' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
  });

  const completeGameMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Event.update(event.id, { status: 'completed' });
    },
    onSuccess: () => {
      window.location.href = createPageUrl('PostGame') + `?eventId=${event.id}`;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Skeleton className="h-64 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">{t('events.noEvents')}</p>
      </div>
    );
  }

  const skillLevelColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
    all: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="relative">
        <div className={cn(
          "h-64 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500",
          event.cover_image && "bg-cover bg-center"
        )} style={event.cover_image ? { backgroundImage: `url(${event.cover_image})` } : {}}>
          {event.cover_image && <div className="absolute inset-0 bg-black/30" />}
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className={cn(
            "absolute top-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center",
            isRTL ? "right-4" : "left-4"
          )}
        >
          <ChevronLeft className={cn("w-5 h-5 text-white", isRTL && "rotate-180")} />
        </button>

        {/* Actions */}
        <div className={cn("absolute top-4 flex gap-2", isRTL ? "left-4" : "right-4")}>
          <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
            <Share2 className="w-5 h-5" />
          </Button>
          {isOrganizer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-red-600">
                  {t('events.cancelEvent')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Sport Icon */}
        <div className={cn("absolute -bottom-8", isRTL ? "left-6" : "right-6")}>
          <SportIcon sport={event.sport_type} size="xl" className="ring-4 ring-white shadow-xl" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Status Badge */}
        {event.status === 'cancelled' && (
          <Badge className="bg-red-100 text-red-700 mb-3">{t('events.eventCancelled')}</Badge>
        )}
        {event.status === 'active' && (
          <Badge className="bg-blue-100 text-blue-700 mb-3">{t('eventStatus.active')}</Badge>
        )}
        {event.status === 'completed' && (
          <Badge className="bg-gray-100 text-gray-700 mb-3">{t('eventStatus.completed')}</Badge>
        )}

        {/* Title & Badges */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h1>
        
        <div className={cn("flex items-center gap-2 mb-6", isRTL && "flex-row-reverse")}>
          <Badge className={skillLevelColors[event.skill_level]}>
            {t(`skillLevels.${event.skill_level}`)}
          </Badge>
          {!event.is_public && (
            <Badge variant="outline">{t('events.privateEvent')}</Badge>
          )}
        </div>

        {/* Event Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4 mb-6">
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-gray-500">{event.start_time} - {event.end_time}</p>
            </div>
          </div>

          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{event.location_name}</p>
              {event.location_address && (
                <p className="text-sm text-gray-500">{event.location_address}</p>
              )}
            </div>
          </div>

          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">
                {event.participants?.length || 0} / {event.max_players} {t('events.players')}
              </p>
              <p className={cn("text-sm", isFull ? "text-red-500" : "text-emerald-600")}>
                {isFull ? t('events.spotsFull') : `${spotsLeft} ${t('events.spotsLeft')}`}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-semibold mb-2">{t('events.description')}</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>
        )}

        {/* Participants */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold mb-4">{t('events.participants')} ({participants.length})</h3>
          <div className="space-y-3">
            {participants.map(player => (
              <div 
                key={player.id}
                className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}
              >
                <Avatar src={player.avatar_url} name={player.username} size="md" />
                <div className="flex-1">
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <span className="font-medium">{player.username}</span>
                    {player.id === event.organizer_id && (
                      <Crown className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {t('profile.level')} {player.level || 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      {event.status !== 'cancelled' && event.status !== 'completed' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
          <div className="max-w-2xl mx-auto">
            {isOrganizer && event.status === 'upcoming' && (
              <Button
                onClick={() => startGameMutation.mutate()}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Play className="w-5 h-5" />
                {language === 'he' ? 'התחל משחק' : 'Start Game'}
              </Button>
            )}
            {isOrganizer && event.status === 'active' && (
              <Button
                onClick={() => completeGameMutation.mutate()}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                <Check className="w-5 h-5" />
                {t('events.completeGame')}
              </Button>
            )}
            {!isOrganizer && !isParticipant && event.status === 'upcoming' && (
              <Button
                onClick={() => joinMutation.mutate()}
                disabled={isFull || joinMutation.isPending}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
              >
                {t('events.joinEvent')}
              </Button>
            )}
            {!isOrganizer && isParticipant && event.status === 'upcoming' && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                  className="flex-1 h-12"
                >
                  {t('events.leaveEvent')}
                </Button>
                <div className="flex-1 h-12 bg-emerald-100 rounded-lg flex items-center justify-center gap-2 text-emerald-700 font-medium">
                  <Check className="w-5 h-5" />
                  {t('events.alreadyJoined')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('events.cancelEvent')}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'he' 
                ? 'האם אתה בטוח שברצונך לבטל את האירוע? פעולה זו אינה ניתנת לביטול.'
                : 'Are you sure you want to cancel this event? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
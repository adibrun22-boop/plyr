import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Camera,
  Trophy,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/i18n/LanguageContext';
import Avatar from '@/components/common/Avatar';
import SportIcon from '@/components/common/SportIcon';
import StarRating from '@/components/common/StarRating';
import { cn } from '@/lib/utils';

const FEELINGS = ['great', 'good', 'okay', 'tired', 'exhausted'];
const FEELING_EMOJIS = { great: '🔥', good: '😊', okay: '😐', tired: '😴', exhausted: '🥵' };

export default function PostGame() {
  const { t, isRTL, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [attended, setAttended] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [ratings, setRatings] = useState({});
  const [selfReport, setSelfReport] = useState({
    perceived_effort: 'medium',
    duration_minutes: 60,
    feeling: 'good'
  });
  const [score, setScore] = useState({ team_a: 0, team_b: 0 });

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('eventId');

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

  const { data: event } = useQuery({
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
      return allPlayers.filter(p => event.participants.includes(p.id) && p.id !== currentPlayer?.id);
    },
    enabled: !!event?.participants?.length && !!currentPlayer,
  });

  useEffect(() => {
    if (participants.length > 0 && selectedPlayers.length === 0) {
      setSelectedPlayers(participants.map(p => p.id));
    }
  }, [participants]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Submit ratings
      const ratingPromises = Object.entries(ratings).map(([playerId, playerRatings]) => 
        base44.entities.Rating.create({
          event_id: eventId,
          rater_id: currentPlayer.id,
          rated_player_id: playerId,
          effort: playerRatings.effort,
          teamwork: playerRatings.teamwork,
          sportsmanship: playerRatings.sportsmanship,
          overall: playerRatings.overall,
          rater_reliability_weight: 1
        })
      );

      // Submit self report
      await base44.entities.SelfReport.create({
        event_id: eventId,
        player_id: currentPlayer.id,
        perceived_effort: selfReport.perceived_effort,
        duration_minutes: selfReport.duration_minutes,
        feeling: selfReport.feeling,
        is_self_reported: true
      });

      // Update event with confirmed attendance and score
      const confirmedAttendance = [...(event.confirmed_attendance || []), currentPlayer.id];
      await base44.entities.Event.update(eventId, { 
        confirmed_attendance: confirmedAttendance,
        score_team_a: score.team_a,
        score_team_b: score.team_b
      });

      // Create feed post
      await base44.entities.FeedPost.create({
        type: 'game_completed',
        event_id: eventId,
        player_id: currentPlayer.id,
        player_name: currentPlayer.username,
        player_avatar: currentPlayer.avatar_url,
        content_en: `Played ${event.sport_type} at ${event.location_name}`,
        content_he: `שיחק ${t(`sports.${event.sport_type}`)} ב${event.location_name}`,
        sport_type: event.sport_type,
        participants: event.participants,
        score: `${score.team_a} - ${score.team_b}`,
        visibility: 'public',
        likes: [],
        comments_count: 0
      });

      // Update player stats
      await base44.entities.Player.update(currentPlayer.id, {
        games_played: (currentPlayer.games_played || 0) + 1,
        total_points: (currentPlayer.total_points || 0) + 10
      });

      await Promise.all(ratingPromises);
    },
    onSuccess: () => {
      setStep(6); // Success screen
    }
  });

  const togglePlayerSelection = (playerId) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const setPlayerRating = (playerId, category, value) => {
    setRatings(prev => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || { effort: 3, teamwork: 3, sportsmanship: 3, overall: 3 }),
        [category]: value
      }
    }));
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return t('postGame.confirmAttendance');
      case 2: return t('postGame.enterScore');
      case 3: return t('postGame.ratePlayers');
      case 4: return t('postGame.selfReport');
      case 5: return language === 'he' ? 'סיכום' : 'Summary';
      case 6: return t('postGame.thankYou');
      default: return '';
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {step < 6 && (
            <button
              onClick={() => step > 1 ? setStep(s => s - 1) : window.history.back()}
              className={cn("text-white flex items-center gap-1", isRTL && "flex-row-reverse")}
            >
              <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
              {t('common.back')}
            </button>
          )}
          {step === 6 && <div />}
          <span className="text-white font-semibold">{getStepTitle()}</span>
          <div className="w-16" />
        </div>
        
        {/* Progress */}
        {step < 6 && (
          <div className="flex gap-1 px-4 pb-4 max-w-lg mx-auto">
            {[1, 2, 3, 4, 5].map(s => (
              <div 
                key={s}
                className={cn(
                  "flex-1 h-1 rounded-full",
                  s <= step ? "bg-white" : "bg-white/30"
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Step 1: Attendance Confirmation */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <div className="text-center mb-8">
              <SportIcon sport={event.sport_type} size="xl" className="mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
              <p className="text-gray-500">{t('postGame.didYouAttend')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setAttended(true); setStep(2); }}
                className="p-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-colors flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <span className="font-semibold text-emerald-700">{t('common.yes')}</span>
              </button>
              <button
                onClick={() => window.location.href = createPageUrl('Home')}
                className="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <X className="w-8 h-8 text-white" />
                </div>
                <span className="font-semibold text-gray-500">{t('common.no')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Score Entry */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{t('postGame.enterScore')}</h2>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <Label className="text-gray-500 mb-2 block">{t('postGame.teamA')}</Label>
                <Input
                  type="number"
                  min="0"
                  value={score.team_a}
                  onChange={(e) => setScore(prev => ({ ...prev, team_a: parseInt(e.target.value) || 0 }))}
                  className="w-20 h-16 text-center text-3xl font-bold"
                />
              </div>
              <span className="text-3xl text-gray-300 mt-6">-</span>
              <div className="text-center">
                <Label className="text-gray-500 mb-2 block">{t('postGame.teamB')}</Label>
                <Input
                  type="number"
                  min="0"
                  value={score.team_b}
                  onChange={(e) => setScore(prev => ({ ...prev, team_b: parseInt(e.target.value) || 0 }))}
                  className="w-20 h-16 text-center text-3xl font-bold"
                />
              </div>
            </div>

            <Button
              onClick={() => setStep(3)}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
            >
              {t('common.next')}
            </Button>
          </div>
        )}

        {/* Step 3: Player Ratings */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">{t('postGame.rateYourTeammates')}</h2>
            <p className="text-gray-500 text-center mb-6 text-sm">{t('postGame.selectPlayers')}</p>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {participants.map(player => {
                const isSelected = selectedPlayers.includes(player.id);
                const playerRatings = ratings[player.id] || { effort: 3, teamwork: 3, sportsmanship: 3, overall: 3 };
                
                return (
                  <div key={player.id} className={cn(
                    "rounded-xl border-2 transition-all overflow-hidden",
                    isSelected ? "border-emerald-500" : "border-gray-200"
                  )}>
                    <button
                      onClick={() => togglePlayerSelection(player.id)}
                      className={cn("w-full p-4 flex items-center gap-3", isRTL && "flex-row-reverse")}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        isSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
                      )}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <Avatar src={player.avatar_url} name={player.username} size="md" />
                      <span className="font-medium">{player.username}</span>
                    </button>
                    
                    {isSelected && (
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-4">
                        {['effort', 'teamwork', 'sportsmanship', 'overall'].map(category => (
                          <div key={category} className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                            <span className="text-sm text-gray-600">{t(`postGame.${category}`)}</span>
                            <StarRating
                              value={playerRatings[category]}
                              onChange={(val) => setPlayerRating(player.id, category, val)}
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(4)}
                className="flex-1 h-12"
              >
                {t('postGame.skipRatings')}
              </Button>
              <Button
                onClick={() => setStep(4)}
                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Self Report */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">{t('postGame.selfReport')}</h2>
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 text-center mb-6">
              {t('postGame.selfReportNote')}
            </p>

            {/* Perceived Effort */}
            <div className="mb-6">
              <Label>{t('postGame.perceivedEffort')}</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['low', 'medium', 'high'].map(level => (
                  <button
                    key={level}
                    onClick={() => setSelfReport(prev => ({ ...prev, perceived_effort: level }))}
                    className={cn(
                      "py-3 rounded-xl text-sm font-medium transition-all",
                      selfReport.perceived_effort === level
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {t(`postGame.${level}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <Label>{t('postGame.duration')}</Label>
              <Input
                type="number"
                min="0"
                value={selfReport.duration_minutes}
                onChange={(e) => setSelfReport(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                className="mt-2"
              />
            </div>

            {/* Feeling */}
            <div className="mb-6">
              <Label>{t('postGame.howDidYouFeel')}</Label>
              <div className="flex justify-between mt-2">
                {FEELINGS.map(feeling => (
                  <button
                    key={feeling}
                    onClick={() => setSelfReport(prev => ({ ...prev, feeling }))}
                    className={cn(
                      "w-14 h-14 rounded-xl flex flex-col items-center justify-center text-2xl transition-all",
                      selfReport.feeling === feeling
                        ? "bg-emerald-100 ring-2 ring-emerald-500"
                        : "bg-gray-100"
                    )}
                  >
                    {FEELING_EMOJIS[feeling]}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep(5)}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
            >
              {t('common.next')}
            </Button>
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              {language === 'he' ? 'סיכום' : 'Summary'}
            </h2>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="text-sm text-gray-500">{t('postGame.enterScore')}</span>
                <p className="text-2xl font-bold">{score.team_a} - {score.team_b}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="text-sm text-gray-500">{t('postGame.ratePlayers')}</span>
                <p className="font-medium">{Object.keys(ratings).length} {language === 'he' ? 'שחקנים דורגו' : 'players rated'}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <span className="text-sm text-gray-500">{t('postGame.howDidYouFeel')}</span>
                <p className="text-2xl">{FEELING_EMOJIS[selfReport.feeling]} {t(`postGame.feeling.${selfReport.feeling}`)}</p>
              </div>
            </div>

            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              <Check className="w-5 h-5" />
              {t('postGame.submitRatings')}
            </Button>
          </div>
        )}

        {/* Step 6: Success */}
        {step === 6 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('postGame.thankYou')}</h2>
            <p className="text-gray-500 mb-2">{t('postGame.ratingsSubmitted')}</p>
            <p className="text-emerald-600 font-medium mb-8">+10 {t('gamification.pointsEarned')}</p>

            <Button
              onClick={() => window.location.href = createPageUrl('Home')}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
            >
              {t('nav.home')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
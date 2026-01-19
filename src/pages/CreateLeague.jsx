import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, Trophy, Users, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/components/i18n/LanguageContext';
import SportIcon, { sportIcons } from '@/components/common/SportIcon';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

const SPORTS = Object.keys(sportIcons);

export default function CreateLeague() {
  const { t, isRTL, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    sport_type: 'football',
    description: '',
    start_date: '',
    end_date: '',
    selectedTeams: [],
    selectedReferees: []
  });

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

  const { data: allTeams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list(),
  });

  const createLeagueMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.League.create({
        name: formData.name,
        sport_type: formData.sport_type,
        description: formData.description,
        organizer_id: player.id,
        teams: formData.selectedTeams,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: 'upcoming',
        referees: formData.selectedReferees,
        referee_payment_info: {
          rate_per_game: 0,
          currency: 'ILS',
          payment_status: {}
        },
        standings: []
      });
    },
    onSuccess: (league) => {
      window.location.href = createPageUrl('LeagueDetails') + `?id=${league.id}`;
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.selectedTeams.length < 2) {
      alert(language === 'he' ? 'נדרש שם וצוות לפחות 2 קבוצות' : 'Name and at least 2 teams required');
      return;
    }
    createLeagueMutation.mutate();
  };

  const toggleTeam = (teamId) => {
    setFormData(prev => ({
      ...prev,
      selectedTeams: prev.selectedTeams.includes(teamId)
        ? prev.selectedTeams.filter(id => id !== teamId)
        : [...prev.selectedTeams, teamId]
    }));
  };

  const toggleReferee = (playerId) => {
    setFormData(prev => ({
      ...prev,
      selectedReferees: prev.selectedReferees.includes(playerId)
        ? prev.selectedReferees.filter(id => id !== playerId)
        : [...prev.selectedReferees, playerId]
    }));
  };

  const sportTeams = allTeams.filter(t => t.sport_type === formData.sport_type);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-14 md:top-16 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => window.history.back()}
            className={cn("flex items-center gap-1 text-gray-600", isRTL && "flex-row-reverse")}
          >
            <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
            <span>{t('common.back')}</span>
          </button>
          <h1 className="flex-1 text-center font-semibold">
            {language === 'he' ? 'צור ליגה' : 'Create League'}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Icon */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* League Name */}
          <div>
            <Label>{language === 'he' ? 'שם הליגה' : 'League Name'}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={language === 'he' ? 'שם הליגה' : 'League name'}
              className="mt-2"
              required
            />
          </div>

          {/* Sport Selection */}
          <div>
            <Label>{t('events.sport')}</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {SPORTS.map(sport => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sport_type: sport, selectedTeams: [] }))}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all",
                    formData.sport_type === sport
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <SportIcon sport={sport} size="sm" showBg={false} className="text-2xl" />
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>{t('teams.description')}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={language === 'he' ? 'תיאור הליגה...' : 'League description...'}
              className="mt-2 h-20"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{language === 'he' ? 'תאריך התחלה' : 'Start Date'}</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label>{language === 'he' ? 'תאריך סיום' : 'End Date'}</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="mt-2"
                required
              />
            </div>
          </div>

          {/* Select Teams */}
          <div>
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {language === 'he' ? 'בחר קבוצות (לפחות 2)' : 'Select Teams (at least 2)'}
            </Label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {sportTeams.length === 0 ? (
                <p className="text-center text-gray-400 py-4 text-sm">
                  {language === 'he' ? 'אין קבוצות זמינות לספורט זה' : 'No teams available for this sport'}
                </p>
              ) : (
                sportTeams.map(team => (
                  <label
                    key={team.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      formData.selectedTeams.includes(team.id)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <Checkbox
                      checked={formData.selectedTeams.includes(team.id)}
                      onCheckedChange={() => toggleTeam(team.id)}
                    />
                    {team.logo_url ? (
                      <img src={team.logo_url} alt={team.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <span className="font-medium">{team.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Select Referees (Optional) */}
          <div>
            <Label className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              {language === 'he' ? 'בחר שופטים (אופציונלי)' : 'Select Referees (Optional)'}
            </Label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {allPlayers.slice(0, 20).map(p => (
                <label
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all",
                    formData.selectedReferees.includes(p.id)
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <Checkbox
                    checked={formData.selectedReferees.includes(p.id)}
                    onCheckedChange={() => toggleReferee(p.id)}
                  />
                  <Avatar src={p.avatar_url} name={p.username} size="sm" />
                  <span className="text-sm">{p.username}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!formData.name.trim() || formData.selectedTeams.length < 2 || createLeagueMutation.isPending}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
          >
            {language === 'he' ? 'צור ליגה' : 'Create League'}
          </Button>
        </form>
      </div>
    </div>
  );
}
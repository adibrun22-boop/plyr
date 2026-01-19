import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, Upload, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/i18n/LanguageContext';
import SportIcon, { sportIcons } from '@/components/common/SportIcon';
import { cn } from '@/lib/utils';

const SPORTS = Object.keys(sportIcons);

export default function CreateTeam() {
  const { t, isRTL, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    sport_type: 'football',
    description: '',
    logo_url: ''
  });
  const [uploading, setUploading] = useState(false);

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

  const createTeamMutation = useMutation({
    mutationFn: async () => {
      const team = await base44.entities.Team.create({
        name: formData.name,
        sport_type: formData.sport_type,
        description: formData.description,
        logo_url: formData.logo_url,
        captain_id: player.id,
        members: [player.id],
        wins: 0,
        losses: 0,
        draws: 0,
        total_points: 0
      });

      // Update player's team_ids
      await base44.entities.Player.update(player.id, {
        team_ids: [...(player.team_ids || []), team.id]
      });

      return team;
    },
    onSuccess: (team) => {
      window.location.href = createPageUrl('TeamDetails') + `?id=${team.id}`;
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, logo_url: file_url }));
    } catch (error) {
      alert(language === 'he' ? 'שגיאה בהעלאת תמונה' : 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    createTeamMutation.mutate();
  };

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
          <h1 className="flex-1 text-center font-semibold">{t('teams.createTeam')}</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              {formData.logo_url ? (
                <img 
                  src={formData.logo_url} 
                  alt="Team logo" 
                  className="w-24 h-24 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">{t('teams.uploadLogo')}</p>
          </div>

          {/* Team Name */}
          <div>
            <Label>{t('teams.teamName')}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={language === 'he' ? 'שם הקבוצה' : 'Team name'}
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
                  onClick={() => setFormData(prev => ({ ...prev, sport_type: sport }))}
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
              placeholder={language === 'he' ? 'תיאור הקבוצה...' : 'Team description...'}
              className="mt-2 h-24"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!formData.name.trim() || createTeamMutation.isPending}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
          >
            {t('teams.createTeam')}
          </Button>
        </form>
      </div>
    </div>
  );
}
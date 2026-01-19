import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ChevronLeft,
  Check,
  Upload,
  User,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/components/i18n/LanguageContext';
import SportIcon from '@/components/common/SportIcon';
import { cn } from '@/lib/utils';

const SPORTS = ['football', 'basketball', 'tennis', 'volleyball', 'running', 'cycling', 'swimming', 'padel', 'yoga', 'fitness'];
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function EditProfile() {
  const { t, isRTL, language } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar_url: '',
    profile_type: 'player',
    sports: [],
    skill_levels: {}
  });
  const [uploading, setUploading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: player, isLoading } = useQuery({
    queryKey: ['currentPlayer', user?.id],
    queryFn: async () => {
      const players = await base44.entities.Player.filter({ user_id: user.id });
      return players[0];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (player) {
      setFormData({
        username: player.username || '',
        bio: player.bio || '',
        avatar_url: player.avatar_url || '',
        profile_type: player.profile_type || 'player',
        sports: player.sports || [],
        skill_levels: player.skill_levels || {}
      });
    }
  }, [player]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Player.update(player.id, data);
    },
    onSuccess: () => {
      setTimeout(() => {
        window.location.href = createPageUrl('Profile');
      }, 500);
    }
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const toggleSport = (sport) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport],
      skill_levels: prev.sports.includes(sport)
        ? { ...prev.skill_levels, [sport]: undefined }
        : { ...prev.skill_levels, [sport]: 'beginner' }
    }));
  };

  const setSkillLevel = (sport, level) => {
    setFormData(prev => ({
      ...prev,
      skill_levels: { ...prev.skill_levels, [sport]: level }
    }));
  };

  const handleSubmit = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

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
            <span>{t('common.cancel')}</span>
          </button>
          <h1 className="font-semibold">{t('profile.editProfile')}</h1>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={updateMutation.isPending || !formData.username}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="w-4 h-4 mr-1" />
            {t('common.save')}
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <label className="relative cursor-pointer group">
            <div className={cn(
              "w-28 h-28 rounded-full overflow-hidden border-4 border-gray-100",
              "bg-gradient-to-br from-gray-100 to-gray-200",
              "flex items-center justify-center",
              "group-hover:border-emerald-200 transition-all"
            )}>
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-white" />
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Profile Type */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Label className="text-base">
            {language === 'he' ? 'סוג פרופיל' : 'Profile Type'}
          </Label>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {['player', 'coach', 'business'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData(prev => ({...prev, profile_type: type}))}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all text-sm font-medium",
                  formData.profile_type === type
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                {language === 'he' 
                  ? type === 'player' ? 'שחקן' : type === 'coach' ? 'מאמן' : 'עסק'
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div>
            <Label>{t('profile.username')}</Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label>{t('profile.bio')}</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder={language === 'he' ? 'ספר על עצמך...' : 'Tell us about yourself...'}
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Sports */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Label className="text-base">{t('profile.sports')}</Label>
          <p className="text-sm text-gray-500 mb-4">
            {language === 'he' ? 'בחר את ענפי הספורט שלך' : 'Select your sports'}
          </p>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {SPORTS.map(sport => (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={cn(
                  "flex flex-col items-center p-2 rounded-xl transition-all",
                  formData.sports.includes(sport)
                    ? "bg-emerald-100 ring-2 ring-emerald-500"
                    : "bg-gray-50 hover:bg-gray-100"
                )}
              >
                <SportIcon sport={sport} size="sm" showBg={formData.sports.includes(sport)} />
                <span className="text-xs mt-1">{t(`sports.${sport}`)}</span>
              </button>
            ))}
          </div>

          {/* Skill Levels */}
          {formData.sports.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Label>{t('profile.skillLevel')}</Label>
              {formData.sports.map(sport => (
                <div key={sport} className="bg-gray-50 rounded-xl p-3">
                  <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                    <SportIcon sport={sport} size="sm" />
                    <span className="font-medium text-sm">{t(`sports.${sport}`)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SKILL_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setSkillLevel(sport, level)}
                        className={cn(
                          "py-2 rounded-lg text-xs font-medium transition-all",
                          formData.skill_levels[sport] === level
                            ? "bg-emerald-500 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {t(`skillLevels.${level}`)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
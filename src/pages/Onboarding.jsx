import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ChevronRight, 
  ChevronLeft,
  Check,
  Upload,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/components/i18n/LanguageContext';
import SportIcon, { sportIcons } from '@/components/common/SportIcon';
import { cn } from '@/lib/utils';

const SPORTS = ['football', 'basketball', 'tennis', 'volleyball', 'running', 'cycling', 'swimming', 'padel', 'yoga', 'fitness'];
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function Onboarding() {
  const { t, isRTL, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    sports: [],
    skill_levels: {},
    avatar_url: ''
  });
  const [uploading, setUploading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const createPlayerMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Player.create({
        ...data,
        user_id: user.id,
        total_points: 0,
        level: 1,
        games_played: 0,
        games_organized: 0,
        achievements: [],
        friends: [],
        preferred_language: language,
        privacy_settings: {
          show_stats: true,
          show_history: true,
          allow_friend_requests: true
        },
        notification_settings: {
          event_reminders: true,
          game_invites: true,
          ratings: true,
          social: true
        }
      });
    },
    onSuccess: () => {
      window.location.href = createPageUrl('Home');
    }
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, avatar_url: file_url }));
    setUploading(false);
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

  const canProceed = () => {
    if (step === 1) return formData.username.length >= 3;
    if (step === 2) return formData.sports.length > 0;
    return true;
  };

  const handleSubmit = () => {
    createPlayerMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                s === step ? "w-8 bg-white" : s < step ? "bg-white" : "bg-white/40"
              )}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {language === 'he' ? 'ברוך הבא ל-PLYR!' : 'Welcome to PLYR!'}
                </h1>
                <p className="text-gray-500">
                  {language === 'he' ? 'בוא ניצור את הפרופיל שלך' : "Let's create your player profile"}
                </p>
              </div>

              {/* Avatar Upload */}
              <div className="flex justify-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className={cn(
                    "w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100",
                    "bg-gradient-to-br from-gray-100 to-gray-200",
                    "flex items-center justify-center",
                    "group-hover:border-emerald-200 transition-all"
                  )}>
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Upload className="w-4 h-4 text-white" />
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

              <div className="space-y-4">
                <div>
                  <Label>{t('profile.username')}</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder={language === 'he' ? 'שם משתמש' : 'Choose a username'}
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
            </div>
          )}

          {/* Step 2: Sports Selection */}
          {step === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {language === 'he' ? 'באילו ענפי ספורט אתה משחק?' : 'What sports do you play?'}
                </h1>
                <p className="text-gray-500">
                  {language === 'he' ? 'בחר אחד או יותר' : 'Select one or more'}
                </p>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {SPORTS.map(sport => (
                  <button
                    key={sport}
                    onClick={() => toggleSport(sport)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-xl transition-all",
                      formData.sports.includes(sport)
                        ? "bg-emerald-100 ring-2 ring-emerald-500"
                        : "bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    <SportIcon sport={sport} size="md" showBg={formData.sports.includes(sport)} />
                    <span className="text-xs mt-2 font-medium text-gray-700">
                      {t(`sports.${sport}`)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Skill Levels */}
          {step === 3 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {language === 'he' ? 'מה רמת המשחק שלך?' : "What's your skill level?"}
                </h1>
                <p className="text-gray-500">
                  {language === 'he' ? 'בחר רמה לכל ענף ספורט' : 'Set your level for each sport'}
                </p>
              </div>

              <div className="space-y-4">
                {formData.sports.map(sport => (
                  <div key={sport} className="bg-gray-50 rounded-xl p-4">
                    <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
                      <SportIcon sport={sport} size="sm" />
                      <span className="font-medium">{t(`sports.${sport}`)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {SKILL_LEVELS.map(level => (
                        <button
                          key={level}
                          onClick={() => setSkillLevel(sport, level)}
                          className={cn(
                            "py-2 px-3 rounded-lg text-sm font-medium transition-all",
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
            </div>
          )}

          {/* Navigation */}
          <div className={cn(
            "px-8 py-6 bg-gray-50 flex items-center gap-3",
            step === 1 ? "justify-end" : "justify-between"
          )}>
            {step > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep(s => s - 1)}
                className={cn("gap-2", isRTL && "flex-row-reverse")}
              >
                <ChevronLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
                {t('common.back')}
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className={cn("bg-emerald-600 hover:bg-emerald-700 gap-2", isRTL && "flex-row-reverse")}
              >
                {t('common.next')}
                <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createPlayerMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                <Check className="w-4 h-4" />
                {t('common.done')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
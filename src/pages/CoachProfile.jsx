import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus,
  ChevronLeft,
  GraduationCap,
  Calendar,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/i18n/LanguageContext';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

export default function CoachProfile() {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();

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

  const { data: programs = [] } = useQuery({
    queryKey: ['coachPrograms', player?.id],
    queryFn: () => base44.entities.TrainingProgram.filter({ coach_id: player.id }),
    enabled: !!player?.id && player?.profile_type === 'coach',
  });

  const isCoach = player?.profile_type === 'coach';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-14 md:top-16 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => window.history.back()}
            className={cn("flex items-center gap-1 text-gray-600", isRTL && "flex-row-reverse")}
          >
            <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
            <span>{t('common.back')}</span>
          </button>
          <h1 className="flex-1 text-center font-semibold">
            {t('coach.trainingPrograms')}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!isCoach ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {language === 'he' 
                ? 'עבור להגדרות פרופיל כדי להפוך למאמן' 
                : 'Switch to coach profile in settings'}
            </p>
            <Link to={createPageUrl('EditProfile')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                {t('profile.editProfile')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Coach Header */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 mb-6">
              <div className={cn("flex items-center gap-4 mb-6", isRTL && "flex-row-reverse")}>
                <Avatar 
                  src={player.avatar_url}
                  name={player.username}
                  size="xl"
                  showBorder
                  borderColor="border-white/30"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{player.username}</h2>
                  <Badge className="bg-white/20 text-white border-0">
                    <GraduationCap className="w-4 h-4 mr-1" />
                    {language === 'he' ? 'מאמן מוסמך' : 'Certified Coach'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{programs.length}</div>
                  <div className="text-xs text-white/70">{t('coach.trainingPrograms')}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {programs.reduce((sum, p) => sum + (p.enrolled_players?.length || 0), 0)}
                  </div>
                  <div className="text-xs text-white/70">{t('coach.enrolled')}</div>
                </div>
              </div>
            </div>

            {/* Create Program Button */}
            <Button 
              onClick={() => navigate(createPageUrl('CreateTrainingProgram'))}
              className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 mb-6"
            >
              <Plus className="w-5 h-5" />
              {t('coach.createProgram')}
            </Button>

            {/* Programs List */}
            {programs.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {language === 'he' ? 'אין תוכניות אימון עדיין' : 'No training programs yet'}
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl('CreateTrainingProgram'))}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {t('coach.createProgram')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {programs.map(program => (
                  <div 
                    key={program.id}
                    className="bg-white rounded-xl p-4 border border-gray-100"
                  >
                    <div className={cn("flex items-start justify-between mb-3", isRTL && "flex-row-reverse")}>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{program.title}</h3>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <Badge variant="outline">{t(`sports.${program.sport_type}`)}</Badge>
                          <Badge variant="outline">{t(`skillLevels.${program.difficulty_level}`)}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          {program.enrolled_players?.length || 0}
                        </div>
                        <div className="text-xs text-gray-500">{t('coach.enrolled')}</div>
                      </div>
                    </div>
                    
                    {program.description && (
                      <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                    )}
                    
                    <div className={cn("flex items-center gap-4 text-sm text-gray-500", isRTL && "flex-row-reverse")}>
                      <span>
                        {program.duration_weeks} {language === 'he' ? 'שבועות' : 'weeks'}
                      </span>
                      <span>
                        {program.sessions?.length || 0} {t('coach.sessions')}
                      </span>
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
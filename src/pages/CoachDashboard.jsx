import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Calendar, BookOpen, Award, Pencil } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function CoachDashboard() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: player } = useQuery({
    queryKey: ['player', user?.id],
    queryFn: () => base44.entities.Player.filter({ user_id: user.id }),
    enabled: !!user?.id,
    select: (data) => data[0],
  });

  const { data: myPrograms = [] } = useQuery({
    queryKey: ['training-programs', player?.id],
    queryFn: () => base44.entities.TrainingProgram.filter({ coach_id: player.id }),
    enabled: !!player?.id,
  });

  if (player?.profile_type !== 'coach') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">This page is only available for coach profiles.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className={cn("flex items-center justify-between mb-6", isRTL && "flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'לוח בקרה למאמן' : 'Coach Dashboard'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isRTL ? 'נהל את תוכניות האימון והתלמידים שלך' : 'Manage your training programs and students'}
          </p>
        </div>
        <Button
          onClick={() => navigate(createPageUrl('CreateTrainingProgram'))}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isRTL ? 'תוכנית חדשה' : 'New Program'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm text-gray-500">{isRTL ? 'תוכניות' : 'Programs'}</p>
                <p className="text-2xl font-bold">{myPrograms.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm text-gray-500">{isRTL ? 'תלמידים' : 'Students'}</p>
                <p className="text-2xl font-bold">
                  {myPrograms.reduce((acc, p) => acc + (p.enrolled_players?.length || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm text-gray-500">{isRTL ? 'ניסיון' : 'Experience'}</p>
                <p className="text-2xl font-bold">{player?.coach_experience_years || 0} {isRTL ? 'שנים' : 'yrs'}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm text-gray-500">{isRTL ? 'התמחויות' : 'Specializations'}</p>
                <p className="text-2xl font-bold">{player?.coach_specializations?.length || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs List */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'תוכניות האימון שלי' : 'My Training Programs'}</CardTitle>
        </CardHeader>
        <CardContent>
          {myPrograms.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {isRTL ? 'עדיין לא יצרת תוכניות אימון' : "You haven't created any training programs yet"}
              </p>
              <Button
                onClick={() => navigate(createPageUrl('CreateTrainingProgram'))}
                variant="outline"
              >
                {isRTL ? 'צור תוכנית ראשונה' : 'Create Your First Program'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(createPageUrl('TrainingProgramDetails') + '?id=' + program.id)}
                      >
                        <h3 className="font-semibold text-lg">{program.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{program.description}</p>
                        <div className={cn("flex gap-4 mt-3 text-sm", isRTL && "flex-row-reverse")}>
                          <span className="text-gray-600">
                            {t(`sports.${program.sport_type}`)} • {program.duration_weeks} {isRTL ? 'שבועות' : 'weeks'}
                          </span>
                          <span className="text-emerald-600 font-medium">
                            {program.enrolled_players?.length || 0} {isRTL ? 'תלמידים' : 'students'}
                          </span>
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(createPageUrl('EditTrainingProgram') + '?id=' + program.id);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          program.is_public ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        )}>
                          {program.is_public ? (isRTL ? 'ציבורי' : 'Public') : (isRTL ? 'פרטי' : 'Private')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
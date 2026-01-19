import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Clock, Target } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function TrainingPrograms() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, isRTL, language } = useLanguage();

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

  const { data: allPrograms = [] } = useQuery({
    queryKey: ['training-programs-all'],
    queryFn: () => base44.entities.TrainingProgram.filter({ is_public: true }),
  });

  const { data: myEnrolledPrograms = [] } = useQuery({
    queryKey: ['my-enrolled-programs', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const all = await base44.entities.TrainingProgram.list();
      return all.filter(p => p.enrolled_players?.includes(player.id));
    },
    enabled: !!player?.id,
  });

  const enrollMutation = useMutation({
    mutationFn: ({ programId, enrolledPlayers }) =>
      base44.entities.TrainingProgram.update(programId, { enrolled_players: enrolledPlayers }),
    onSuccess: () => {
      queryClient.invalidateQueries(['training-programs-all']);
      queryClient.invalidateQueries(['my-enrolled-programs']);
      toast.success(isRTL ? 'נרשמת לתוכנית בהצלחה' : 'Enrolled successfully');
    },
  });

  const handleEnroll = (program) => {
    const enrolled = program.enrolled_players || [];
    if (enrolled.includes(player.id)) {
      toast.info(isRTL ? 'כבר רשום לתוכנית זו' : 'Already enrolled in this program');
      return;
    }
    enrollMutation.mutate({
      programId: program.id,
      enrolledPlayers: [...enrolled, player.id]
    });
  };

  const ProgramCard = ({ program, showEnroll }) => (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(createPageUrl('TrainingProgramDetails') + '?id=' + program.id)}
    >
      <CardContent className="p-6">
        <div className={cn("flex items-start justify-between mb-4", isRTL && "flex-row-reverse")}>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{program.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{program.description}</p>
            
            <div className={cn("flex flex-wrap gap-3 text-sm", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-1 text-gray-600", isRTL && "flex-row-reverse")}>
                <Target className="w-4 h-4" />
                <span>{program.sport_type}</span>
              </div>
              <div className={cn("flex items-center gap-1 text-gray-600", isRTL && "flex-row-reverse")}>
                <Clock className="w-4 h-4" />
                <span>{program.duration_weeks} {isRTL ? 'שבועות' : 'weeks'}</span>
              </div>
              <div className={cn("flex items-center gap-1 text-gray-600", isRTL && "flex-row-reverse")}>
                <Users className="w-4 h-4" />
                <span>{program.enrolled_players?.length || 0} {isRTL ? 'משתתפים' : 'students'}</span>
              </div>
            </div>
          </div>

          {showEnroll && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEnroll(program);
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isRTL ? 'הרשם' : 'Enroll'}
            </Button>
          )}
        </div>

        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            program.difficulty_level === 'beginner' && "bg-green-100 text-green-700",
            program.difficulty_level === 'intermediate' && "bg-yellow-100 text-yellow-700",
            program.difficulty_level === 'advanced' && "bg-red-100 text-red-700"
          )}>
            {program.difficulty_level === 'beginner' && (isRTL ? 'מתחיל' : 'Beginner')}
            {program.difficulty_level === 'intermediate' && (isRTL ? 'בינוני' : 'Intermediate')}
            {program.difficulty_level === 'advanced' && (isRTL ? 'מתקדם' : 'Advanced')}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isRTL ? 'תוכניות אימון' : 'Training Programs'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isRTL ? 'גלה תוכניות אימון והירשם לשיפור הכישורים שלך' : 'Discover training programs and enroll to improve your skills'}
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">{isRTL ? 'כל התוכניות' : 'All Programs'}</TabsTrigger>
          <TabsTrigger value="enrolled">{isRTL ? 'התוכניות שלי' : 'My Programs'}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {allPrograms.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {isRTL ? 'אין תוכניות אימון זמינות כרגע' : 'No training programs available yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} showEnroll />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-4">
          {myEnrolledPrograms.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {isRTL ? 'לא נרשמת לתוכניות אימון עדיין' : "You haven't enrolled in any programs yet"}
                </p>
                <Button variant="outline" onClick={() => document.querySelector('[value="all"]').click()}>
                  {isRTL ? 'גלה תוכניות' : 'Browse Programs'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myEnrolledPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} showEnroll={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
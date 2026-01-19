import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Clock, Target, Calendar, Award } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Avatar from '@/components/common/Avatar';

export default function TrainingProgramDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('id');
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

  const { data: program } = useQuery({
    queryKey: ['training-program', programId],
    queryFn: () => base44.entities.TrainingProgram.filter({ id: programId }),
    enabled: !!programId,
    select: (data) => data[0],
  });

  const { data: coach } = useQuery({
    queryKey: ['coach', program?.coach_id],
    queryFn: () => base44.entities.Player.filter({ id: program.coach_id }),
    enabled: !!program?.coach_id,
    select: (data) => data[0],
  });

  const { data: students = [] } = useQuery({
    queryKey: ['program-students', program?.id],
    queryFn: async () => {
      if (!program?.enrolled_players?.length) return [];
      const players = await base44.entities.Player.list();
      return players.filter(p => program.enrolled_players.includes(p.id));
    },
    enabled: !!program?.enrolled_players?.length,
  });

  const enrollMutation = useMutation({
    mutationFn: ({ enrolledPlayers }) =>
      base44.entities.TrainingProgram.update(programId, { enrolled_players: enrolledPlayers }),
    onSuccess: () => {
      queryClient.invalidateQueries(['training-program', programId]);
      toast.success(isRTL ? 'נרשמת לתוכנית בהצלחה' : 'Enrolled successfully');
    },
  });

  const handleEnroll = () => {
    const enrolled = program.enrolled_players || [];
    if (enrolled.includes(player.id)) {
      toast.info(isRTL ? 'כבר רשום לתוכנית זו' : 'Already enrolled');
      return;
    }
    enrollMutation.mutate({ enrolledPlayers: [...enrolled, player.id] });
  };

  const isEnrolled = program?.enrolled_players?.includes(player?.id);
  const isCoach = program?.coach_id === player?.id;

  if (!program) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {isRTL ? 'חזור' : 'Back'}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold mb-4">{program.title}</h1>
              <p className="text-gray-600 mb-6">{program.description}</p>

              <div className={cn("flex flex-wrap gap-4 mb-6", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Target className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium">{program.sport_type}</span>
                </div>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">{program.duration_weeks} {isRTL ? 'שבועות' : 'weeks'}</span>
                </div>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm capitalize">{program.difficulty_level}</span>
                </div>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="text-sm">{program.enrolled_players?.length || 0} {isRTL ? 'משתתפים' : 'students'}</span>
                </div>
              </div>

              {!isCoach && !isEnrolled && (
                <Button onClick={handleEnroll} className="bg-emerald-600 hover:bg-emerald-700">
                  {isRTL ? 'הירשם לתוכנית' : 'Enroll in Program'}
                </Button>
              )}

              {isEnrolled && !isCoach && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-emerald-700 font-medium">
                    ✓ {isRTL ? 'אתה רשום לתוכנית זו' : "You're enrolled in this program"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sessions */}
          {program.sessions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'מפגשי אימון' : 'Training Sessions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.sessions.map((session, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className={cn("flex items-start justify-between mb-2", isRTL && "flex-row-reverse")}>
                      <h4 className="font-semibold">{session.title || `${isRTL ? 'מפגש' : 'Session'} ${index + 1}`}</h4>
                      <span className="text-sm text-gray-500">{session.duration_minutes} {isRTL ? 'דקות' : 'min'}</span>
                    </div>
                    <p className="text-sm text-gray-600">{session.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Coach Info */}
          {coach && (
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'המאמן' : 'Coach'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("flex items-center gap-3 mb-4", isRTL && "flex-row-reverse")}>
                  <Avatar src={coach.avatar_url} name={coach.username} size="lg" />
                  <div>
                    <p className="font-semibold">{coach.username}</p>
                    {coach.coach_experience_years && (
                      <p className="text-sm text-gray-500">
                        {coach.coach_experience_years} {isRTL ? 'שנות ניסיון' : 'years experience'}
                      </p>
                    )}
                  </div>
                </div>
                {coach.bio && <p className="text-sm text-gray-600">{coach.bio}</p>}
              </CardContent>
            </Card>
          )}

          {/* Students */}
          {students.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'משתתפים' : 'Enrolled Students'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.slice(0, 5).map((student) => (
                    <div key={student.id} className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <Avatar src={student.avatar_url} name={student.username} size="sm" />
                      <span className="text-sm">{student.username}</span>
                    </div>
                  ))}
                  {students.length > 5 && (
                    <p className="text-sm text-gray-500">
                      +{students.length - 5} {isRTL ? 'נוספים' : 'more'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
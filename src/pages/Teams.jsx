import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus,
  Users,
  Trophy,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function Teams() {
  const { t, isRTL, language } = useLanguage();

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

  const { data: myTeams = [] } = useQuery({
    queryKey: ['myTeams', player?.id],
    queryFn: async () => {
      const allTeams = await base44.entities.Team.list();
      return allTeams.filter(team => 
        team.captain_id === player.id || team.members?.includes(player.id)
      );
    },
    enabled: !!player?.id,
  });

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
          <h1 className="flex-1 text-center font-semibold">{t('teams.myTeams')}</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Create Team Button */}
        <Link to={createPageUrl('CreateTeam')}>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 mb-6">
            <Plus className="w-5 h-5" />
            {t('teams.createTeam')}
          </Button>
        </Link>

        {/* Teams List */}
        {myTeams.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {language === 'he' ? 'אתה עדיין לא בקבוצה' : "You're not in any team yet"}
            </p>
            <Link to={createPageUrl('CreateTeam')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                {t('teams.createTeam')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myTeams.map(team => (
              <Link 
                key={team.id}
                to={createPageUrl('TeamDetails') + `?id=${team.id}`}
                className="block bg-white rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-colors"
              >
                <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{team.name}</h3>
                    <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                      <Badge variant="outline">{t(`sports.${team.sport_type}`)}</Badge>
                      <span className="text-sm text-gray-500">
                        {team.members?.length || 0} {t('teams.members')}
                      </span>
                    </div>
                    
                    {/* Stats */}
                    <div className={cn("flex items-center gap-4 text-sm", isRTL && "flex-row-reverse")}>
                      <span className="text-green-600 font-medium">
                        {team.wins || 0} {t('teams.wins')}
                      </span>
                      <span className="text-red-600 font-medium">
                        {team.losses || 0} {t('teams.losses')}
                      </span>
                      <span className="text-gray-500">
                        {team.draws || 0} {t('teams.draws')}
                      </span>
                    </div>
                  </div>

                  {team.captain_id === player?.id && (
                    <Badge className="bg-amber-100 text-amber-800 border-0">
                      {t('teams.captain')}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Leagues Section */}
        <div className="mt-8">
          <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
            <h2 className="text-lg font-semibold">{t('teams.leagues')}</h2>
            <Link to={createPageUrl('Leagues')}>
              <Button variant="outline" size="sm">
                {language === 'he' ? 'כל הליגות' : 'View All'}
              </Button>
            </Link>
          </div>
          <Link to={createPageUrl('Leagues')}>
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer">
              <Trophy className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-2">
                {language === 'he' ? 'צפה בליגות והצטרף' : 'Browse & Join Leagues'}
              </p>
              <p className="text-sm text-gray-500">
                {language === 'he' ? 'צור ליגות והשתתף בתחרויות' : 'Create leagues and compete'}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
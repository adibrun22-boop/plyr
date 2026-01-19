import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trophy, ChevronLeft, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/i18n/LanguageContext';
import SportIcon from '@/components/common/SportIcon';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Leagues() {
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

  const { data: allLeagues = [] } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => base44.entities.League.list('-created_date', 50),
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

  const myLeagues = allLeagues.filter(league => {
    const myTeamIds = myTeams.map(t => t.id);
    return league.teams?.some(teamId => myTeamIds.includes(teamId));
  });

  const availableLeagues = allLeagues.filter(league => {
    const myTeamIds = myTeams.map(t => t.id);
    return !league.teams?.some(teamId => myTeamIds.includes(teamId));
  });

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
  };

  const LeagueCard = ({ league }) => (
    <Link
      to={createPageUrl('LeagueDetails') + `?id=${league.id}`}
      className="block bg-white rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-colors"
    >
      <div className={cn("flex items-start justify-between mb-3", isRTL && "flex-row-reverse")}>
        <div>
          <h3 className="font-semibold text-lg mb-1">{league.name}</h3>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Badge variant="outline">{t(`sports.${league.sport_type}`)}</Badge>
            <Badge className={statusColors[league.status]}>
              {t(`leagueStatus.${league.status}`)}
            </Badge>
          </div>
        </div>
        <SportIcon sport={league.sport_type} size="md" />
      </div>

      {league.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{league.description}</p>
      )}

      <div className={cn("flex items-center gap-4 text-sm text-gray-500", isRTL && "flex-row-reverse")}>
        <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
          <Users className="w-4 h-4" />
          <span>{league.teams?.length || 0} {t('teams.teams')}</span>
        </div>
        <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(league.start_date), 'MMM d')}</span>
        </div>
      </div>
    </Link>
  );

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
          <h1 className="flex-1 text-center font-semibold">{t('teams.leagues')}</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Create League Button */}
        <Link to={createPageUrl('CreateLeague')}>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 mb-6">
            <Plus className="w-5 h-5" />
            {language === 'he' ? 'צור ליגה' : 'Create League'}
          </Button>
        </Link>

        {/* Tabs */}
        <Tabs defaultValue="my" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="my">{language === 'he' ? 'הליגות שלי' : 'My Leagues'}</TabsTrigger>
            <TabsTrigger value="all">{language === 'he' ? 'כל הליגות' : 'All Leagues'}</TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="mt-6">
            {myLeagues.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {language === 'he' ? 'עדיין לא משתתף בליגות' : "You're not in any leagues yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myLeagues.map(league => (
                  <LeagueCard key={league.id} league={league} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {availableLeagues.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'he' ? 'אין ליגות זמינות כרגע' : 'No available leagues at the moment'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableLeagues.map(league => (
                  <LeagueCard key={league.id} league={league} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  Trophy,
  Users,
  Calendar,
  UserCheck,
  Crown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/i18n/LanguageContext';
import SportIcon from '@/components/common/SportIcon';
import Avatar from '@/components/common/Avatar';
import EventCard from '@/components/events/EventCard';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function LeagueDetails() {
  const { t, isRTL, language } = useLanguage();

  const urlParams = new URLSearchParams(window.location.search);
  const leagueId = urlParams.get('id');

  const { data: league } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: async () => {
      const leagues = await base44.entities.League.filter({ id: leagueId });
      return leagues[0];
    },
    enabled: !!leagueId,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['leagueTeams', league?.teams],
    queryFn: async () => {
      if (!league?.teams?.length) return [];
      const allTeams = await base44.entities.Team.list();
      return allTeams.filter(t => league.teams.includes(t.id));
    },
    enabled: !!league?.teams?.length,
  });

  const { data: referees = [] } = useQuery({
    queryKey: ['leagueReferees', league?.referees],
    queryFn: async () => {
      if (!league?.referees?.length) return [];
      const allPlayers = await base44.entities.Player.list();
      return allPlayers.filter(p => league.referees.includes(p.id));
    },
    enabled: !!league?.referees?.length,
  });

  const { data: leagueGames = [] } = useQuery({
    queryKey: ['leagueGames', leagueId],
    queryFn: () => base44.entities.Event.filter({ league_id: leagueId }, '-date', 50),
    enabled: !!leagueId,
  });

  if (!league) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
  };

  // Calculate standings from teams
  const standings = teams
    .map(team => ({
      team_id: team.id,
      name: team.name,
      logo_url: team.logo_url,
      wins: team.wins || 0,
      losses: team.losses || 0,
      draws: team.draws || 0,
      points: (team.wins || 0) * 3 + (team.draws || 0)
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => window.history.back()}
            className={cn("flex items-center gap-1 text-gray-600", isRTL && "flex-row-reverse")}
          >
            <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
            <span>{t('common.back')}</span>
          </button>
        </div>
      </div>

      {/* League Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{league.name}</h1>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Badge variant="outline">{t(`sports.${league.sport_type}`)}</Badge>
                <Badge className={statusColors[league.status]}>
                  {t(`leagueStatus.${league.status}`)}
                </Badge>
              </div>
            </div>

            <SportIcon sport={league.sport_type} size="lg" />
          </div>

          {league.description && (
            <p className="text-gray-600 mt-4">{league.description}</p>
          )}

          {/* Info */}
          <div className={cn("flex items-center gap-6 mt-4 text-sm", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {format(new Date(league.start_date), 'MMM d')} - {format(new Date(league.end_date), 'MMM d, yyyy')}
              </span>
            </div>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{teams.length} {t('teams.teams')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Tabs defaultValue="standings" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="standings">{language === 'he' ? 'טבלה' : 'Standings'}</TabsTrigger>
            <TabsTrigger value="teams">{t('teams.teams')}</TabsTrigger>
            <TabsTrigger value="games">{language === 'he' ? 'משחקים' : 'Games'}</TabsTrigger>
          </TabsList>

          <TabsContent value="standings" className="mt-6">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      {language === 'he' ? 'קבוצה' : 'Team'}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">W</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">D</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">L</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                      {language === 'he' ? 'נק׳' : 'Pts'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, index) => (
                    <tr key={team.team_id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          {index === 0 && <Crown className="w-4 h-4 text-amber-500" />}
                          {team.logo_url ? (
                            <img src={team.logo_url} alt={team.name} className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500" />
                          )}
                          <span className="font-medium">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-green-600">{team.wins}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{team.draws}</td>
                      <td className="px-4 py-3 text-center text-sm text-red-600">{team.losses}</td>
                      <td className="px-4 py-3 text-center text-sm font-bold">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="mt-6 space-y-3">
            {teams.map(team => (
              <Link
                key={team.id}
                to={createPageUrl('TeamDetails') + `?id=${team.id}`}
                className="block bg-white rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-colors"
              >
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="text-sm text-gray-500">
                      {team.members?.length || 0} {t('teams.members')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="games" className="mt-6">
            {leagueGames.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'he' ? 'עדיין אין משחקים בליגה' : 'No games in this league yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leagueGames.map(game => (
                  <EventCard key={game.id} event={game} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Referees Section */}
        {referees.length > 0 && (
          <div className="mt-8">
            <div className={cn("flex items-center gap-2 mb-4", isRTL && "flex-row-reverse")}>
              <UserCheck className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">{language === 'he' ? 'שופטים' : 'Referees'}</h2>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="space-y-3">
                {referees.map(referee => (
                  <div key={referee.id} className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <Avatar src={referee.avatar_url} name={referee.username} size="sm" />
                    <span className="font-medium">{referee.username}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Plus,
  Calendar,
  MapPin,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLanguage } from '@/components/i18n/LanguageContext';
import EventCard from '@/components/events/EventCard';
import SportIcon from '@/components/common/SportIcon';
import EmptyState from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

const SPORTS = ['football', 'basketball', 'tennis', 'volleyball', 'running', 'cycling', 'swimming', 'padel'];
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'all'];

export default function Events() {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', selectedSport, selectedSkillLevel],
    queryFn: async () => {
      let query = { status: 'upcoming' };
      if (selectedSport) query.sport_type = selectedSport;
      if (selectedSkillLevel) query.skill_level = selectedSkillLevel;
      return base44.entities.Event.filter(query, 'date', 50);
    },
  });

  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(query) ||
      event.location_name?.toLowerCase().includes(query) ||
      event.sport_type?.toLowerCase().includes(query)
    );
  });

  const clearFilters = () => {
    setSelectedSport(null);
    setSelectedSkillLevel(null);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedSport || selectedSkillLevel;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className={cn("flex items-center justify-between mb-6", isRTL && "flex-row-reverse")}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.events')}</h1>
          <p className="text-gray-500">{t('events.upcomingEvents')}</p>
        </div>
        <Link to={createPageUrl('CreateEvent')}>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('events.createEvent')}</span>
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400", isRTL ? "right-3" : "left-3")} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search')}
              className={cn("h-12 rounded-xl border-0 bg-gray-50", isRTL ? "pr-10" : "pl-10")}
            />
          </div>

          {/* Filter Button */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className={cn("h-12 gap-2 rounded-xl relative", hasActiveFilters && "border-emerald-500")}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">{t('common.filter')}</span>
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-white text-xs flex items-center justify-center">
                    {(selectedSport ? 1 : 0) + (selectedSkillLevel ? 1 : 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "left" : "right"}>
              <SheetHeader>
                <SheetTitle>{t('common.filter')}</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Sport Filter */}
                <div>
                  <h3 className="font-medium mb-3">{t('events.sport')}</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {SPORTS.map(sport => (
                      <button
                        key={sport}
                        onClick={() => setSelectedSport(selectedSport === sport ? null : sport)}
                        className={cn(
                          "flex flex-col items-center p-2 rounded-xl transition-all",
                          selectedSport === sport
                            ? "bg-emerald-100 ring-2 ring-emerald-500"
                            : "bg-gray-50 hover:bg-gray-100"
                        )}
                      >
                        <SportIcon sport={sport} size="sm" showBg={selectedSport === sport} />
                        <span className="text-xs mt-1">{t(`sports.${sport}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skill Level Filter */}
                <div>
                  <h3 className="font-medium mb-3">{t('events.skillLevel')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedSkillLevel(selectedSkillLevel === level ? null : level)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          selectedSkillLevel === level
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {t(`skillLevels.${level}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full gap-2"
                  >
                    <X className="w-4 h-4" />
                    {isRTL ? 'נקה סינון' : 'Clear Filters'}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className={cn("flex items-center gap-2 mt-3 pt-3 border-t border-gray-100", isRTL && "flex-row-reverse")}>
            {selectedSport && (
              <Badge 
                variant="secondary" 
                className="gap-1 bg-emerald-100 text-emerald-700 cursor-pointer"
                onClick={() => setSelectedSport(null)}
              >
                {t(`sports.${selectedSport}`)}
                <X className="w-3 h-3" />
              </Badge>
            )}
            {selectedSkillLevel && (
              <Badge 
                variant="secondary" 
                className="gap-1 bg-emerald-100 text-emerald-700 cursor-pointer"
                onClick={() => setSelectedSkillLevel(null)}
              >
                {t(`skillLevels.${selectedSkillLevel}`)}
                <X className="w-3 h-3" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t('events.noEvents')}
          description={hasActiveFilters ? (isRTL ? 'נסה לשנות את הסינון' : 'Try adjusting your filters') : undefined}
          action={() => window.location.href = createPageUrl('CreateEvent')}
          actionLabel={t('events.createEvent')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
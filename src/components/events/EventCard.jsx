import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '../i18n/LanguageContext';
import SportIcon from '../common/SportIcon';
import Avatar from '../common/Avatar';
import { cn } from '@/lib/utils';

export default function EventCard({ event, compact = false }) {
  const { t, isRTL } = useLanguage();
  
  const spotsLeft = event.max_players - (event.participants?.length || 0);
  const isFull = spotsLeft <= 0;

  const skillLevelColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
    all: 'bg-blue-100 text-blue-700',
  };

  const statusColors = {
    upcoming: 'bg-emerald-500',
    active: 'bg-blue-500',
    completed: 'bg-gray-400',
    cancelled: 'bg-red-500',
  };

  if (compact) {
    return (
      <Link 
        to={createPageUrl('EventDetails') + `?id=${event.id}`}
        className="block"
      >
        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
            <SportIcon sport={event.sport_type} size="md" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
              <div className={cn("flex items-center gap-2 text-sm text-gray-500 mt-1", isRTL && "flex-row-reverse")}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(new Date(event.date), 'MMM d')}</span>
                <span>•</span>
                <span>{event.start_time}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                "text-sm font-medium",
                isFull ? "text-red-500" : "text-emerald-600"
              )}>
                {isFull ? t('events.spotsFull') : `${spotsLeft} ${t('events.spotsLeft')}`}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={createPageUrl('EventDetails') + `?id=${event.id}`}
      className="block"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
        {/* Cover Image or Gradient */}
        <div className={cn(
          "h-32 relative",
          !event.cover_image && "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500"
        )}>
          {event.cover_image && (
            <img 
              src={event.cover_image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Status Badge */}
          <div className={cn("absolute top-3", isRTL ? "right-3" : "left-3")}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              statusColors[event.status]
            )} />
          </div>
          
          {/* Sport Icon */}
          <div className={cn("absolute -bottom-5", isRTL ? "left-4" : "right-4")}>
            <SportIcon sport={event.sport_type} size="lg" className="ring-4 ring-white" />
          </div>
        </div>

        <div className="p-4 pt-3">
          <div className={cn("flex items-start gap-2 mb-3", isRTL && "flex-row-reverse")}>
            <Badge className={skillLevelColors[event.skill_level] + " text-xs"}>
              {t(`skillLevels.${event.skill_level}`)}
            </Badge>
            {!event.is_public && (
              <Badge variant="outline" className="text-xs">
                {t('events.privateEvent')}
              </Badge>
            )}
          </div>

          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
            {event.title}
          </h3>

          <div className="space-y-2 text-sm text-gray-600">
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{format(new Date(event.date), 'EEEE, MMMM d')}</span>
            </div>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{event.start_time} - {event.end_time}</span>
            </div>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">{event.location_name}</span>
            </div>
          </div>

          <div className={cn(
            "flex items-center justify-between mt-4 pt-4 border-t border-gray-100",
            isRTL && "flex-row-reverse"
          )}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {event.participants?.length || 0}/{event.max_players}
              </span>
              {/* Participant Avatars */}
              <div className={cn("flex -space-x-2", isRTL && "space-x-reverse")}>
                {event.participants?.slice(0, 3).map((_, i) => (
                  <div 
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white"
                  />
                ))}
                {(event.participants?.length || 0) > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                    +{event.participants.length - 3}
                  </div>
                )}
              </div>
            </div>
            
            <span className={cn(
              "text-sm font-semibold px-3 py-1 rounded-full",
              isFull 
                ? "bg-red-100 text-red-600" 
                : "bg-emerald-100 text-emerald-600"
            )}>
              {isFull ? t('events.spotsFull') : `${spotsLeft} ${t('events.spotsLeft')}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
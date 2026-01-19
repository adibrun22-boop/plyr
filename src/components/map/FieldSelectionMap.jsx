import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Plus } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FieldCard({ field, onSelect, onCreateEvent }) {
  const { language, isRTL } = useLanguage();

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['fieldEvents', field.id],
    queryFn: async () => {
      const events = await base44.entities.Event.filter({ 
        status: 'upcoming',
        location_name: language === 'he' ? field.name_he : field.name_en
      });
      return events.slice(0, 3);
    },
  });

  return (
    <div className="bg-white rounded-lg p-4 min-w-[280px] max-w-[320px]">
      <div className={cn("flex items-start gap-2 mb-3", isRTL && "flex-row-reverse")}>
        <MapPin className="w-5 h-5 text-emerald-600 mt-1" />
        <div className={cn("flex-1", isRTL && "text-right")}>
          <h3 className="font-bold text-gray-900 text-lg">
            {language === 'he' ? field.name_he : field.name_en}
          </h3>
          <p className="text-sm text-gray-600">
            {language === 'he' ? field.city_he : field.city_en}
          </p>
        </div>
      </div>

      <div className={cn("flex flex-wrap gap-1 mb-3", isRTL && "flex-row-reverse")}>
        {field.surface_type && (
          <Badge variant="outline" className="text-xs">
            {language === 'he' 
              ? field.surface_type === 'synthetic' ? 'סינטטי' : field.surface_type === 'asphalt' ? 'אספלט' : 'דשא'
              : field.surface_type}
          </Badge>
        )}
        {field.supported_sports?.map(sport => (
          <Badge key={sport} variant="outline" className="text-xs">
            {sport}
          </Badge>
        ))}
      </div>

      {upcomingEvents.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">
            {language === 'he' ? 'אירועים קרובים' : 'Upcoming Events'}
          </p>
          <div className="space-y-1">
            {upcomingEvents.map(event => (
              <div key={event.id} className="text-xs text-gray-700 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => onSelect(field)}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          size="sm"
        >
          {language === 'he' ? 'בחר מגרש' : 'Select Field'}
        </Button>
        <Button
          onClick={() => onCreateEvent(field)}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          {language === 'he' ? 'צור' : 'Create'}
        </Button>
      </div>
    </div>
  );
}

export default function FieldSelectionMap({ onFieldSelect, onCreateAtField, filters = {} }) {
  const { language } = useLanguage();
  const [selectedField, setSelectedField] = useState(null);

  const { data: allFields = [] } = useQuery({
    queryKey: ['sportsFields'],
    queryFn: () => base44.entities.SportsField.list(),
  });

  // Filter fields based on filters
  const fields = allFields.filter(field => {
    if (filters.surfaceType && filters.surfaceType !== 'all' && field.surface_type !== filters.surfaceType) {
      return false;
    }
    // Additional distance filtering can be added here
    return true;
  });

  const defaultCenter = [31.9730, 34.7925]; // Rishon LeZion
  const defaultZoom = 13;

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {fields.map(field => (
          <Marker
            key={field.id}
            position={[field.location_coords.lat, field.location_coords.lng]}
            eventHandlers={{
              click: () => setSelectedField(field),
            }}
          >
            <Popup>
              <FieldCard
                field={field}
                onSelect={onFieldSelect}
                onCreateEvent={onCreateAtField}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
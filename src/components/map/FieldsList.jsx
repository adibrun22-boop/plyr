import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function FieldsList({ onFieldSelect }) {
  const { language, isRTL } = useLanguage();

  const { data: fields = [] } = useQuery({
    queryKey: ['sportsFields'],
    queryFn: () => base44.entities.SportsField.list(),
  });

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        {language === 'he' ? 'אין מגרשים זמינים' : 'No fields available'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map(field => (
        <button
          key={field.id}
          onClick={() => onFieldSelect(field)}
          className={cn(
            "w-full bg-white rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-all text-left",
            isRTL && "text-right"
          )}
        >
          <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {language === 'he' ? field.name_he : field.name_en}
              </h3>
              <p className="text-sm text-gray-500">
                {language === 'he' ? field.city_he : field.city_en}
              </p>
              
              {field.supported_sports && (
                <div className={cn("flex flex-wrap gap-1 mt-2", isRTL && "flex-row-reverse")}>
                  {field.supported_sports.map(sport => (
                    <Badge key={sport} variant="outline" className="text-xs">
                      {sport}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
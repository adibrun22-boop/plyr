import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function FieldFilters({ filters, onFilterChange }) {
  const { t, isRTL } = useLanguage();

  return (
    <div className={cn("grid grid-cols-2 gap-4 mb-4", isRTL && "rtl")}>
      <div>
        <Label className="text-sm text-gray-600">{t('filters.surfaceType')}</Label>
        <Select
          value={filters.surfaceType || 'all'}
          onValueChange={(value) => onFilterChange({ ...filters, surfaceType: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={t('common.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="synthetic">{t('filters.synthetic')}</SelectItem>
            <SelectItem value="asphalt">{t('filters.asphalt')}</SelectItem>
            <SelectItem value="grass">{t('filters.grass')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm text-gray-600">{t('filters.distance')}</Label>
        <Select
          value={filters.distance || 'all'}
          onValueChange={(value) => onFilterChange({ ...filters, distance: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={t('common.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="1">{t('filters.within')} 1 {t('filters.km')}</SelectItem>
            <SelectItem value="3">{t('filters.within')} 3 {t('filters.km')}</SelectItem>
            <SelectItem value="5">{t('filters.within')} 5 {t('filters.km')}</SelectItem>
            <SelectItem value="10">{t('filters.within')} 10 {t('filters.km')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users,
  Check,
  Image as ImageIcon,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/components/i18n/LanguageContext';
import SportIcon from '@/components/common/SportIcon';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SPORTS = ['football', 'basketball', 'tennis', 'volleyball', 'running', 'cycling', 'swimming', 'padel', 'yoga', 'fitness'];
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'all'];

export default function CreateEvent() {
  const { t, isRTL, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [locationSearch, setLocationSearch] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    sport_type: '',
    location_name: '',
    location_address: '',
    location_coords: null,
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '18:00',
    end_time: '20:00',
    max_players: 10,
    min_players: 4,
    skill_level: 'all',
    is_public: true,
    description: '',
    cover_image: ''
  });

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

  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Event.create({
        ...data,
        organizer_id: player.id,
        organizer_name: player.username,
        participants: [player.id],
        confirmed_attendance: [],
        status: 'upcoming',
        photos: [],
        ratings_completed: false
      });
    },
    onSuccess: (event) => {
      window.location.href = createPageUrl('EventDetails') + `?id=${event.id}`;
    }
  });

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, cover_image: file_url }));
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAILocationSearch = async () => {
    if (!locationSearch.trim()) return;
    
    setIsSearchingLocation(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract location information from this text: "${locationSearch}". 
        Return a JSON object with: name (location name), address (full address), lat (latitude), lng (longitude).
        If you can't determine exact coordinates, use approximate coordinates for the area.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            address: { type: "string" },
            lat: { type: "number" },
            lng: { type: "number" }
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        location_name: result.name || locationSearch,
        location_address: result.address || '',
        location_coords: (result.lat && result.lng) ? { lat: result.lat, lng: result.lng } : null
      }));
      setLocationSearch('');
    } catch (error) {
      console.error('Location search failed:', error);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.sport_type;
    if (step === 2) return formData.title && formData.location_name && formData.date;
    return true;
  };

  const handleSubmit = () => {
    createEventMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : window.history.back()}
            className={cn("flex items-center gap-1 text-gray-600", isRTL && "flex-row-reverse")}
          >
            <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
            <span>{step > 1 ? t('common.back') : t('common.cancel')}</span>
          </button>
          
          <span className="font-semibold">{t('events.createEvent')}</span>
          
          <div className="w-16" />
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: Sport Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {language === 'he' ? 'באיזה ענף ספורט?' : 'What sport?'}
            </h2>
            <p className="text-gray-500 mb-6">
              {language === 'he' ? 'בחר את ענף הספורט לאירוע' : 'Select the sport for your event'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SPORTS.map(sport => (
                <button
                  key={sport}
                  onClick={() => updateField('sport_type', sport)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl transition-all",
                    formData.sport_type === sport
                      ? "bg-emerald-100 ring-2 ring-emerald-500"
                      : "bg-white border border-gray-200 hover:border-emerald-300"
                  )}
                >
                  <SportIcon sport={sport} size="md" />
                  <span className="font-medium">{t(`sports.${sport}`)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Event Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {language === 'he' ? 'פרטי האירוע' : 'Event Details'}
              </h2>
            </div>

            {/* Cover Image */}
            <div>
              <Label>{language === 'he' ? 'תמונת כיסוי' : 'Cover Image'}</Label>
              <label className="mt-2 block">
                <div className={cn(
                  "h-40 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden",
                  "hover:border-emerald-400 transition-colors",
                  formData.cover_image && "border-0"
                )}>
                  {formData.cover_image ? (
                    <div className="relative w-full h-full">
                      <img src={formData.cover_image} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.preventDefault(); updateField('cover_image', ''); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-500">
                        {language === 'he' ? 'הוסף תמונה' : 'Add image'}
                      </span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            </div>

            {/* Title */}
            <div>
              <Label>{t('events.title')}</Label>
              <Input
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder={language === 'he' ? 'למשל: משחק כדורגל בפארק' : 'e.g., Friendly football match'}
                className="mt-1"
              />
            </div>

            {/* Location */}
            <div>
              <Label>{t('events.location')}</Label>
              
              {/* AI Location Search */}
              <div className={cn("flex gap-2 mt-1", isRTL && "flex-row-reverse")}>
                <div className="flex-1 relative">
                  <Sparkles className={cn("absolute top-3 w-5 h-5 text-emerald-500", isRTL ? "right-3" : "left-3")} />
                  <Input
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder={language === 'he' ? 'תאר את המיקום...' : 'Describe location...'}
                    className={cn(isRTL ? "pr-10" : "pl-10")}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAILocationSearch();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAILocationSearch}
                  disabled={!locationSearch.trim() || isSearchingLocation}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSearchingLocation ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Manual Location Entry */}
              <div className="relative mt-2">
                <MapPin className={cn("absolute top-3 w-5 h-5 text-gray-400", isRTL ? "right-3" : "left-3")} />
                <Input
                  value={formData.location_name}
                  onChange={(e) => updateField('location_name', e.target.value)}
                  placeholder={language === 'he' ? 'שם המקום' : 'Location name'}
                  className={cn(isRTL ? "pr-10" : "pl-10")}
                />
              </div>
              <Input
                value={formData.location_address}
                onChange={(e) => updateField('location_address', e.target.value)}
                placeholder={language === 'he' ? 'כתובת (אופציונלי)' : 'Address (optional)'}
                className="mt-2"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('events.date')}</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('events.startTime')}</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => updateField('start_time', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>{t('events.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder={language === 'he' ? 'תיאור האירוע...' : 'Event description...'}
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {language === 'he' ? 'הגדרות' : 'Settings'}
              </h2>
            </div>

            {/* Player Limits */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <Label className="text-base">{t('events.players')}</Label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <span className="text-sm text-gray-500">{t('events.minPlayers')}</span>
                  <Input
                    type="number"
                    min="2"
                    value={formData.min_players}
                    onChange={(e) => updateField('min_players', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <span className="text-sm text-gray-500">{t('events.maxPlayers')}</span>
                  <Input
                    type="number"
                    min="2"
                    value={formData.max_players}
                    onChange={(e) => updateField('max_players', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Skill Level */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <Label className="text-base">{t('events.skillLevel')}</Label>
              <div className="flex flex-wrap gap-2 mt-3">
                {SKILL_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => updateField('skill_level', level)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      formData.skill_level === level
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {t(`skillLevels.${level}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Public/Private */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div>
                  <Label className="text-base">{t('events.publicEvent')}</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    {language === 'he' 
                      ? 'אירוע ציבורי יופיע לכל המשתמשים' 
                      : 'Public events are visible to everyone'}
                  </p>
                </div>
                <Switch
                  checked={formData.is_public}
                  onCheckedChange={(checked) => updateField('is_public', checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8">
          {step < 3 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-lg"
            >
              {t('common.next')}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createEventMutation.isPending}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-lg gap-2"
            >
              <Check className="w-5 h-5" />
              {t('events.createEvent')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
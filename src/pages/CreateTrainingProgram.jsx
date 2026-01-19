import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CreateTrainingProgram() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, isRTL, language } = useLanguage();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport_type: 'football',
    duration_weeks: 4,
    difficulty_level: 'beginner',
    is_public: true,
    sessions: []
  });

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

  const createProgramMutation = useMutation({
    mutationFn: (data) => base44.entities.TrainingProgram.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['training-programs']);
      toast.success(isRTL ? 'תוכנית האימון נוצרה בהצלחה' : 'Training program created successfully');
      navigate(createPageUrl('CoachDashboard'));
    },
  });

  const addSession = () => {
    setFormData({
      ...formData,
      sessions: [
        ...formData.sessions,
        {
          week: formData.sessions.length + 1,
          title: '',
          description: '',
          duration_minutes: 60
        }
      ]
    });
  };

  const removeSession = (index) => {
    setFormData({
      ...formData,
      sessions: formData.sessions.filter((_, i) => i !== index)
    });
  };

  const updateSession = (index, field, value) => {
    const newSessions = [...formData.sessions];
    newSessions[index][field] = value;
    setFormData({ ...formData, sessions: newSessions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error(isRTL ? 'נא למלא כותרת' : 'Please enter a title');
      return;
    }
    createProgramMutation.mutate({
      ...formData,
      coach_id: player.id,
      enrolled_players: []
    });
  };

  if (player?.profile_type !== 'coach') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">This page is only available for coach profiles.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {isRTL ? 'חזור' : 'Back'}
      </Button>

      <h1 className="text-3xl font-bold mb-6">
        {isRTL ? 'צור תוכנית אימון חדשה' : 'Create New Training Program'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'פרטים כלליים' : 'General Details'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{isRTL ? 'כותרת התוכנית' : 'Program Title'}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={isRTL ? 'לדוגמה: תוכנית כדורגל למתחילים' : 'e.g., Beginner Football Program'}
              />
            </div>

            <div>
              <Label>{isRTL ? 'תיאור' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isRTL ? 'תאר את התוכנית...' : 'Describe the program...'}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>{isRTL ? 'ספורט' : 'Sport'}</Label>
                <Select value={formData.sport_type} onValueChange={(val) => setFormData({ ...formData, sport_type: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{isRTL ? 'משך (שבועות)' : 'Duration (weeks)'}</Label>
                <Input
                  type="number"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                  min={1}
                />
              </div>

              <div>
                <Label>{isRTL ? 'רמת קושי' : 'Difficulty'}</Label>
                <Select value={formData.difficulty_level} onValueChange={(val) => setFormData({ ...formData, difficulty_level: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{isRTL ? 'מתחיל' : 'Beginner'}</SelectItem>
                    <SelectItem value="intermediate">{isRTL ? 'בינוני' : 'Intermediate'}</SelectItem>
                    <SelectItem value="advanced">{isRTL ? 'מתקדם' : 'Advanced'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
              />
              <Label>{isRTL ? 'תוכנית ציבורית (גלויה לכל המשתמשים)' : 'Public Program (visible to all users)'}</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <CardTitle>{isRTL ? 'מפגשי אימון' : 'Training Sessions'}</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addSession}>
                <Plus className="w-4 h-4 mr-2" />
                {isRTL ? 'הוסף מפגש' : 'Add Session'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isRTL ? 'לא נוספו מפגשי אימון עדיין' : 'No training sessions added yet'}
              </div>
            ) : (
              <div className="space-y-4">
                {formData.sessions.map((session, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
                      <h4 className="font-medium">
                        {isRTL ? `מפגש ${index + 1}` : `Session ${index + 1}`}
                      </h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeSession(index)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <Input
                          placeholder={isRTL ? 'כותרת המפגש' : 'Session title'}
                          value={session.title}
                          onChange={(e) => updateSession(index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder={isRTL ? 'משך (דקות)' : 'Duration (min)'}
                          value={session.duration_minutes}
                          onChange={(e) => updateSession(index, 'duration_minutes', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Textarea
                          placeholder={isRTL ? 'תיאור המפגש' : 'Session description'}
                          value={session.description}
                          onChange={(e) => updateSession(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
            {isRTL ? 'צור תוכנית' : 'Create Program'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            {isRTL ? 'ביטול' : 'Cancel'}
          </Button>
        </div>
      </form>
    </div>
  );
}
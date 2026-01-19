import React from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft,
  ChevronRight,
  Globe,
  Bell,
  Shield,
  LogOut,
  Trash2,
  FileText,
  Mail,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLanguage } from '@/components/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const queryClient = useQueryClient();

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

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ type, key, value }) => {
      if (!player) return;
      
      if (type === 'privacy') {
        const privacySettings = { ...(player.privacy_settings || {}), [key]: value };
        return base44.entities.Player.update(player.id, { privacy_settings: privacySettings });
      } else if (type === 'notification') {
        const notificationSettings = { ...(player.notification_settings || {}), [key]: value };
        return base44.entities.Player.update(player.id, { notification_settings: notificationSettings });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPlayer'] });
    },
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  const privacySettings = player?.privacy_settings || {
    show_stats: true,
    show_history: true,
    allow_friend_requests: true
  };

  const notificationSettings = player?.notification_settings || {
    event_reminders: true,
    game_invites: true,
    ratings: true,
    social: true
  };

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
          <h1 className="flex-1 text-center font-semibold">{t('settings.title')}</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Language */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <div className={cn("p-4 flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{t('settings.language')}</h3>
            </div>
          </div>
          <Separator />
          <div className="p-2">
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                "w-full p-3 rounded-xl flex items-center justify-between",
                language === 'en' ? "bg-emerald-50" : "hover:bg-gray-50"
              )}
            >
              <span>English</span>
              {language === 'en' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
            </button>
            <button
              onClick={() => setLanguage('he')}
              className={cn(
                "w-full p-3 rounded-xl flex items-center justify-between",
                language === 'he' ? "bg-emerald-50" : "hover:bg-gray-50"
              )}
            >
              <span>עברית</span>
              {language === 'he' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <div className={cn("p-4 flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{t('settings.privacy')}</h3>
            </div>
          </div>
          <Separator />
          <div className="p-4 space-y-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t('settings.showStats')}</span>
              <Switch
                checked={privacySettings.show_stats}
                onCheckedChange={(checked) => 
                  updateSettingsMutation.mutate({ type: 'privacy', key: 'show_stats', value: checked })
                }
              />
            </div>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t('settings.showHistory')}</span>
              <Switch
                checked={privacySettings.show_history}
                onCheckedChange={(checked) => 
                  updateSettingsMutation.mutate({ type: 'privacy', key: 'show_history', value: checked })
                }
              />
            </div>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t('settings.allowFriendRequests')}</span>
              <Switch
                checked={privacySettings.allow_friend_requests}
                onCheckedChange={(checked) => 
                  updateSettingsMutation.mutate({ type: 'privacy', key: 'allow_friend_requests', value: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <div className={cn("p-4 flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{t('settings.notificationSettings')}</h3>
            </div>
          </div>
          <Separator />
          <div className="p-4 space-y-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t('settings.eventReminders')}</span>
              <Switch
                checked={notificationSettings.event_reminders}
                onCheckedChange={(checked) => 
                  updateSettingsMutation.mutate({ type: 'notification', key: 'event_reminders', value: checked })
                }
              />
            </div>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t('settings.gameInvites')}</span>
              <Switch
                checked={notificationSettings.game_invites}
                onCheckedChange={(checked) => 
                  updateSettingsMutation.mutate({ type: 'notification', key: 'game_invites', value: checked })
                }
              />
            </div>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t('settings.ratingsNotif')}</span>
              <Switch
                checked={notificationSettings.ratings}
                onCheckedChange={(checked) => 
                  updateSettingsMutation.mutate({ type: 'notification', key: 'ratings', value: checked })
                }
              />
            </div>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <span className="text-sm">{t('settings.socialNotif')}</span>
              <Switch
                checked={notificationSettings.social}
                onCheckedChange={(checked) => 
                  updateSettingsMutation.mutate({ type: 'notification', key: 'social', value: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Legal & Support */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <div className={cn("p-4 flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{language === 'he' ? 'מידע ותמיכה' : 'Info & Support'}</h3>
            </div>
          </div>
          <Separator />
          <div className="p-2 space-y-1">
            <a href={createPageUrl('ContactUs')}>
              <button className={cn("w-full p-3 rounded-xl hover:bg-gray-50 flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{t('legal.contactUs')}</span>
                </div>
                <ChevronRight className={cn("w-5 h-5 text-gray-400", isRTL && "rotate-180")} />
              </button>
            </a>
            <a href={createPageUrl('TermsOfUse')}>
              <button className={cn("w-full p-3 rounded-xl hover:bg-gray-50 flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span>{t('legal.termsOfUse')}</span>
                </div>
                <ChevronRight className={cn("w-5 h-5 text-gray-400", isRTL && "rotate-180")} />
              </button>
            </a>
            <a href={createPageUrl('PrivacyPolicy')}>
              <button className={cn("w-full p-3 rounded-xl hover:bg-gray-50 flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span>{t('legal.privacyPolicy')}</span>
                </div>
                <ChevronRight className={cn("w-5 h-5 text-gray-400", isRTL && "rotate-180")} />
              </button>
            </a>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full h-12 gap-2 justify-start text-gray-600"
          >
            <LogOut className="w-5 h-5" />
            {t('settings.logout')}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 gap-2 justify-start text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" />
                {t('settings.deleteAccount')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('settings.deleteAccount')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {language === 'he' 
                    ? 'האם אתה בטוח? פעולה זו תמחק את כל הנתונים שלך לצמיתות.'
                    : 'Are you sure? This will permanently delete all your data.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-gray-400 mt-8">
          PLYR v1.0.0
        </p>
      </div>
    </div>
  );
}
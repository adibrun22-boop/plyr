import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, 
  Calendar, 
  Newspaper, 
  User, 
  Bell,
  Settings,
  Menu,
  X,
  Plus,
  Users,
  Trophy,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageProvider, useLanguage } from '@/components/i18n/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

function LayoutContent({ children, currentPageName }) {
  const { t, isRTL, language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const location = useLocation();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const player = await base44.entities.Player.filter({ user_id: user.id });
        if (player.length === 0) return [];
        return base44.entities.Notification.filter({ player_id: player[0].id, is_read: false });
      } catch {
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const { data: player } = useQuery({
    queryKey: ['current-player'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const players = await base44.entities.Player.filter({ user_id: user.id });
        return players[0];
      } catch {
        return null;
      }
    },
  });

  const unreadCount = notifications.length;

  const navItems = [
    { name: 'Home', icon: Home, label: t('nav.home') },
    { name: 'Events', icon: Calendar, label: t('nav.events') },
    { name: 'Feed', icon: Newspaper, label: t('nav.feed') },
    { name: 'Profile', icon: User, label: t('nav.profile') },
  ];

  const isActivePage = (pageName) => {
    return currentPageName === pageName;
  };

  // Hide nav on certain pages
  const hideNav = ['PostGame', 'Onboarding'].includes(currentPageName);

  return (
    <div className={cn("min-h-screen bg-gray-50", isRTL && "rtl")}>
      <style>{`
        :root {
          --color-primary: #10b981;
          --color-primary-dark: #059669;
        }
        .rtl {
          direction: rtl;
        }
        .rtl .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
          --tw-space-x-reverse: 1;
        }
      `}</style>

      {/* Top Header - Desktop */}
      {!hideNav && (
        <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="font-bold text-xl text-gray-900">PLYR</span>
            </Link>

            {/* Desktop Nav */}
            <nav className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    isActivePage(item.name)
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <Link to={createPageUrl('Teams')}>
                <Button variant="outline" className="gap-2">
                  <Users className="w-4 h-4" />
                  {t('teams.myTeams')}
                </Button>
              </Link>
              <Link to={createPageUrl('CreateEvent')}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Plus className="w-4 h-4" />
                  {t('events.createEvent')}
                </Button>
              </Link>
              
              <Link to={createPageUrl('Notifications')} className="relative">
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleLanguage}
                className="text-sm"
              >
                {language === 'en' ? 'עב' : 'EN'}
              </Button>

              <Link to={createPageUrl('Settings')}>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Header */}
      {!hideNav && (
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
          <div className="px-4 h-14 flex items-center justify-between">
            <Sheet open={sideMenuOpen} onOpenChange={setSideMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="w-80">
                <SheetHeader>
                  <SheetTitle className={cn(isRTL && "text-right")}>
                    {isRTL ? 'תפריט' : 'Menu'}
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 space-y-1">
                  <Link 
                    to={createPageUrl('Teams')} 
                    onClick={() => setSideMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{isRTL ? 'הקבוצות שלי' : 'My Teams'}</span>
                  </Link>

                  <Link 
                    to={createPageUrl('Leagues')} 
                    onClick={() => setSideMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Trophy className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{isRTL ? 'ליגות' : 'Leagues'}</span>
                  </Link>

                  <Link 
                    to={createPageUrl('TrainingPrograms')} 
                    onClick={() => setSideMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <BookOpen className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{isRTL ? 'תוכניות אימון' : 'Training Programs'}</span>
                  </Link>

                  {player?.profile_type === 'coach' && (
                    <Link 
                      to={createPageUrl('CoachDashboard')} 
                      onClick={() => setSideMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <GraduationCap className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{isRTL ? 'לוח מאמן' : 'Coach Dashboard'}</span>
                    </Link>
                  )}

                  <div className="border-t my-4"></div>

                  <Link 
                    to={createPageUrl('Settings')} 
                    onClick={() => setSideMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{isRTL ? 'הגדרות' : 'Settings'}</span>
                  </Link>

                  <button
                    onClick={() => {
                      toggleLanguage();
                      setSideMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">
                      {language === 'en' ? 'עב' : 'EN'}
                    </span>
                    <span className="font-medium">{isRTL ? 'שפה' : 'Language'}</span>
                  </button>
                </nav>
              </SheetContent>
            </Sheet>

            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="font-bold text-lg text-gray-900">PLYR</span>
            </Link>

            <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
              <Link to={createPageUrl('Notifications')} className="relative">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        "pb-20 md:pb-8",
        !hideNav && "pt-14 md:pt-16"
      )}>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {!hideNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all",
                  isActivePage(item.name)
                    ? "text-emerald-600"
                    : "text-gray-400"
                )}
              >
                <item.icon className={cn(
                  "w-6 h-6 mb-1",
                  isActivePage(item.name) && "text-emerald-600"
                )} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
            <Link
              to={createPageUrl('CreateEvent')}
              className="flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 -mt-4">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent currentPageName={currentPageName}>
        {children}
      </LayoutContent>
    </LanguageProvider>
  );
}
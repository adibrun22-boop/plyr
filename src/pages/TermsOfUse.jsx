import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function TermsOfUse() {
  const { t, isRTL, language } = useLanguage();

  const content = language === 'he' ? {
    title: 'תנאי שימוש',
    sections: [
      {
        title: 'קבלת התנאים',
        content: 'על ידי שימוש באפליקציה, אתה מסכים לתנאי השימוש המפורטים כאן.'
      },
      {
        title: 'שימוש באפליקציה',
        content: 'האפליקציה מיועדת לארגון משחקים ואירועי ספורט. אסור להשתמש בה למטרות בלתי חוקיות.'
      },
      {
        title: 'חשבון משתמש',
        content: 'אתה אחראי לשמור על פרטי החשבון שלך בסודיות ובטחון.'
      },
      {
        title: 'תוכן משתמשים',
        content: 'אתה אחראי לתוכן שאתה מפרסם. אסור לפרסם תוכן פוגעני או בלתי הולם.'
      },
      {
        title: 'שינויים',
        content: 'אנו שומרים לעצמנו את הזכות לשנות את תנאי השימוש בכל עת.'
      }
    ]
  } : {
    title: 'Terms of Use',
    sections: [
      {
        title: 'Acceptance of Terms',
        content: 'By using this application, you agree to these terms of use.'
      },
      {
        title: 'Use of Application',
        content: 'The app is intended for organizing sports games and events. Illegal use is prohibited.'
      },
      {
        title: 'User Account',
        content: 'You are responsible for maintaining the confidentiality and security of your account.'
      },
      {
        title: 'User Content',
        content: 'You are responsible for content you post. Offensive or inappropriate content is prohibited.'
      },
      {
        title: 'Changes',
        content: 'We reserve the right to modify these terms at any time.'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-14 md:top-16 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => window.history.back()}
            className={cn("flex items-center gap-1 text-gray-600", isRTL && "flex-row-reverse")}
          >
            <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
            <span>{t('common.back')}</span>
          </button>
          <h1 className="flex-1 text-center font-semibold">{content.title}</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 space-y-6">
          {content.sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export default function PrivacyPolicy() {
  const { t, isRTL, language } = useLanguage();

  const content = language === 'he' ? {
    title: 'מדיניות פרטיות',
    sections: [
      {
        title: 'איסוף מידע',
        content: 'אנו אוספים מידע שאתה מספק בעת רישום ושימוש באפליקציה, כולל שם, אימייל ותמונת פרופיל.'
      },
      {
        title: 'שימוש במידע',
        content: 'אנו משתמשים במידע שלך כדי לספק ולשפר את שירותי האפליקציה.'
      },
      {
        title: 'שיתוף מידע',
        content: 'אנו לא משתפים את המידע האישי שלך עם צדדים שלישיים ללא הסכמתך.'
      },
      {
        title: 'אבטחת מידע',
        content: 'אנו נוקטים באמצעי אבטחה סבירים להגנה על המידע שלך.'
      },
      {
        title: 'זכויותיך',
        content: 'יש לך זכות לגשת, לתקן או למחוק את המידע האישי שלך בכל עת.'
      }
    ]
  } : {
    title: 'Privacy Policy',
    sections: [
      {
        title: 'Information Collection',
        content: 'We collect information you provide when registering and using the app, including name, email, and profile photo.'
      },
      {
        title: 'Use of Information',
        content: 'We use your information to provide and improve our app services.'
      },
      {
        title: 'Information Sharing',
        content: 'We do not share your personal information with third parties without your consent.'
      },
      {
        title: 'Data Security',
        content: 'We implement reasonable security measures to protect your information.'
      },
      {
        title: 'Your Rights',
        content: 'You have the right to access, correct, or delete your personal information at any time.'
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
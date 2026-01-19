import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function ContactUs() {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      const user = await base44.auth.me();
      
      await base44.integrations.Core.SendEmail({
        to: 'support@plyr.app',
        subject: `Contact Form: ${formData.subject}`,
        body: `From: ${user.email}\n\n${formData.message}`
      });
      
      setSent(true);
      setFormData({ subject: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
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
          <h1 className="flex-1 text-center font-semibold">{t('legal.contactUs')}</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {sent ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('common.success')}
            </h2>
            <p className="text-gray-600">
              {isRTL ? 'נחזור אליך בקרוב' : 'We\'ll get back to you soon'}
            </p>
            <Button 
              onClick={() => setSent(false)}
              variant="outline"
              className="mt-6"
            >
              {isRTL ? 'שלח הודעה נוספת' : 'Send another message'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <Label>{t('legal.subject')}</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder={isRTL ? 'נושא ההודעה' : 'Message subject'}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>{t('legal.yourMessage')}</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={isRTL ? 'כתוב את הודעתך כאן...' : 'Write your message here...'}
                  required
                  rows={6}
                  className="mt-1 resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSending}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isSending ? t('common.loading') : t('legal.sendMessage')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
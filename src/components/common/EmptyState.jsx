import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className = ''
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-6 text-center',
      className
    )}>
      {Icon && (
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action} className="bg-emerald-600 hover:bg-emerald-700">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
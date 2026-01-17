import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Avatar from '../common/Avatar';
import LevelBadge from '../common/LevelBadge';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

export default function FriendsList({ currentPlayer }) {
  const { t, isRTL, language } = useLanguage();

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => base44.entities.Player.list(),
  });

  const friends = allPlayers.filter(p => 
    currentPlayer?.friends?.includes(p.id)
  );

  if (friends.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
        <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">
          {language === 'he' ? 'אין חברים עדיין' : 'No friends yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {friends.map(friend => (
        <Link
          key={friend.id}
          to={createPageUrl('Profile') + `?id=${friend.id}`}
          className="bg-white rounded-xl p-3 border border-gray-100 hover:border-emerald-200 transition-all flex flex-col items-center"
        >
          <div className="relative mb-2">
            <Avatar src={friend.avatar_url} name={friend.username} size="lg" />
            <div className="absolute -bottom-1 -right-1">
              <LevelBadge level={friend.level || 1} size="sm" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-900 text-center truncate w-full">
            {friend.username}
          </p>
        </Link>
      ))}
    </div>
  );
}
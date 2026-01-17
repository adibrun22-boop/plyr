import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Trophy, MoreHorizontal, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '../i18n/LanguageContext';
import Avatar from '../common/Avatar';
import SportIcon from '../common/SportIcon';
import { cn } from '@/lib/utils';

export default function FeedCard({ 
  post, 
  currentPlayerId,
  currentPlayer,
  comments = [],
  onLike,
  onComment 
}) {
  const { t, language, isRTL } = useLanguage();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  const isLiked = post.likes?.includes(currentPlayerId);
  const content = language === 'he' ? post.content_he : post.content_en;
  
  const getPostTypeLabel = () => {
    switch (post.type) {
      case 'game_completed':
        return t('feed.completedGame');
      case 'achievement':
        return t('feed.earnedAchievement');
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className={cn("p-4 flex items-center gap-3", isRTL && "flex-row-reverse")}>
        <Avatar 
          src={post.player_avatar} 
          name={post.player_name} 
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <span className="font-semibold text-gray-900">{post.player_name}</span>
            <span className="text-gray-500 text-sm">{getPostTypeLabel()}</span>
          </div>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
          </span>
        </div>
        {post.sport_type && (
          <SportIcon sport={post.sport_type} size="sm" />
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {content && (
          <p className={cn("text-gray-800 mb-3", isRTL && "text-right")}>
            {content}
          </p>
        )}

        {/* Score Display for Game Completed */}
        {post.type === 'game_completed' && post.score && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-3">
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-900">{post.score}</span>
            </div>
          </div>
        )}

        {/* Achievement Display */}
        {post.type === 'achievement' && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 mb-3 flex items-center gap-3 justify-center">
            <Trophy className="w-8 h-8 text-amber-500" />
            <span className="font-semibold text-amber-800">{post.achievement_id}</span>
          </div>
        )}

        {/* Photos Grid */}
        {post.photos && post.photos.length > 0 && (
          <div className={cn(
            "grid gap-2 rounded-xl overflow-hidden",
            post.photos.length === 1 && "grid-cols-1",
            post.photos.length === 2 && "grid-cols-2",
            post.photos.length >= 3 && "grid-cols-3"
          )}>
            {post.photos.slice(0, 4).map((photo, i) => (
              <div key={i} className={cn(
                "relative",
                post.photos.length === 1 ? "aspect-video" : "aspect-square"
              )}>
                <img 
                  src={photo} 
                  alt=""
                  className="w-full h-full object-cover"
                />
                {i === 3 && post.photos.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      +{post.photos.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Participants */}
        {post.participants && post.participants.length > 0 && (
          <div className={cn("flex items-center gap-2 mt-3 text-sm text-gray-500", isRTL && "flex-row-reverse")}>
            <span>{t('feed.withPlayers')}</span>
            <div className={cn("flex -space-x-2", isRTL && "space-x-reverse")}>
              {post.participants.slice(0, 5).map((_, i) => (
                <div 
                  key={i}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white"
                />
              ))}
            </div>
            {post.participants.length > 5 && (
              <span>{t('feed.andMore', { count: post.participants.length - 5 })}</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={cn(
        "px-4 py-3 border-t border-gray-100 flex items-center gap-1",
        isRTL && "flex-row-reverse"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike && onLike(post.id)}
          className={cn(
            "flex items-center gap-2",
            isLiked && "text-red-500"
          )}
        >
          <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          <span>{post.likes?.length || 0}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Comment Input */}
          <div className={cn("flex items-center gap-2 mt-4 mb-4", isRTL && "flex-row-reverse")}>
            <Avatar 
              src={currentPlayer?.avatar_url} 
              name={currentPlayer?.username} 
              size="sm"
            />
            <div className="flex-1 relative">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t('feed.writeComment')}
                className={cn("pr-10", isRTL && "pl-10 pr-3")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    onComment && onComment(post.id, commentText.trim());
                    setCommentText('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (commentText.trim()) {
                    onComment && onComment(post.id, commentText.trim());
                    setCommentText('');
                  }
                }}
                disabled={!commentText.trim()}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-emerald-600 disabled:text-gray-300",
                  isRTL ? "left-2" : "right-2"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-4">{t('feed.noComments')}</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className={cn("flex items-start gap-2", isRTL && "flex-row-reverse text-right")}>
                  <Avatar 
                    src={comment.player_avatar} 
                    name={comment.player_name} 
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2">
                      <span className="font-medium text-sm">{comment.player_name}</span>
                      <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 block px-3">
                      {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
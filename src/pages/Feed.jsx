import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/components/i18n/LanguageContext';
import FeedCard from '@/components/feed/FeedCard';
import EmptyState from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

export default function Feed() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: currentPlayer } = useQuery({
    queryKey: ['currentPlayer', user?.id],
    queryFn: async () => {
      const players = await base44.entities.Player.filter({ user_id: user.id });
      return players[0];
    },
    enabled: !!user?.id,
  });

  const { data: posts = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['feedPosts'],
    queryFn: () => base44.entities.FeedPost.list('-created_date', 50),
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['allComments'],
    queryFn: () => base44.entities.Comment.list('-created_date', 200),
  });

  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      const post = posts.find(p => p.id === postId);
      const likes = post.likes || [];
      const isLiked = likes.includes(currentPlayer.id);
      
      const newLikes = isLiked 
        ? likes.filter(id => id !== currentPlayer.id)
        : [...likes, currentPlayer.id];
      
      return base44.entities.FeedPost.update(postId, { likes: newLikes });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedPosts'] }),
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }) => {
      await base44.entities.Comment.create({
        post_id: postId,
        player_id: currentPlayer.id,
        player_name: currentPlayer.username,
        player_avatar: currentPlayer.avatar_url,
        content
      });
      
      const post = posts.find(p => p.id === postId);
      await base44.entities.FeedPost.update(postId, { 
        comments_count: (post.comments_count || 0) + 1 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allComments'] });
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className={cn("flex items-center justify-between mb-6", isRTL && "flex-row-reverse")}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('feed.socialFeed')}</h1>
          <p className="text-gray-500">{t('common.seeMore')}</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={cn("w-4 h-4", isRefetching && "animate-spin")} />
        </Button>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={t('feed.noPosts')}
          description={isRTL ? 'שחק משחק כדי להתחיל לשתף' : 'Play a game to start sharing'}
        />
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <FeedCard
              key={post.id}
              post={post}
              currentPlayerId={currentPlayer?.id}
              currentPlayer={currentPlayer}
              comments={allComments.filter(c => c.post_id === post.id)}
              onLike={(postId) => likeMutation.mutate(postId)}
              onComment={(postId, content) => commentMutation.mutate({ postId, content })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
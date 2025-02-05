import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/posts/PostCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface PostsFeedProps {
  userId: string;
  defaultChannelId?: number;
  hideChannelTag?: boolean;
}

const PostsFeed = ({ userId, defaultChannelId, hideChannelTag }: PostsFeedProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(defaultChannelId || null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const fetchPosts = async () => {
    try {
      console.log("Fetching posts...");
      let query = supabase
        .from("posts")
        .select(`
          *,
          profile:profile(name, bio, profile_picture),
          likes(count),
          comments(
            id,
            content,
            created_at,
            user_id,
            profile:profile(name, bio, profile_picture)
          )
        `)
        .order("created_at", { ascending: false });

      if (selectedChannel !== null) {
        query = query.eq("channel_id", selectedChannel);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
      
      console.log("Fetched posts:", data);
      setPosts(data || []);
    } catch (error: any) {
      console.error("Error in fetchPosts:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (deletedPostId: number) => {
    setPosts(currentPosts => currentPosts.filter(post => post.id !== deletedPostId));
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedChannel]);

  if (loading) {
    return <div className="text-center p-2">Loading posts...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={userId}
              onLikeUpdate={fetchPosts}
              onPostDeleted={() => handlePostDeleted(post.id)}
              hideChannelTag={hideChannelTag}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PostsFeed;
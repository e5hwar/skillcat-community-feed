import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PostsList from "./feed/PostsList";
import PostsFeedEmpty from "./feed/PostsFeedEmpty";
import PostsFeedLoading from "./feed/PostsFeedLoading";

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
    return <PostsFeedLoading />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {posts.length === 0 ? (
        <PostsFeedEmpty />
      ) : (
        <PostsList
          posts={posts}
          currentUserId={userId}
          onLikeUpdate={fetchPosts}
          onPostDeleted={handlePostDeleted}
          hideChannelTag={hideChannelTag}
        />
      )}
    </div>
  );
};

export default PostsFeed;
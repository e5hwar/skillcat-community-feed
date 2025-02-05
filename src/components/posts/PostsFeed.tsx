import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface Channel {
  id: number;
  name: string;
  description: string | null;
}

interface PostsFeedProps {
  userId: string;
  defaultChannelId?: number;
}

const PostsFeed = ({ userId, defaultChannelId }: PostsFeedProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(defaultChannelId || null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const fetchChannels = async () => {
    try {
      console.log("Fetching channels...");
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("name");

      if (error) throw error;
      console.log("Fetched channels:", data);
      setChannels(data || []);
    } catch (error: any) {
      console.error("Error fetching channels:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
    fetchChannels();
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedChannel]);

  const handleChannelClick = (channelId: number) => {
    if (!defaultChannelId) {
      navigate(`/channel/${channelId}`);
    }
  };

  if (loading) {
    return <div className="text-center p-2">Loading posts...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4">
      {!defaultChannelId && (
        <div className="text-left mb-6">
          <h1 className="text-2xl font-bold mb-4">Community</h1>
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Channels</h2>
            <div className="flex flex-col gap-2">
              {channels.map((channel) => {
                const hasNoPosts = !posts.some(post => post.channel_id === channel.id);
                return (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelClick(channel.id)}
                    className={`text-left py-2 hover:text-primary transition-colors ${hasNoPosts ? 'opacity-60' : ''}`}
                  >
                    {channel.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <CreatePost 
          userId={userId} 
          onPostCreated={fetchPosts}
          channelId={selectedChannel} 
        />
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
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PostsFeed;

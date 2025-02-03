import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface PostsFeedProps {
  userId: string;
}

const PostsFeed = ({ userId }: PostsFeedProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchPosts = async () => {
    try {
      console.log("Fetching posts...");
      const { data, error } = await supabase
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
      setIsRefreshing(false);
    }
  };

  const handlePostDeleted = (deletedPostId: number) => {
    setPosts(currentPosts => currentPosts.filter(post => post.id !== deletedPostId));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    // Add pull to refresh functionality
    let touchStart: number;
    let touchEnd: number;
    const threshold = 100; // minimum pull distance to trigger refresh

    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEnd = e.touches[0].clientY;
      const distance = touchEnd - touchStart;
      
      // Only allow pull to refresh when at the top of the page
      if (window.scrollY === 0 && distance > 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      const distance = touchEnd - touchStart;
      if (window.scrollY === 0 && distance > threshold) {
        await handleRefresh();
        toast({
          title: "Refreshed",
          description: "Feed updated with latest posts",
        });
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile]);

  if (loading) {
    return <div className="text-center p-4">Loading posts...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      {isRefreshing && (
        <div className="text-center py-2 text-sm text-gray-500">
          Refreshing...
        </div>
      )}
      <div className="space-y-6">
        <CreatePost userId={userId} onPostCreated={fetchPosts} />
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
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
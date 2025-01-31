import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";
import { useToast } from "@/hooks/use-toast";

interface PostsFeedProps {
  userId: string;
}

const PostsFeed = ({ userId }: PostsFeedProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
            profile:profile(name)
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
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading posts...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <header className="py-6 mb-6 text-center border-b">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
      </header>
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
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PostsFeed;
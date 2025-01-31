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
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profile:profiles(name, bio, profile_picture),
          likes:likes(count),
          comments:comments(
            id,
            content,
            created_at,
            profile:profiles(name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
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
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={userId}
            onLikeUpdate={fetchPosts}
          />
        ))}
      </div>
    </div>
  );
};

export default PostsFeed;
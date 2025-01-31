import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PostCardProps {
  post: {
    id: number;
    content: string;
    image_url?: string | null;
    user_id: string;
    created_at: string;
  };
  currentUserId: string;
  onLikeUpdate?: () => void;
}

const PostCard = ({ post, currentUserId, onLikeUpdate }: PostCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const { toast } = useToast();

  const handleLike = async () => {
    if (!currentUserId) return;
    setIsLiking(true);

    try {
      const { error } = await supabase
        .from("likes")
        .insert([{ post_id: post.id, user_id: currentUserId }]);

      if (error) throw error;
      if (onLikeUpdate) onLikeUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mb-4">
      <CardHeader>
        <p className="text-sm text-gray-500">
          {new Date(post.created_at).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        <p>{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post image"
            className="mt-4 rounded-lg max-h-96 object-cover"
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-2"
        >
          <ThumbsUp className="h-4 w-4" />
          Like
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
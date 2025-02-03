import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "./CommentSection";

const PASTEL_COLORS = [
  "bg-[#F2FCE2]", "bg-[#FEF7CD]", "bg-[#FEC6A1]", 
  "bg-[#E5DEFF]", "bg-[#FFDEE2]", "bg-[#FDE1D3]", 
  "bg-[#D3E4FD]"
];

interface PostCardProps {
  post: {
    id: number;
    content: string;
    image_url?: string | null;
    video_url?: string | null;
    created_at: string;
    profile: {
      name: string;
      bio: string | null;
      profile_picture: string | null;
    };
    likes: { count: number }[];
    comments: {
      id: number;
      content: string;
      created_at: string;
      profile: { 
        name: string;
        profile_picture: string | null;
      };
    }[];
  };
  currentUserId: string;
  onLikeUpdate?: () => void;
}

const PostCard = ({ post, currentUserId, onLikeUpdate }: PostCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkIfUserLiked = async () => {
      // Get the total likes count
      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id);

      if (!likesError) {
        setLocalLikesCount(likesData.length);
      }

      // Check if current user has liked
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", currentUserId)
        .single();

      if (!error && data) {
        setHasLiked(true);
      }
    };

    if (currentUserId) {
      checkIfUserLiked();
    }
  }, [post.id, currentUserId]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getBgColor = (name: string) => {
    const index = name.length % PASTEL_COLORS.length;
    return PASTEL_COLORS[index];
  };

  const handleLike = async () => {
    if (!currentUserId) return;
    if (isLiking) return;
    setIsLiking(true);

    try {
      if (!hasLiked) {
        const { error } = await supabase
          .from("likes")
          .insert([{ post_id: post.id, user_id: currentUserId }]);

        if (error) throw error;
        setHasLiked(true);
        setLocalLikesCount(prev => prev + 1);
      } else {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);

        if (error) throw error;
        setHasLiked(false);
        setLocalLikesCount(prev => prev - 1);
      }

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
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.profile.profile_picture || undefined} />
          <AvatarFallback className={`${getBgColor(post.profile.name)} text-gray-600`}>
            {getInitials(post.profile.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="font-medium text-gray-900">{post.profile.name}</p>
          {post.profile.bio && (
            <p className="text-sm text-gray-500">{post.profile.bio}</p>
          )}
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post image"
            className="rounded-lg w-full h-auto object-contain max-h-[500px]"
          />
        )}
        {post.video_url && (
          <video
            controls
            className="rounded-lg w-full h-auto object-contain max-h-[500px]"
          >
            <source src={post.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-2"
          >
            <Heart 
              className="h-4 w-4" 
              fill={hasLiked ? "#F47D57" : "none"} 
              stroke={hasLiked ? "#F47D57" : "currentColor"} 
            />
            <span>
              {localLikesCount > 0 
                ? `${localLikesCount} ${localLikesCount === 1 ? 'Like' : 'Likes'}` 
                : 'Like'}
            </span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>
              {post.comments.length > 0 
                ? `${post.comments.length} ${post.comments.length === 1 ? 'Comment' : 'Comments'}` 
                : 'Comment'}
            </span>
          </Button>
        </div>
        {showComments && (
          <CommentSection
            postId={post.id}
            currentUserId={currentUserId}
            comments={post.comments}
            onCommentAdded={onLikeUpdate}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
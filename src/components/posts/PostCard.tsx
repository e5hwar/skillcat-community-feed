import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "./CommentSection";
import UserAvatar from "../shared/UserAvatar";
import UserInfo from "../shared/UserInfo";
import DeleteButton from "../shared/DeleteButton";

interface PostCardProps {
  post: {
    id: number;
    content: string;
    image_url?: string | null;
    video_url?: string | null;
    created_at: string;
    user_id: string;
    channel_id?: number | null;
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
      user_id: string;
      profile: { 
        name: string;
        bio: string | null;
        profile_picture: string | null;
      };
    }[];
  };
  currentUserId: string;
  hideChannelTag?: boolean;
  onLikeUpdate?: () => void;
  onPostDeleted?: () => void;
}

const PostCard = ({ post, currentUserId, hideChannelTag = false, onLikeUpdate, onPostDeleted }: PostCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [channelName, setChannelName] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchChannel = async () => {
      if (post.channel_id) {
        const { data, error } = await supabase
          .from("channels")
          .select("name")
          .eq("id", post.channel_id)
          .single();
        
        if (!error && data) {
          setChannelName(data.name);
        }
      }
    };
    
    fetchChannel();
  }, [post.channel_id]);

  useEffect(() => {
    const checkIfUserLiked = async () => {
      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id);

      if (!likesError) {
        setLocalLikesCount(likesData.length);
      }

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

  const handleDeletePost = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;

      if (onPostDeleted) onPostDeleted();
      toast({
        title: "Success",
        description: "Post deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center gap-4">
        <UserAvatar
          profilePicture={post.profile.profile_picture}
          name={post.profile.name}
        />
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-start w-full">
            <UserInfo
              name={post.profile.name}
              bio={post.profile.bio}
              createdAt={formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            />
            {currentUserId === post.user_id && (
              <DeleteButton onDelete={handleDeletePost} type="post" />
            )}
          </div>
          {!hideChannelTag && channelName && (
            <Badge variant="secondary" className="mt-1 w-fit flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {channelName}
            </Badge>
          )}
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

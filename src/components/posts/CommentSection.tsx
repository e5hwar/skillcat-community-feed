import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import UserAvatar from "../shared/UserAvatar";
import Comment from "./Comment";

interface CommentSectionProps {
  postId: number;
  currentUserId: string;
  comments: {
    id: number;
    content: string;
    created_at: string;
    user_id: string;
    profile: {
      name: string;
      profile_picture: string | null;
      bio: string | null;
    };
  }[];
  onCommentAdded: () => void;
}

const COMMENTS_PER_PAGE = 4;
const LOAD_MORE_COUNT = 5;

const CommentSection = ({ postId, currentUserId, comments, onCommentAdded }: CommentSectionProps) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [visibleComments, setVisibleComments] = useState(COMMENTS_PER_PAGE);
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    name: string;
    profile_picture: string | null;
    bio: string | null;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('name, profile_picture, bio')
        .eq('id', currentUserId)
        .single();

      if (!error && data) {
        setCurrentUserProfile(data);
      }
    };

    if (currentUserId) {
      fetchCurrentUserProfile();
    }
  }, [currentUserId]);

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: postId,
            user_id: currentUserId,
            content: commentText.trim(),
          },
        ]);

      if (error) throw error;

      setCommentText("");
      setIsCommenting(false);
      onCommentAdded();
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      onCommentAdded();
      toast({
        title: "Success",
        description: "Comment deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Sort comments by recency
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-start gap-3 w-full">
        {currentUserProfile && (
          <UserAvatar
            profilePicture={currentUserProfile.profile_picture}
            name={currentUserProfile.name}
            size="sm"
          />
        )}
        <div className="flex-1">
          <Textarea
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              if (!isCommenting && e.target.value.trim()) {
                setIsCommenting(true);
              }
            }}
            className="min-h-[32px] w-full resize-none overflow-hidden p-3"
            style={{ 
              height: '32px',
              padding: '8px 16px',
              lineHeight: '16px'
            }}
          />
          {isCommenting && commentText.trim() && (
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCommenting(false);
                  setCommentText("");
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleComment}>
                Comment
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sortedComments.slice(0, visibleComments).map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onDelete={handleDeleteComment}
          />
        ))}
      </div>

      {sortedComments.length > visibleComments && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-gray-500"
          onClick={() => setVisibleComments((prev) => prev + LOAD_MORE_COUNT)}
        >
          Load more comments
        </Button>
      )}
    </div>
  );
};

export default CommentSection;
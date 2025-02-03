import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profile: {
    name: string;
    profile_picture: string | null;
  };
}

interface CommentSectionProps {
  postId: number;
  currentUserId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

const COMMENTS_PER_PAGE = 4;
const LOAD_MORE_COUNT = 5;

const CommentSection = ({ postId, currentUserId, comments, onCommentAdded }: CommentSectionProps) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [visibleComments, setVisibleComments] = useState(COMMENTS_PER_PAGE);
  const { toast } = useToast();

  // Sort comments by recency
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-start gap-3 w-full">
        <Avatar className="h-8 w-8">
          <AvatarImage src={undefined} />
          <AvatarFallback>{getInitials(comments[0]?.profile?.name || 'U')}</AvatarFallback>
        </Avatar>
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
            className="min-h-[40px] w-full resize-none overflow-hidden"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
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
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.profile.profile_picture || undefined} />
              <AvatarFallback>{getInitials(comment.profile.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="rounded-lg bg-gray-50 p-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{comment.profile.name}</p>
                    {currentUserId === comment.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Delete comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{comment.content}</p>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
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
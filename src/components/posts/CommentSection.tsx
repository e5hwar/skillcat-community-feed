import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MoreVertical, Trash } from "lucide-react";
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
    bio: string | null;
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
  const [currentUserProfile, setCurrentUserProfile] = useState<{ name: string; profile_picture: string | null; bio: string | null } | null>(null);
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getBgColor = (name: string) => {
    const index = name.length % 7;
    const PASTEL_COLORS = [
      "bg-[#F2FCE2]", "bg-[#FEF7CD]", "bg-[#FEC6A1]", 
      "bg-[#E5DEFF]", "bg-[#FFDEE2]", "bg-[#FDE1D3]", 
      "bg-[#D3E4FD]"
    ];
    return PASTEL_COLORS[index];
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-start gap-3 w-full">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentUserProfile?.profile_picture || undefined} />
          <AvatarFallback className={`${getBgColor(currentUserProfile?.name || '')} text-gray-600 text-xs font-bold`}>
            {currentUserProfile?.name ? getInitials(currentUserProfile.name) : ''}
          </AvatarFallback>
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
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.profile.profile_picture || undefined} />
              <AvatarFallback className={`${getBgColor(comment.profile.name)} text-gray-600 text-xs font-bold`}>
                {getInitials(comment.profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="rounded-lg bg-gray-50 p-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{comment.profile.name}</p>
                      {comment.profile.bio && (
                        <p className="text-xs text-gray-500">{comment.profile.bio}</p>
                      )}
                    </div>
                    {currentUserId === comment.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem
                            className="text-red-600 font-bold"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete comment
                            <span className="block text-xs font-normal text-red-500 mt-1">
                              This cannot be undone
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
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
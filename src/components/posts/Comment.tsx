import { formatDistanceToNow } from "date-fns";
import UserAvatar from "../shared/UserAvatar";
import UserInfo from "../shared/UserInfo";
import DeleteButton from "../shared/DeleteButton";

interface CommentProps {
  comment: {
    id: number;
    content: string;
    created_at: string;
    user_id: string;
    profile: {
      name: string;
      profile_picture: string | null;
      bio: string | null;
    };
  };
  currentUserId: string;
  onDelete: (commentId: number) => void;
}

const Comment = ({ comment, currentUserId, onDelete }: CommentProps) => {
  return (
    <div className="flex gap-3">
      <UserAvatar
        profilePicture={comment.profile.profile_picture}
        name={comment.profile.name}
        size="sm"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="rounded-lg bg-gray-50 p-3 flex-1">
            <div className="flex items-start justify-between">
              <UserInfo
                name={comment.profile.name}
                bio={comment.profile.bio}
                createdAt={formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                size="sm"
              />
              {currentUserId === comment.user_id && (
                <DeleteButton
                  onDelete={() => onDelete(comment.id)}
                  type="comment"
                />
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
import PostCard from "@/components/posts/PostCard";

interface PostsListProps {
  posts: any[];
  currentUserId: string;
  onLikeUpdate: () => void;
  onPostDeleted: (postId: number) => void;
  hideChannelTag?: boolean;
}

const PostsList = ({ 
  posts, 
  currentUserId, 
  onLikeUpdate, 
  onPostDeleted, 
  hideChannelTag 
}: PostsListProps) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onLikeUpdate={onLikeUpdate}
          onPostDeleted={() => onPostDeleted(post.id)}
          hideChannelTag={hideChannelTag}
        />
      ))}
    </div>
  );
};

export default PostsList;
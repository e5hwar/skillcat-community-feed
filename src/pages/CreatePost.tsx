
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CreatePost from "@/components/posts/CreatePost";
import AutoSignIn from "@/components/auth/AutoSignIn";
import UserAvatar from "@/components/shared/UserAvatar";
import UserInfo from "@/components/shared/UserInfo";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { channelId } = useParams();
  const [selectedChannel, setSelectedChannel] = useState<string>(channelId || "");
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const { data: channels } = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order('id', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;
      
      const { data } = await supabase
        .from("profile")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    if (channelId) {
      setSelectedChannel(channelId);
    }
  }, [channelId]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p>Loading...</p>
        </div>
        <AutoSignIn onSessionUpdate={setSession} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-8">
          {profile && (
            <div className="flex items-center gap-2">
              <UserAvatar
                profilePicture={profile.profile_picture}
                name={profile.name}
                size="sm"
              />
              <UserInfo 
                name={profile.name}
                bio={profile.bio}
                size="sm"
                createdAt=""
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-accent"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <CreatePost
          userId={session?.user?.id || ""}
          onPostCreated={() => navigate(-1)}
          channelId={selectedChannel ? parseInt(selectedChannel) : null}
          channels={channels || []}
        />
      </div>
    </div>
  );
};

export default CreatePostPage;

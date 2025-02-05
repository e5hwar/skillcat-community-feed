import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PostsFeed from "@/components/posts/PostsFeed";
import { useToast } from "@/hooks/use-toast";
import AutoSignIn from "@/components/auth/AutoSignIn";

const ChannelDetails = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState<string | null>("");
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchChannel = async () => {
      if (!channelId) return;
      
      const { data, error } = await supabase
        .from("channels")
        .select("name, description")
        .eq("id", parseInt(channelId))
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Channel not found",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setChannelName(data.name);
      setChannelDescription(data.description);
    };

    fetchChannel();
  }, [channelId, navigate, toast]);

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
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="px-2 sm:px-4 mb-6">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-3 h-20 w-20 p-0"
              onClick={() => navigate("/")}
            >
              <ChevronLeft className="h-20 w-20" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{channelName}</h1>
              {channelDescription && (
                <p className="text-sm text-muted-foreground mt-1">{channelDescription}</p>
              )}
            </div>
          </div>
        </div>
        {session && channelId && (
          <PostsFeed userId={session.user.id} defaultChannelId={parseInt(channelId)} />
        )}
      </div>
    </div>
  );
};

export default ChannelDetails;
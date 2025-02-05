import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PostsFeed from "@/components/posts/PostsFeed";
import { useToast } from "@/hooks/use-toast";

const ChannelDetails = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [channelName, setChannelName] = useState("");
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchChannel = async () => {
      if (!channelId) return;
      
      const { data, error } = await supabase
        .from("channels")
        .select("name")
        .eq("id", channelId)
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
    };

    fetchChannel();
  }, [channelId, navigate, toast]);

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="px-2 sm:px-4">
          <Button
            variant="ghost"
            className="mb-4 -ml-2 flex items-center gap-2"
            onClick={() => navigate("/")}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Community
          </Button>
          <h1 className="text-2xl font-bold mb-6">{channelName}</h1>
        </div>
        {session && channelId && (
          <PostsFeed userId={session.user.id} defaultChannelId={parseInt(channelId)} />
        )}
      </div>
    </div>
  );
};

export default ChannelDetails;
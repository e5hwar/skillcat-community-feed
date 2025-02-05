import { useState } from "react";
import { RefreshCw, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AutoSignIn from "@/components/auth/AutoSignIn";
import PostsFeed from "@/components/posts/PostsFeed";
import ChannelsCarousel from "@/components/channels/ChannelsCarousel";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["channels"] });
  };

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
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Community</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRefresh}
            className="hover:bg-gray-100"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">Channels</h2>
            <ChannelsCarousel />
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-4">All Posts</h2>
            <PostsFeed userId={session.user.id} />
          </section>
        </div>
      </div>
      <Button
        className="fixed bottom-6 right-6 rounded-full shadow-lg h-16 w-16 bg-[#01023B] hover:bg-[#01023B]/90"
        size="icon"
        onClick={() => navigate("/create-post")}
      >
        <Plus className="h-8 w-8 stroke-[3]" />
      </Button>
    </div>
  );
};

export default Index;
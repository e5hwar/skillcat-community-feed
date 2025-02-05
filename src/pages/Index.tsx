import { useState } from "react";
import AutoSignIn from "@/components/auth/AutoSignIn";
import PostsFeed from "@/components/posts/PostsFeed";
import ChannelsCarousel from "@/components/channels/ChannelsCarousel";

const Index = () => {
  const [session, setSession] = useState<any>(null);

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
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Channels</h2>
          <ChannelsCarousel />
        </div>
        <PostsFeed userId={session.user.id} />
      </div>
    </div>
  );
};

export default Index;
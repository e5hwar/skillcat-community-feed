import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AutoSignIn from "@/components/auth/AutoSignIn";
import PostsFeed from "@/components/feed/PostsFeed";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [urlParams, setUrlParams] = useState<{
    email: string | null;
    name: string | null;
    id: string | null;
  }>({ email: null, name: null, id: null });

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    setUrlParams({
      email: params.get('email'),
      name: params.get('name'),
      id: params.get('id')
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p>Loading...</p>
          <AutoSignIn 
            email={urlParams.email} 
            name={urlParams.name && decodeURIComponent(urlParams.name)} 
            moodleId={urlParams.id}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <PostsFeed userId={session.user.id} />
      </div>
    </div>
  );
};

export default Index;
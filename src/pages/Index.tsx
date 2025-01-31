import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthForm from "@/components/auth/AuthForm";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const autoSignIn = async (email: string, name: string, moodleId: string) => {
    try {
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: 'Community@123',
      });

      if (signInError) {
        // If sign in fails, try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: 'Community@123',
          options: {
            data: {
              moodle_id: moodleId,
            },
          },
        });

        if (signUpError) throw signUpError;

        // After signup, try to sign in again
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: 'Community@123',
        });

        if (error) throw error;
        
        // Create profile after successful signup
        const { error: profileError } = await supabase
          .from('profile')
          .insert([{ 
            id: data.user.id, 
            name: name, 
            email: email,
            moodle_id: parseInt(moodleId)
          }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      } else {
        // User exists, check if name needs to be updated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Update auth.users metadata if name is different
          const { error: updateAuthError } = await supabase.auth.updateUser({
            data: { moodle_id: moodleId }
          });

          if (updateAuthError) {
            console.error('Error updating auth user:', updateAuthError);
          }

          // Update profile if name is different
          const { error: updateProfileError } = await supabase
            .from('profile')
            .update({ 
              name: name,
              moodle_id: parseInt(moodleId)
            })
            .eq('id', user.id);

          if (updateProfileError) {
            console.error('Error updating profile:', updateProfileError);
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const name = urlParams.get('name');
    const id = urlParams.get('id');

    if (email && name && id) {
      autoSignIn(email, decodeURIComponent(name), id);
    }

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

  useEffect(() => {
    if (session) {
      fetchPosts();
    }
  }, [session]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-end mb-6">
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
        <CreatePost userId={session.user.id} onPostCreated={fetchPosts} />
        {loading ? (
          <div className="text-center">Loading posts...</div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={session.user.id}
                onLikeUpdate={fetchPosts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
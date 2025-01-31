import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AutoSignInProps {
  email: string | null;
  name: string | null;
  moodleId: string | null;
}

const AutoSignIn = ({ email, name, moodleId }: AutoSignInProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (email && name && moodleId) {
      handleAutoSignIn(email, name, moodleId);
    }
  }, [email, name, moodleId]);

  const handleAutoSignIn = async (email: string, name: string, moodleId: string) => {
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
          data: {
            name: name,
            moodle_id: moodleId,
          }
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
            data: { 
              name: name,
              moodle_id: moodleId 
            }
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

  return null;
};

export default AutoSignIn;
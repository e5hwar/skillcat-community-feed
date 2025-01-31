import { useState, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Image, Video } from "lucide-react";

interface CreatePostProps {
  userId: string;
  onPostCreated: () => void;
}

const CreatePost = ({ userId, onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      let videoUrl = null;

      if (selectedFile) {
        const url = await uploadFile(selectedFile);
        if (selectedFile.type.startsWith('image/')) {
          imageUrl = url;
        } else if (selectedFile.type.startsWith('video/')) {
          videoUrl = url;
        }
      }

      const { error } = await supabase
        .from("posts")
        .insert([{ 
          content, 
          user_id: userId,
          image_url: imageUrl,
          video_url: videoUrl
        }]);

      if (error) throw error;

      setContent("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onPostCreated();
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            className="hidden"
          />
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="h-5 w-5 mr-1" />
              Media
            </Button>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || (!content.trim() && !selectedFile)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePost;
import { useState, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Image, Video, Loader2, X, MoreVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import RichTextEditor from "@/components/ui/rich-text-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreatePostProps {
  userId: string;
  onPostCreated: () => void;
}

const CreatePost = ({ userId, onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Clean up previous preview URL when component unmounts
      return () => URL.revokeObjectURL(url);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Create a custom upload function that tracks progress
    const data = new FormData();
    data.append('file', file);

    const xhr = new XMLHttpRequest();
    
    await new Promise<string>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setUploadProgress(percent);
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, file);

          if (uploadError) reject(uploadError);
          
          const { data: { publicUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath);
            
          resolve(publicUrl);
        } else {
          reject(new Error('Upload failed'));
        }
      });

      // Start the upload
      xhr.open('POST', `${supabase.storage.from('posts').getPublicUrl(filePath).data.publicUrl}`);
      xhr.send(data);
    });

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    setIsSubmitting(true);
    setUploadProgress(0);
    
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
      setPreviewUrl(null);
      setUploadProgress(0);
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
        <CardContent className="pt-6 space-y-4">
          <RichTextEditor
            content={content}
            onChange={setContent}
            minHeight="64px"
            placeholder="What's on your mind?"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            className="hidden"
          />
          
          {previewUrl && selectedFile && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100 inline-block">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 bg-gray-500 hover:bg-gray-600"
                onClick={removeSelectedFile}
              >
                <X className="h-4 w-4" />
              </Button>
              {selectedFile.type.startsWith('image/') ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-auto h-auto object-contain"
                  style={{ maxHeight: '100px' }}
                />
              ) : (
                <video 
                  src={previewUrl} 
                  controls 
                  className="w-auto h-auto object-contain"
                  style={{ maxHeight: '100px' }}
                />
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50">
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
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
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePost;

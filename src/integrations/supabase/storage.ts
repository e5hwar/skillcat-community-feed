import { supabase } from "./client";

export const initializeStorage = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  
  if (!buckets?.find(bucket => bucket.name === 'posts')) {
    const { error } = await supabase.storage.createBucket('posts', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });
    
    if (error) {
      console.error('Error creating posts bucket:', error);
    }
  }
};
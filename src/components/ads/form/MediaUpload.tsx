import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface MediaUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function MediaUpload({ value, onChange }: MediaUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      // Create the bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage.createBucket('ad-images', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2 // 2MB
      });

      // Ignore error if bucket already exists
      if (bucketError && !bucketError.message.includes('already exists')) {
        throw bucketError;
      }

      const { error: uploadError, data } = await supabase.storage
        .from('ad-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormItem>
      <FormLabel>Image</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {value && (
            <img 
              src={value} 
              alt="Ad preview" 
              className="w-full max-w-xs rounded-md"
            />
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
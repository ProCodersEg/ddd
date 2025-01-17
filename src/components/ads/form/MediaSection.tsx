import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface MediaSectionProps {
  form: UseFormReturn<any>;
}

export function MediaSection({ form }: MediaSectionProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create the bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage.createBucket('ad-images', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('ad-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      I'll help break this down into manageable steps. Let's start with refactoring the AdForm and fixing the immediate issues with dates and image uploads.

<lov-code>
First, let's create smaller components for the AdForm and fix the storage and date issues:

1. Create components for form sections:

<lov-write file_path="src/components/ads/form/BasicInfoSection.tsx">
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select ad type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="banner">
                  <span className="text-blue-600">Banner</span>
                </SelectItem>
                <SelectItem value="interstitial">
                  <span className="text-purple-600">Interstitial</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Ad title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Ad description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
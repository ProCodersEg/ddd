import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Ad } from "@/types/ads";
import { MediaUpload } from "./form/MediaUpload";
import { CampaignSettings } from "./form/CampaignSettings";
import { AdTypeSelect } from "./form/AdTypeSelect";

interface AdFormProps {
  ad?: Ad;
  onSuccess: () => void;
}

export function AdForm({ ad, onSuccess }: AdFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      type: ad?.type || "banner",
      title: ad?.title || "",
      description: ad?.description || "",
      image_url: ad?.image_url || "",
      redirect_url: ad?.redirect_url || "",
      start_date: ad?.start_date || new Date().toISOString().slice(0, 16),
      status: ad?.status || "active",
      max_clicks: ad?.max_clicks || undefined,
      max_impressions: ad?.max_impressions || undefined,
      target_audience: ad?.target_audience || "All",
      frequency_cap: ad?.frequency_cap || 3,
      clicks: ad?.clicks || 0,
      impressions: ad?.impressions || 0,
    },
  });

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (ad) {
        const { error } = await supabase
          .from('ads')
          .update(values)
          .eq('id', ad.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ads')
          .insert([values]);
        if (error) throw error;
      }
      onSuccess();
      toast({
        title: "Success",
        description: ad ? "Ad updated successfully" : "Ad created successfully",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <AdTypeSelect value={field.value} onValueChange={field.onChange} />
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

          <FormField
            control={form.control}
            name="redirect_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Redirect URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <MediaUpload value={field.value} onChange={field.onChange} />
            )}
          />

          <CampaignSettings form={form} />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {ad ? 'Update Ad' : 'Create Ad'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
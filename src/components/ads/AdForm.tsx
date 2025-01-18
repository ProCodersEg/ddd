import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  image_url: z.string().url("Must be a valid URL"),
  redirect_url: z.string().url("Must be a valid URL").optional(),
  start_date: z.string().transform((val) => {
    if (!val) return new Date().toISOString(); // Default to current date if empty
    return new Date(val).toISOString(); // Convert to ISO string format
  }),
  max_clicks: z.number().optional(),
  clicks: z.number().optional(),
});

interface AdFormProps {
  ad?: any;
  onSuccess: () => void;
}

export function AdForm({ ad, onSuccess }: AdFormProps) {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      ...ad,
      start_date: ad?.start_date ? new Date(ad.start_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    } || {
      title: "",
      description: "",
      image_url: "",
      redirect_url: "",
      start_date: new Date().toISOString().slice(0, 16),
      max_clicks: undefined,
      clicks: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formattedValues = {
        ...values,
        start_date: new Date(values.start_date).toISOString(),
      };

      if (ad) {
        // Update existing ad
        const { error: updateError } = await supabase
          .from('ads')
          .update(formattedValues)
          .eq('id', ad.id);

        if (updateError) throw updateError;

        // Record update in history
        await supabase.from('ad_history').insert({
          ad_id: ad.id,
          action_type: 'updated',
          ad_name: values.title,
          ad_image: values.image_url,
          ad_description: values.description,
          clicks_count: values.clicks
        });
      } else {
        // Create new ad
        const { data: newAd, error: createError } = await supabase
          .from('ads')
          .insert(formattedValues)
          .select()
          .single();

        if (createError) throw createError;

        // Record creation in history
        if (newAd) {
          await supabase.from('ad_history').insert({
            ad_id: newAd.id,
            action_type: 'added',
            ad_name: values.title,
            ad_image: values.image_url,
            ad_description: values.description,
            clicks_count: 0
          });
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast({
        title: "Error",
        description: "Failed to save ad",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (ad) {
      form.reset({
        ...ad,
        start_date: ad.start_date ? new Date(ad.start_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      });
    }
  }, [ad, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <Input {...field} />
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
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <Input {...field} />
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
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <Input 
                type="datetime-local" 
                {...field} 
                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="max_clicks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Clicks</FormLabel>
              <Input 
                type="number" 
                placeholder="Unlimited if empty" 
                {...field} 
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clicks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Clicks</FormLabel>
              <Input 
                type="number" 
                {...field} 
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Ad</Button>
      </form>
    </Form>
  );
}
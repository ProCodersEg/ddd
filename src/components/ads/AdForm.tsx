import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { MediaUpload } from "./form/MediaUpload";
import { AdTypeSelect } from "./form/AdTypeSelect";

const formSchema = z.object({
  type: z.enum(['banner', 'interstitial']),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  image_url: z.string().url("Must be a valid URL"),
  redirect_url: z.string().url("Must be a valid URL").optional(),
  start_date: z.string().transform((val) => {
    if (!val) return new Date().toISOString();
    return new Date(val).toISOString();
  }),
  max_clicks: z.number().optional(),
  clicks: z.number().optional(),
  status: z.enum(['active', 'paused']),
});

interface AdFormProps {
  ad?: any;
  onSuccess: () => void;
}

export function AdForm({ ad, onSuccess }: AdFormProps) {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: ad ? {
      ...ad,
      start_date: ad.start_date ? new Date(ad.start_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    } : {
      type: 'banner',
      title: "",
      description: "",
      image_url: "",
      redirect_url: "",
      start_date: new Date().toISOString().slice(0, 16),
      max_clicks: undefined,
      clicks: 0,
      status: 'active',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formattedValues = {
        ...values,
        start_date: new Date(values.start_date).toISOString(),
      };

      if (ad) {
        const { error: updateError } = await supabase
          .from('ads')
          .update(formattedValues)
          .eq('id', ad.id);

        if (updateError) throw updateError;

        await supabase.from('ad_history').insert({
          ad_id: ad.id,
          action_type: 'updated',
          ad_name: values.title,
          ad_image: values.image_url,
          ad_description: values.description,
          clicks_count: values.clicks
        });
      } else {
        const { data: newAd, error: createError } = await supabase
          .from('ads')
          .insert(formattedValues)
          .select()
          .single();

        if (createError) throw createError;

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
          name="type"
          render={({ field }) => (
            <AdTypeSelect value={field.value} onValueChange={field.onChange} />
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {field.value === 'active' ? 'Active' : 'Paused'}
                </FormLabel>
              </div>
              <Switch
                checked={field.value === 'active'}
                onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'paused')}
              />
            </FormItem>
          )}
        />

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
            <MediaUpload value={field.value} onChange={field.onChange} />
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
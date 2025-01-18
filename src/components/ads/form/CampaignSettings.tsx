import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface CampaignSettingsProps {
  form: UseFormReturn<any>;
}

export function CampaignSettings({ form }: CampaignSettingsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="start_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Campaign Start Date</FormLabel>
            <FormControl>
              <Input type="datetime-local" {...field} className="w-full" />
            </FormControl>
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
            <FormControl>
              <Input type="number" placeholder="Unlimited if empty" {...field} className="w-full" />
            </FormControl>
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
            <FormControl>
              <Input type="number" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdTypeSelectProps {
  value: string;
  onValueChange: (value: string) => void;, onValueChange }: AdTypeSelectProps) {
  return (
    <FormItem>
      <FormLabel>Type</FormLabel>
      <Select onValueChange={onValueChange} defaultValue={value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select ad type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="banner">
            <span className="text-green-500 font-medium">Banner</span>
          </SelectItem>
          <SelectItem value="interstitial">
            <span className="text-blue-500 font-medium">Interstitial</span>
          </SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
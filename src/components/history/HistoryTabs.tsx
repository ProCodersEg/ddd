import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoryList } from "./HistoryList";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function HistoryTabs() {
  const [currentTab, setCurrentTab] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleClearHistory = async () => {
    const confirmed = window.confirm("Are you sure you want to clear all history?");
    if (!confirmed) return;

    try {
      // Delete all records without the placeholder condition
      const { error } = await supabase
        .from('ad_history')
        .delete()
        .not('id', 'is', null); // This will delete all records that have an id

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['adHistory'] });
      
      toast({
        title: "Success",
        description: "History cleared successfully",
      });
    } catch (error: any) {
      console.error('Error clearing history:', error);
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Ad History</h2>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearHistory}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear History
        </Button>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="added">Added</TabsTrigger>
          <TabsTrigger value="updated">Updated</TabsTrigger>
          <TabsTrigger value="deleted">Deleted</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <HistoryList filter="all" />
        </TabsContent>
        
        <TabsContent value="added">
          <HistoryList filter="added" />
        </TabsContent>
        
        <TabsContent value="updated">
          <HistoryList filter="updated" />
        </TabsContent>
        
        <TabsContent value="deleted">
          <HistoryList filter="deleted" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
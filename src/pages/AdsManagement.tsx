import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdsTable } from "@/components/ads/AdsTable";
import { AdForm } from "@/components/ads/AdForm";
import { HistoryTabs } from "@/components/history/HistoryTabs";
import { supabase } from "@/lib/supabase";
import { Ad } from "@/types/ads";

export default function AdsManagement() {
  const [activeTab, setActiveTab] = useState("manage");

  const { data: ads, refetch } = useQuery({
    queryKey: ['ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Ad[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ads Management</h1>
        <p className="text-muted-foreground">
          Create and manage your advertising campaigns
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manage">Manage Ads</TabsTrigger>
          <TabsTrigger value="create">Create Ad</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          {ads && <AdsTable ads={ads} onUpdate={refetch} />}
        </TabsContent>

        <TabsContent value="create">
          <AdForm
            onSuccess={() => {
              refetch();
              setActiveTab("manage");
            }}
          />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTabs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
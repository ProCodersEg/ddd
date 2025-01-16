import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdForm } from "@/components/ads/AdForm";
import { AdsTable } from "@/components/ads/AdsTable";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Ad } from "@/types/ads";

export default function AdsManagement() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const { data: ads, isLoading, refetch } = useQuery({
    queryKey: ['ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Error fetching ads",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      return data as Ad[];
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ad Management</h1>
        <Sheet open={isCreating} onOpenChange={setIsCreating}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Ad
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Create New Ad</SheetTitle>
            </SheetHeader>
            <AdForm 
              onSuccess={() => {
                setIsCreating(false);
                refetch();
                toast({
                  title: "Success",
                  description: "Ad created successfully",
                });
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading ads...</p>
        </div>
      ) : (
        <AdsTable ads={ads || []} onUpdate={refetch} />
      )}
    </div>
  );
}
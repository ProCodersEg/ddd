import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pause, Play, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdForm } from "@/components/ads/AdForm";
import { AdsTable } from "@/components/ads/AdsTable";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Ad } from "@/types/ads";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdsManagement() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleBulkAction = async (action: 'pause' | 'activate' | 'delete') => {
    if (!ads?.length) return;
    
    setIsProcessing(true);
    try {
      if (action === 'delete') {
        // Delete all ads without using neq.0
        const { error } = await supabase
          .from('ads')
          .delete()
          .in('id', ads.map(ad => ad.id)); // Delete using the actual ad IDs
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "All ads have been deleted",
        });
      } else {
        const { error } = await supabase
          .from('ads')
          .update({ 
            status: action === 'pause' ? 'paused' : 'active',
            pause_reason: action === 'pause' ? 'manual' : null
          })
          .in('id', ads.map(ad => ad.id)); // Update using the actual ad IDs
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `All ads have been ${action === 'pause' ? 'paused' : 'activated'}`,
        });
      }
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
      <div className="flex flex-col gap-6 bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Ad Management</h1>
          <div className="flex flex-wrap gap-2">
            <Sheet open={isCreating} onOpenChange={setIsCreating}>
              <SheetTrigger asChild>
                <Button className="shadow-sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Ad
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-[540px] p-0">
                <ScrollArea className="h-full">
                  <div className="p-6">
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
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => handleBulkAction('pause')}
            disabled={isProcessing || !ads?.length}
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause All
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkAction('activate')}
            disabled={isProcessing || !ads?.length}
          >
            <Play className="mr-2 h-4 w-4" />
            Activate All
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isProcessing || !ads?.length}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your ads.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading ads...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <AdsTable ads={ads || []} onUpdate={refetch} />
          </div>
        )}
      </div>
    </div>
  );
}
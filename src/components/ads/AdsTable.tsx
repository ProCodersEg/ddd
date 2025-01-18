import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdForm } from "./AdForm";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Ad } from "@/types/ads";
import { checkAndUpdateAdStatus } from "@/lib/api/ads";
import { AdStatusBadge } from "./table/AdStatusBadge";
import { AdLimitsDisplay } from "./table/AdLimitsDisplay";
import { AdActions } from "./table/AdActions";

interface AdsTableProps {
  ads: Ad[];
  onUpdate: () => void;
}

export function AdsTable({ ads, onUpdate }: AdsTableProps) {
  const { toast } = useToast();
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkLimitsAndStatus = async () => {
      try {
        await Promise.all(ads.map(async (ad) => {
          if (ad.status === 'paused') {
            const shouldReactivate = (
              (!ad.max_clicks || ad.clicks < ad.max_clicks) &&
              ad.pause_reason === 'limits'
            );
            
            if (shouldReactivate) {
              const { error } = await supabase
                .from('ads')
                .update({ 
                  status: 'active',
                  pause_reason: null
                })
                .eq('id', ad.id);
                
              if (error) {
                console.error('Error reactivating ad:', error);
              } else {
                onUpdate();
              }
            }
          } else if (ad.status === 'active') {
            await checkAndUpdateAdStatus(ad);
          }
        }));
      } catch (error) {
        console.error('Error checking ad limits:', error);
      }
    };

    checkLimitsAndStatus();
  }, [ads, onUpdate]);

  const createHistoryEntry = async (adId: string, actionType: 'added' | 'updated' | 'deleted') => {
    try {
      // Get the ad details
      const { data: ad, error: fetchError } = await supabase
        .from('ads')
        .select('title, image_url, description, clicks')
        .eq('id', adId)
        .single();

      if (fetchError) {
        console.error('Error fetching ad details for history:', fetchError);
        throw fetchError;
      }

      if (!ad) {
        throw new Error("Ad not found");
      }

      console.log(`Creating history entry for ${actionType} action on ad:`, adId);

      const { error: historyError } = await supabase
        .from('ad_history')
        .insert({
          ad_id: adId,
          action_type: actionType,
          ad_name: ad.title,
          ad_image: ad.image_url,
          ad_description: ad.description,
          clicks_count: ad.clicks
        });

      if (historyError) {
        console.error('Error creating history entry:', historyError);
        throw historyError;
      }

      console.log('History entry created successfully');
    } catch (error) {
      console.error('Error in createHistoryEntry:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this ad?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // First create history entry
      await createHistoryEntry(id, 'deleted');
      console.log('History entry created successfully');

      // Then delete the ad
      const { error: deleteError } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting ad:', deleteError);
        throw deleteError;
      }

      console.log('Ad deleted successfully');
      
      // Finally show success message and update UI
      toast({
        title: "Success",
        description: "Ad deleted successfully",
      });
      onUpdate();
    } catch (error: any) {
      console.error("Delete operation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete ad",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'banner' ? 'text-green-500' : 'text-blue-500';
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell>
                <img 
                  src={ad.image_url} 
                  alt={ad.title} 
                  className="w-16 h-16 object-cover rounded-md"
                />
              </TableCell>
              <TableCell className="font-medium">{ad.title}</TableCell>
              <TableCell>
                <span className={`font-medium ${getTypeColor(ad.type)}`}>
                  {ad.type}
                </span>
              </TableCell>
              <TableCell>
                <AdStatusBadge status={ad.status} />
              </TableCell>
              <TableCell>
                {new Date(ad.start_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <AdLimitsDisplay ad={ad} />
              </TableCell>
              <TableCell className="text-right">
                <AdActions
                  ad={ad}
                  onEdit={setEditingAd}
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={!!editingAd} onOpenChange={() => setEditingAd(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Edit Ad</SheetTitle>
          </SheetHeader>
          {editingAd && (
            <AdForm
              ad={editingAd}
              onSuccess={async () => {
                await createHistoryEntry(editingAd.id, 'updated');
                setEditingAd(null);
                onUpdate();
                toast({
                  title: "Success",
                  description: "Ad updated successfully",
                });
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
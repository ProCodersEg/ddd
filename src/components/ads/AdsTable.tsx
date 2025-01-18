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
          // Only check for reactivation if the ad was paused due to limits
          if (ad.status === 'paused') {
            const shouldReactivate = (
              (!ad.max_clicks || ad.clicks < ad.max_clicks) &&
              ad.pause_reason === 'limits' // Only reactivate if paused due to limits
            );
            
            if (shouldReactivate) {
              const { error } = await supabase
                .from('ads')
                .update({ 
                  status: 'active',
                  pause_reason: null // Clear the pause reason
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

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this ad?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // First, get the ad details before deletion
      const { data: adToDelete } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single();

      if (adToDelete) {
        // Create history entry
        await supabase.from('ad_history').insert({
          ad_id: id,
          action_type: 'deleted',
          ad_name: adToDelete.title,
          ad_image: adToDelete.image_url,
          ad_description: adToDelete.description,
          clicks_count: adToDelete.clicks
        });

        // Delete the ad
        const { error: deleteError } = await supabase
          .from('ads')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        toast({
          title: "Success",
          description: "Ad deleted successfully",
        });
        onUpdate();
      }
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
              onSuccess={() => {
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

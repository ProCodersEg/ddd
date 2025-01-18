import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { AdForm } from "./AdForm";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Ad } from "@/types/ads";
import { checkAndUpdateAdStatus } from "@/lib/api/ads";

interface AdsTableProps {
  ads: Ad[];
  onUpdate: () => void;
}

export function AdsTable({ ads, onUpdate }: AdsTableProps) {
  const { toast } = useToast();
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check limits and update status for all ads
  useEffect(() => {
    const checkLimits = async () => {
      try {
        await Promise.all(ads.map(ad => checkAndUpdateAdStatus(ad)));
        onUpdate(); // Refresh the table after checking limits
      } catch (error) {
        console.error('Error checking ad limits:', error);
      }
    };

    checkLimits();
  }, [ads, onUpdate]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this ad?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // First, get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Failed to get session");
      }

      if (!session) {
        throw new Error("No active session found");
      }

      // Perform the delete operation with the current session
      const { error: deleteError } = await supabase
        .from('ads')
        .delete()
        .eq('id', id)
        .single();

      if (deleteError) {
        console.error("Delete error:", deleteError);
        throw deleteError;
      }

      toast({
        title: "Success",
        description: "Ad deleted successfully",
      });
      onUpdate();
    } catch (error: any) {
      console.error("Delete operation failed:", error);
      
      let errorMessage = "Failed to delete ad. Please try again.";
      if (error.message.includes("No active session")) {
        errorMessage = "Please log in again to delete ads.";
      } else if (error.message.includes("permission")) {
        errorMessage = "You don't have permission to delete this ad.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'banner' ? 'text-green-500' : 'text-blue-500';
  };

  const getLimitStatus = (ad: Ad) => {
    const clicksLimit = ad.max_clicks ? `${ad.clicks}/${ad.max_clicks}` : `${ad.clicks}/∞`;
    const impressionsLimit = ad.max_impressions ? `${ad.impressions}/${ad.max_impressions}` : `${ad.impressions}/∞`;
    
    const isClicksLimitReached = ad.max_clicks && ad.clicks >= ad.max_clicks;
    const isImpressionsLimitReached = ad.max_impressions && ad.impressions >= ad.max_impressions;
    
    return (
      <div className="text-sm">
        <p className={isClicksLimitReached ? "text-red-500 font-medium" : ""}>
          Clicks: {clicksLimit}
        </p>
        <p className={isImpressionsLimitReached ? "text-red-500 font-medium" : ""}>
          Impressions: {impressionsLimit}
        </p>
      </div>
    );
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
                <span className={`px-2 py-1 rounded-full text-sm ${
                  ad.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {ad.status}
                </span>
              </TableCell>
              <TableCell>
                {new Date(ad.start_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {getLimitStatus(ad)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingAd(ad)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(ad.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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

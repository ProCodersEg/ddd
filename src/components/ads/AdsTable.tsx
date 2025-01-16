import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { AdForm } from "./AdForm";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Ad } from "@/types/ads";

interface AdsTableProps {
  ads: Ad[];
  onUpdate: () => void;
}

export function AdsTable({ ads, onUpdate }: AdsTableProps) {
  const { toast } = useToast();
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this ad?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Ad deleted successfully",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
            <TableHead>Campaign Period</TableHead>
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
              <TableCell>{ad.type}</TableCell>
              <TableCell>{ad.status}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>Start: {new Date(ad.start_date).toLocaleDateString()}</p>
                  <p>End: {new Date(ad.end_date).toLocaleDateString()}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>Clicks: {ad.clicks} / {ad.max_clicks || '∞'}</p>
                  <p>Impressions: {ad.impressions} / {ad.max_impressions || '∞'}</p>
                </div>
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
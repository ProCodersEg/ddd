import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Ad } from "@/types/ads";

interface AdActionsProps {
  ad: Ad;
  onEdit: (ad: Ad) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function AdActions({ ad, onEdit, onDelete, isDeleting }: AdActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onEdit(ad)}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDelete(ad.id)}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
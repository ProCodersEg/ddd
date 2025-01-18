import { AdHistory } from "@/types/history";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface HistoryItemProps {
  item: AdHistory;
}

export function HistoryItem({ item }: HistoryItemProps) {
  const getActionColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200';
      case 'updated':
        return 'bg-blue-50 border-blue-200';
      case 'deleted':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getActionTextColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'text-green-700';
      case 'updated':
        return 'text-blue-700';
      case 'deleted':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border",
      getActionColor(item.action_type)
    )}>
      <div className="flex items-start gap-4">
        <img
          src={item.ad_image || '/placeholder.svg'}
          alt={item.ad_title}
          className="w-20 h-20 object-cover rounded-md"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium truncate">{item.ad_title}</h3>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              getActionTextColor(item.action_type)
            )}>
              {item.action_type}
            </span>
          </div>
          
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {item.ad_description}
          </p>
          
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{format(new Date(item.created_at), 'PPp')}</span>
            <span>•</span>
            <span>{item.clicks} clicks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
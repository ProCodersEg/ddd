import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AdHistoryEntry {
  id: string;
  ad_id: string;
  action_type: 'added' | 'deleted' | 'updated';
  ad_name: string;
  ad_image: string;
  ad_description: string;
  clicks_count: number;
  created_at: string;
}

export function AdHistory() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['adHistory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ad history:', error);
        throw error;
      }
      return data as AdHistoryEntry[];
    },
  });

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'added':
        return 'bg-green-100 text-green-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ad History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ad History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {history?.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <img
                  src={entry.ad_image}
                  alt={entry.ad_name}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {entry.ad_name}
                    </p>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(
                        entry.action_type
                      )}`}
                    >
                      {entry.action_type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {entry.ad_description}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span>Final clicks count: {entry.clicks_count}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
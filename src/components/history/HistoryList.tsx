import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { AdHistory } from "@/types/history";
import { HistoryItem } from "./HistoryItem";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface HistoryListProps {
  filter: 'all' | 'added' | 'updated' | 'deleted';
}

const ITEMS_PER_PAGE = 10;

export function HistoryList({ filter }: HistoryListProps) {
  const [page, setPage] = useState(1);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['adHistory', filter, page],
    queryFn: async () => {
      let query = supabase
        .from('ad_history')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (filter !== 'all') {
        query = query.eq('action_type', filter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        items: data as AdHistory[],
        total: count || 0
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse text-lg text-muted-foreground">
          Loading history...
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((historyData?.total || 0) / ITEMS_PER_PAGE);

  const handlePrevious = () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(p => p + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {historyData?.items.map((item) => (
          <HistoryItem key={item.id} item={item} />
        ))}
        
        {historyData?.items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No history found
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePrevious}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => setPage(pageNum)}
                  isActive={page === pageNum}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={handleNext}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
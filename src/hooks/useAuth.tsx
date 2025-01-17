import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: getCurrentUser,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
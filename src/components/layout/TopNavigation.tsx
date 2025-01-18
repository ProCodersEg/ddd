import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Home, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  ad_id: string;
  ad_title: string;
  ad_image: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function TopNavigation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 1000, // Poll every second as backup
  });

  // Set up real-time subscription for notifications
  useEffect(() => {
    const channel = supabase.channel('notifications-changes');
    
    const subscription = channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        async (payload) => {
          console.log('Real-time notification update:', payload);
          
          // Immediately fetch fresh notifications
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (!error && data) {
            // Update cache immediately
            queryClient.setQueryData(['notifications'], data);
          }
          
          // Also invalidate to trigger a background refresh
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="h-16 flex items-center justify-between px-4">
      <div className="flex items-center space-x-6">
        <Link 
          to="/" 
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary flex items-center",
            "text-muted-foreground px-4 py-2 rounded-md bg-accent/50 hover:bg-accent"
          )}
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Link>
        <Link 
          to="/ads" 
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary flex items-center",
            "text-muted-foreground px-4 py-2 rounded-md bg-accent/50 hover:bg-accent"
          )}
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Ads
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu onOpenChange={() => unreadCount > 0 && markAllAsReadMutation.mutate()}>
          <DropdownMenuTrigger className="relative">
            <div className="p-2 rounded-md hover:bg-accent/80 transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            {notifications?.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/80"
                onClick={() => markAsReadMutation.mutate(notification.id)}
              >
                <img
                  src={notification.ad_image}
                  alt={notification.ad_title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.ad_title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                )}
              </DropdownMenuItem>
            ))}
            {(!notifications || notifications.length === 0) && (
              <DropdownMenuItem disabled className="text-center text-muted-foreground">
                No notifications
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-4"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  );
}
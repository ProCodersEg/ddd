import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

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
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  };

  return (
    <nav className="h-16 flex items-center justify-between px-2">
      <div className="flex items-center space-x-6">
        <Link 
          to="/" 
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            "text-muted-foreground px-2 py-1.5 rounded-md hover:bg-accent"
          )}
        >
          Home
        </Link>
        <Link 
          to="/ads" 
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            "text-muted-foreground px-2 py-1.5 rounded-md hover:bg-accent"
          )}
        >
          Ads
        </Link>
        <Link 
          to="/analytics" 
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            "text-muted-foreground px-2 py-1.5 rounded-md hover:bg-accent"
          )}
        >
          Analytics
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="relative">
            <div className="p-2 rounded-md hover:bg-accent transition-colors">
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
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
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
        <div className="relative">
          <Link 
            to="/profile" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              "text-muted-foreground px-2 py-1.5 rounded-md hover:bg-accent"
            )}
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
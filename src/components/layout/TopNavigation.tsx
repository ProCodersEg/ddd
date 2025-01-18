import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, LayoutDashboard, ImageIcon, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const location = useLocation();
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="flex justify-center w-full bg-white border-b">
      <nav className="container h-16 flex items-center px-6 justify-between">
        <div className="flex items-center space-x-2">
          <Link 
            to="/dashboard" 
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 transition-colors",
              "bg-gradient-to-r hover:from-blue-50 hover:to-blue-100",
              location.pathname === '/dashboard' && "text-blue-600 font-medium bg-blue-50"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link 
            to="/ads" 
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 transition-colors",
              "bg-gradient-to-r hover:from-blue-50 hover:to-blue-100",
              location.pathname === '/ads' && "text-blue-600 font-medium bg-blue-50"
            )}
          >
            <ImageIcon className="w-4 h-4" />
            Ads
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative">
              <Bell className="h-5 w-5 text-gray-600 hover:text-gray-900 transition-colors" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
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
                    <p className="text-sm text-gray-500">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                  )}
                </DropdownMenuItem>
              ))}
              {(!notifications || notifications.length === 0) && (
                <DropdownMenuItem disabled>
                  No notifications
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg bg-gradient-to-r hover:from-red-50 hover:to-red-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </nav>
    </div>
  );
}
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, ImageIcon, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "@/lib/auth";

export function TopNavigation() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="border-b bg-gradient-to-r from-background/95 to-muted/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Ad Management
          </h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium hover:bg-accent/50 transition-colors"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium hover:bg-accent/50 transition-colors"
              onClick={() => navigate("/ads")}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Ads
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-accent/50"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
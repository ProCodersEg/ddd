import { TopNavigation } from "./TopNavigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/50">
      <div className="w-full border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <TopNavigation />
        </div>
      </div>
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-xl bg-card/50 shadow-sm border backdrop-blur-sm p-6 sm:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
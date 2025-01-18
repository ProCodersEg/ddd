import { TopNavigation } from "./TopNavigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/50">
      <TopNavigation />
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-xl bg-card/50 shadow-sm border backdrop-blur-sm p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
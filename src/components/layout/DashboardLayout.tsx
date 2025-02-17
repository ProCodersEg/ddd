import { TopNavigation } from "./TopNavigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="w-full border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl">
          <TopNavigation />
        </div>
      </div>
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="rounded-xl bg-white shadow-md border backdrop-blur-sm p-6 sm:p-8 transition-all duration-200 hover:shadow-lg">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
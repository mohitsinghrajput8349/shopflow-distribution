import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileHeader from "@/components/MobileHeader";

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-screen w-full">
          {/* Mobile header */}
          <MobileHeader />
          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
          {/* Mobile bottom nav */}
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}

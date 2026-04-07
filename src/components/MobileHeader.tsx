import { useAuth } from "@/contexts/AuthContext";
import { Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileHeader() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-tight">FMCG Dist.</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">{isAdmin ? "Admin" : user?.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={logout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

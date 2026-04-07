import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLocation, Link } from "react-router-dom";
import { Package, LayoutDashboard, ShoppingCart, ClipboardList, Users, BarChart3, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MobileBottomNav() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { to: "/", label: "Home", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: Package },
    { to: "/orders", label: "Orders", icon: ClipboardList },
    { to: "/shop-owners", label: "Shops", icon: Users },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const shopLinks = [
    { to: "/", label: "Browse", icon: Store },
    { to: "/cart", label: "Cart", icon: ShoppingCart, badge: true },
    { to: "/orders", label: "Orders", icon: ClipboardList },
  ];

  const links = isAdmin ? adminLinks : shopLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {links.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <link.icon className="h-5 w-5" />
                {'badge' in link && link.badge && <MobileCartBadge />}
              </div>
              <span className="text-[10px] font-medium leading-tight">{link.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MobileCartBadge() {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1">
      {totalItems}
    </span>
  );
}

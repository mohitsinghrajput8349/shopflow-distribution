import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
} from "@/components/ui/sidebar";
import { Package, LayoutDashboard, ShoppingCart, ClipboardList, Users, BarChart3, LogOut, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AppSidebar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: Package },
    { to: "/orders", label: "Orders", icon: ClipboardList },
    { to: "/shop-owners", label: "Shop Owners", icon: Users },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const shopLinks = [
    { to: "/", label: "Browse Products", icon: Store },
    { to: "/cart", label: "Cart", icon: ShoppingCart, badge: true },
    { to: "/orders", label: "My Orders", icon: ClipboardList },
  ];

  const links = isAdmin ? adminLinks : shopLinks;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-sidebar-foreground">FMCG Dist.</h2>
            <p className="text-xs text-sidebar-foreground/60">{isAdmin ? "Admin Panel" : "Shop Portal"}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map(link => (
                <SidebarMenuItem key={link.to}>
                  <SidebarMenuButton asChild isActive={location.pathname === link.to}>
                    <Link to={link.to} className="flex items-center gap-3">
                      <link.icon className="h-4 w-4" />
                      <span>{link.label}</span>
                      {link.badge && <CartBadge />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-3">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
          <p className="text-xs text-sidebar-foreground/60">{user?.email}</p>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function CartBadge() {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;
  return <Badge className="ml-auto bg-accent text-accent-foreground text-xs h-5 min-w-5 flex items-center justify-center">{totalItems}</Badge>;
}

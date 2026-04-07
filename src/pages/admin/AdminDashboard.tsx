import { useQuery } from "@tanstack/react-query";
import { analyticsApi, ordersApi, productsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

export default function AdminDashboard() {
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: productsApi.getAll });
  const { data: orders } = useQuery({ queryKey: ["orders"], queryFn: ordersApi.getAll });
  const { data: analytics } = useQuery({ queryKey: ["analytics"], queryFn: analyticsApi.getSales });

  const stats = [
    { label: "Total Products", value: products?.length ?? 0, icon: Package, color: "text-primary" },
    { label: "Total Orders", value: orders?.length ?? 0, icon: ShoppingCart, color: "text-accent" },
    { label: "Total Revenue", value: `₹${analytics?.total_sales?.toLocaleString() ?? 0}`, icon: TrendingUp, color: "text-success" },
    { label: "Pending Orders", value: analytics?.pending_orders ?? 0, icon: Users, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders && orders.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.shopOwnerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{order.totalAmount}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-warning/10 text-warning",
    CONFIRMED: "bg-primary/10 text-primary",
    DELIVERED: "bg-success/10 text-success",
    CANCELLED: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

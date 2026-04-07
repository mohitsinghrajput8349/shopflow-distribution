import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const statuses = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({ queryKey: ["orders"], queryFn: ordersApi.getAll });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["orders"] }); toast.success("Status updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{isAdmin ? "All Orders" : "My Orders"}</h1>
        <p className="text-muted-foreground">{orders?.length ?? 0} orders</p>
      </div>

      {orders?.length === 0 ? (
        <Card className="shadow-card"><CardContent className="flex flex-col items-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No orders yet</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {orders?.map(order => (
            <Card key={order.id} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base">Order #{order.id}</CardTitle>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    {isAdmin && (
                      <Select value={order.status} onValueChange={v => statusMutation.mutate({ id: order.id, status: v })}>
                        <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shop: {order.shopOwnerName}</span>
                  <span className="text-muted-foreground">Payment: {order.paymentMethod}</span>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2 font-medium text-muted-foreground">Product</th>
                        <th className="text-center p-2 font-medium text-muted-foreground">Qty</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Price</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map(item => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2 text-foreground">{item.productName}</td>
                          <td className="p-2 text-center text-foreground">{item.quantity}</td>
                          <td className="p-2 text-right text-foreground">₹{item.price}</td>
                          <td className="p-2 text-right font-medium text-foreground">₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="text-lg font-bold text-foreground">₹{order.totalAmount}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || ""}`}>{status}</span>;
}

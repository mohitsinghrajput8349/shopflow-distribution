import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: analyticsApi.getSales });

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Sales and performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sales" value={`₹${data?.total_sales?.toLocaleString() ?? 0}`} />
        <StatCard label="Paid Amount" value={`₹${data?.paid_amount?.toLocaleString() ?? 0}`} />
        <StatCard label="Pending Amount" value={`₹${data?.pending_amount?.toLocaleString() ?? 0}`} />
        <StatCard label="Delivered Orders" value={data?.delivered_orders ?? 0} />
      </div>

      {data?.top_products && data.top_products.length > 0 && (
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Top Products</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.top_products.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs text-primary-foreground font-bold">{i + 1}</span>
                    <span className="font-medium text-foreground">{p.product_name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{p.revenue?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{p.quantity} units</p>
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

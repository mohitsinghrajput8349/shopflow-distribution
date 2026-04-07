import { useQuery } from "@tanstack/react-query";
import { shopOwnersApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ShopOwnersPage() {
  const { data: owners, isLoading } = useQuery({ queryKey: ["shop-owners"], queryFn: shopOwnersApi.getAll });

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Shop Owners</h1>
        <p className="text-muted-foreground">{owners?.length ?? 0} registered shops</p>
      </div>

      {owners?.length === 0 ? (
        <Card className="shadow-card"><CardContent className="flex flex-col items-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No shop owners yet</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {owners?.map(o => (
            <Card key={o.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {o.name?.charAt(0)?.toUpperCase() ?? "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{o.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{o.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{o.phone}</p>
                    <p className="text-xs text-muted-foreground">Credit: {o.creditPeriodDays} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

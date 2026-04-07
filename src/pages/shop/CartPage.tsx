import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { ordersApi, type OrderItemRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const orderItems: OrderItemRequest[] = items.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        total: i.product.price * i.quantity,
      }));
      await ordersApi.create({ items: orderItems, paymentMethod });
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Cart</h1>
        <Card className="shadow-card"><CardContent className="flex flex-col items-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">Your cart is empty</p>
          <p className="text-muted-foreground mb-4">Browse products to add items</p>
          <Button onClick={() => navigate("/")}>Browse Products</Button>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <Card key={item.product.id} className="shadow-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center justify-between sm:flex-1 sm:min-w-0">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{item.product.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">₹{item.product.price} each</p>
                    </div>
                    <p className="font-bold text-foreground sm:hidden">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-bold text-foreground hidden sm:block min-w-[80px] text-right">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card h-fit">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {items.map(i => (
                <div key={i.product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i.product.name} × {i.quantity}</span>
                  <span className="text-foreground">₹{(i.product.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-foreground">
              <span>Total</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE">Online Payment</SelectItem>
                  <SelectItem value="COD">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" size="lg" onClick={handleOrder} disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

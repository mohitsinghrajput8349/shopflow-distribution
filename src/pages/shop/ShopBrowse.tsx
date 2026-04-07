import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, ShoppingCart, Search, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { ProductResponse } from "@/lib/api";

export default function ShopBrowse() {
  const { data: products, isLoading } = useQuery({ queryKey: ["products"], queryFn: productsApi.getAll });
  const { addToCart, items } = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const categories = [...new Set(products?.map(p => p.category) ?? [])];
  const filtered = products?.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    return p.isActive;
  });

  const getCartQty = (productId: number) => items.find(i => i.product.id === productId)?.quantity ?? 0;

  const handleAdd = (product: ProductResponse) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`, { duration: 1500 });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-xl bg-muted animate-pulse" style={{ aspectRatio: "3/4" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Browse Products</h1>
        <p className="text-sm text-muted-foreground">Find and order products for your shop</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-10" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 min-w-max sm:flex-wrap sm:min-w-0">
            <Button variant={category === "" ? "default" : "outline"} size="sm" className="h-8 text-xs sm:text-sm rounded-full" onClick={() => setCategory("")}>All</Button>
            {categories.map(c => (
              <Button key={c} variant={category === c ? "default" : "outline"} size="sm" className="h-8 text-xs sm:text-sm rounded-full" onClick={() => setCategory(c)}>{c}</Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filtered?.length === 0 ? (
        <Card className="shadow-card"><CardContent className="flex flex-col items-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No products found</p>
          <p className="text-sm text-muted-foreground">Try a different search or category</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered?.map(p => {
            const cartQty = getCartQty(p.id);
            return (
              <ProductCard key={p.id} product={p} variant="shop">
                {cartQty > 0 ? (
                  <AddToCartControl product={p} quantity={cartQty} />
                ) : (
                  <Button
                    className="w-full h-9 text-xs sm:text-sm gradient-accent border-0 text-accent-foreground hover:opacity-90 transition-opacity"
                    disabled={p.stock === 0}
                    onClick={() => handleAdd(p)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                )}
              </ProductCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddToCartControl({ product, quantity }: { product: ProductResponse; quantity: number }) {
  const { addToCart, updateQuantity } = useCart();

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-lg shrink-0"
        onClick={() => updateQuantity(product.id, quantity - 1)}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <div className="flex-1 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-bold text-primary">{quantity}</span>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-lg shrink-0"
        onClick={() => addToCart(product, 1)}
        disabled={quantity >= product.stock}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

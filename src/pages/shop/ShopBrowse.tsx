import { useQuery } from "@tanstack/react-query";
import { productsApi, getImageUrl } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, ShoppingCart, Search } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function ShopBrowse() {
  const { data: products, isLoading } = useQuery({ queryKey: ["products"], queryFn: productsApi.getAll });
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const categories = [...new Set(products?.map(p => p.category) ?? [])];
  const filtered = products?.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    return p.isActive;
  });

  const handleAdd = (product: typeof products extends (infer T)[] | undefined ? T : never) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  if (isLoading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Browse Products</h1>
        <p className="text-muted-foreground">Find and order products for your shop</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={category === "" ? "default" : "outline"} size="sm" onClick={() => setCategory("")}>All</Button>
          {categories.map(c => (
            <Button key={c} variant={category === c ? "default" : "outline"} size="sm" onClick={() => setCategory(c)}>{c}</Button>
          ))}
        </div>
      </div>

      {filtered?.length === 0 ? (
        <Card className="shadow-card"><CardContent className="flex flex-col items-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No products found</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered?.map(p => (
            <Card key={p.id} className="shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {p.imageUrl ? (
                  <img src={getImageUrl(p.imageUrl)} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="h-10 w-10 text-muted-foreground" /></div>
                )}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground">{p.category}</span>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">₹{p.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                  </span>
                </div>
                <Button className="w-full" disabled={p.stock === 0} onClick={() => handleAdd(p)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

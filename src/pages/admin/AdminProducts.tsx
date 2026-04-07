import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, getImageUrl, type ProductResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Pencil, Package } from "lucide-react";
import { toast } from "sonner";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({ queryKey: ["products"], queryFn: productsApi.getAll });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); toast.success("Product deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => { setEditingProduct(null); setDialogOpen(true); };
  const openEdit = (p: ProductResponse) => { setEditingProduct(p); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <ProductForm product={editingProduct} onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : products?.length === 0 ? (
        <Card className="shadow-card"><CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No products yet</p>
          <p className="text-muted-foreground mb-4">Create your first product to get started</p>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.map(p => (
            <Card key={p.id} className="shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {p.imageUrl ? (
                  <img src={getImageUrl(p.imageUrl)} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground">
                  {p.category}
                </span>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">₹{p.price}</span>
                  <span className="text-sm text-muted-foreground">Stock: {p.stock}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(p)}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <ImageUploadButton productId={p.id} />
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => deleteMutation.mutate(p.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, onSuccess }: { product: ProductResponse | null; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    category: product?.category ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        await productsApi.update(product.id, form);
        toast.success("Product updated");
      } else {
        await productsApi.create(form);
        toast.success("Product created");
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Price (₹)</Label>
          <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} required />
        </div>
        <div className="space-y-2">
          <Label>Stock</Label>
          <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) }))} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}

function ImageUploadButton({ productId }: { productId: number }) {
  const queryClient = useQueryClient();
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await productsApi.uploadImage(productId, file);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Button variant="outline" size="sm" asChild>
      <label className="cursor-pointer">
        <Upload className="h-3 w-3" />
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
    </Button>
  );
}

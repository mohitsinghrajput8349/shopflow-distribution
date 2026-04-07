import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, getImageUrl, type ProductResponse } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Pencil, Package, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="h-9 text-sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <ProductForm product={editingProduct} onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map(i => <div key={i} className="rounded-xl bg-muted animate-pulse" style={{ aspectRatio: "3/4" }} />)}
        </div>
      ) : products?.length === 0 ? (
        <Card className="shadow-card"><CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground">No products yet</p>
          <p className="text-sm text-muted-foreground mb-5">Create your first product to get started</p>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {products?.map(p => (
            <ProductCard key={p.id} product={p} variant="admin">
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => openEdit(p)}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <ImageUploadButton productId={p.id} />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    if (confirm("Delete this product?")) deleteMutation.mutate(p.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </ProductCard>
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageUrl ? getImageUrl(product.imageUrl) : null
  );
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let savedProduct: ProductResponse;
      if (product) {
        savedProduct = await productsApi.update(product.id, form);
        toast.success("Product updated");
      } else {
        savedProduct = await productsApi.create(form);
        toast.success("Product created");
      }
      // Upload image if selected
      if (imageFile) {
        await productsApi.uploadImage(savedProduct.id, imageFile);
        toast.success("Image uploaded");
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
      {/* Image upload area */}
      <div className="space-y-2">
        <Label>Product Image</Label>
        <label className="block cursor-pointer">
          <div className="relative aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors overflow-hidden bg-muted/30">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">Change Image</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center py-8">
                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <span className="text-xs text-muted-foreground/60 mt-0.5">JPG, PNG up to 5MB</span>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </label>
      </div>

      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" required />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your product..." rows={3} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
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
        <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Beverages, Snacks" required />
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
    <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
      <label className="cursor-pointer flex items-center justify-center">
        <Upload className="h-3 w-3" />
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
    </Button>
  );
}

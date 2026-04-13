import { getImageUrl, type ProductResponse } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface ProductCardImageProps {
  product: ProductResponse;
  children?: React.ReactNode;
  variant?: "shop" | "admin";
}

export default function ProductCard({ product, children, variant = "shop" }: ProductCardImageProps) {
  const p = product;
  const hasImage = !!p.imageUrl;
  const inStock = p.stock > 0;

  return (
    <Card className="group shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border-0 bg-card">

      {/* 🔥 IMAGE CONTAINER */}
      <div className="relative aspect-[4/3] overflow-hidden">
        
        {hasImage ? (
          <img
            src={getImageUrl(p.imageUrl)}
            alt={p.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/40 mb-2" />
            <span className="text-xs text-muted-foreground/50">No image</span>
          </div>
        )}

        {/* ✅ LIGHT OVERLAY (optional, very subtle) */}
        {hasImage && (
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
        )}

        {/* ✅ CATEGORY BADGE */}
        <Badge className="absolute top-2.5 left-2.5 bg-card/90 backdrop-blur-sm text-foreground border-0 text-[10px] sm:text-xs font-medium shadow-sm">
          {p.category}
        </Badge>

        {/* ✅ STOCK */}
        <div className="absolute top-2.5 right-2.5">
          {inStock ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {p.stock}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-medium">
              Out
            </span>
          )}
        </div>

        {/* ✅ PRICE */}
        {hasImage && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-lg sm:text-xl font-bold text-white drop-shadow-md">
              ₹{p.price}
            </span>
          </div>
        )}
      </div>

      {/* 🔥 CONTENT */}
      <CardContent className="p-3 sm:p-4 space-y-2.5">
        <div>
          <h3 className="font-semibold text-foreground text-sm sm:text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {p.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
            {p.description}
          </p>
        </div>

        {!hasImage && (
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">₹{p.price}</span>
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  );
}

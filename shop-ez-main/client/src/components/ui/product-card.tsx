import { Link } from "wouter";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { z } from "zod";
import { api } from "@shared/routes";

type Product = z.infer<typeof api.products.list.responses[200]>[0];

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useAddToCart();
  
  // Format price assuming it might be a string from decimal
  const price = parseFloat(product.price.toString());
  const discountPrice = product.discountPrice ? parseFloat(product.discountPrice.toString()) : null;
  const rating = parseFloat(product.rating?.toString() || '0');
  
  // Fallback image if array is empty
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";

  return (
    <div className="group relative bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
      {/* Badges */}
      {discountPrice && (
        <div className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
          Sale
        </div>
      )}
      {product.isFeatured && !discountPrice && (
        <div className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
          Featured
        </div>
      )}

      {/* Image */}
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted/20">
        <img
          src={imageUrl}
          alt={product.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-display font-semibold text-base line-clamp-2 leading-tight">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center text-amber-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted-foreground">({product.brand})</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            {discountPrice ? (
              <>
                <span className="text-lg font-bold text-foreground">${discountPrice.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through">${price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-foreground">${price.toFixed(2)}</span>
            )}
          </div>
          
          <Button 
            size="icon" 
            className="rounded-full w-10 h-10 shadow-md hover:shadow-lg transition-all"
            onClick={(e) => {
              e.preventDefault();
              addToCart.mutate({ productId: product.id });
            }}
            disabled={addToCart.isPending}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

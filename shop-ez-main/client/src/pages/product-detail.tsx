import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, ShieldCheck, Truck, ArrowLeft, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id || "";
  
  const { data: product, isLoading } = useProduct(id);
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted rounded-3xl animate-pulse" />
          <div className="space-y-6 pt-8">
            <div className="h-8 bg-muted rounded w-2/3 animate-pulse" />
            <div className="h-12 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-32 bg-muted rounded w-full animate-pulse" />
            <div className="h-14 bg-muted rounded-full w-full max-w-sm animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link href="/products">
          <Button variant="outline"><ArrowLeft className="mr-2 w-4 h-4"/> Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const price = parseFloat(product.price.toString());
  const discountPrice = product.discountPrice ? parseFloat(product.discountPrice.toString()) : null;
  const rating = parseFloat(product.rating?.toString() || '0');
  
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb back */}
        <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Product Image Gallery (Simplified to single image for now) */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted border p-4 sm:p-8 flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt={product.title} 
                className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500" 
              />
            </div>
            {/* Thumbnails could go here */}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">{product.brand}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4 leading-tight">
              {product.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-amber-400 bg-amber-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1.5 text-sm font-bold text-amber-700">{rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">In Category: <span className="capitalize text-foreground font-medium">{product.category}</span></span>
            </div>

            <div className="flex flex-col mb-8 pb-8 border-b">
              {discountPrice ? (
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-foreground">${discountPrice.toFixed(2)}</span>
                  <span className="text-xl text-muted-foreground line-through mb-1">${price.toFixed(2)}</span>
                  <span className="bg-destructive/10 text-destructive text-sm font-bold px-2 py-1 rounded-md mb-1 ml-2">
                    Save ${(price - discountPrice).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-bold text-foreground">${price.toFixed(2)}</span>
              )}
              <p className="text-sm text-muted-foreground mt-2">Taxes included. Free shipping applies.</p>
            </div>

            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Action Area */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border rounded-full p-1 bg-white h-14 shrink-0 w-36">
                <button 
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-semibold text-lg">{quantity}</span>
                <button 
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <Button 
                size="lg" 
                className="flex-1 rounded-full h-14 text-lg font-semibold shadow-lg shadow-primary/25 hover:-translate-y-1 transition-all"
                onClick={() => addToCart.mutate({ productId: product.id, quantity })}
                disabled={addToCart.isPending || product.stock === 0}
              >
                {addToCart.isPending ? "Adding..." : (
                  <>
                    <ShoppingCart className="mr-2 w-5 h-5" /> 
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </>
                )}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="w-5 h-5 text-primary" />
                <span>Fast & Free Shipping</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>2 Year Warranty</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

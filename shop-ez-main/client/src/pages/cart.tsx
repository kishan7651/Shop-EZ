import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Cart() {
  const { data: cartItems, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  // Handle case where user is not logged in (cart hook returns empty array gracefully, 
  // but we might want to check auth state explicitly if we wanted to show a "Login to view" message.
  // For now, if empty, we just show empty state.
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-3xl text-center">
        <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 text-lg">Looks like you haven't added anything yet.</p>
        <Link href="/products">
          <Button size="lg" className="rounded-full px-8 h-14">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((total, item) => {
    const price = parseFloat((item.product.discountPrice || item.product.price).toString());
    return total + (price * item.quantity);
  }, 0);

  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-6xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-6">
          {cartItems.map((item) => {
            const price = parseFloat((item.product.discountPrice || item.product.price).toString());
            const img = item.product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80";
            
            return (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white border rounded-2xl shadow-sm relative pr-12 sm:pr-4">
                <Link href={`/product/${item.product.id}`} className="shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-xl overflow-hidden">
                    <img src={img} alt={item.product.title} className="w-full h-full object-cover" />
                  </div>
                </Link>
                
                <div className="flex-1 flex flex-col py-1">
                  <div className="flex justify-between items-start mb-1">
                    <Link href={`/product/${item.product.id}`} className="hover:text-primary">
                      <h3 className="font-semibold text-lg line-clamp-2">{item.product.title}</h3>
                    </Link>
                    <span className="font-bold text-lg hidden sm:block">${(price * item.quantity).toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{item.product.brand}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border rounded-full p-1 bg-muted/30">
                      <button 
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white shadow-sm disabled:opacity-50 transition-colors"
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateItem.mutate({ id: item.id, quantity: item.quantity - 1 });
                          }
                        }}
                        disabled={updateItem.isPending}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white shadow-sm disabled:opacity-50 transition-colors"
                        onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        disabled={updateItem.isPending}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-lg sm:hidden">${(price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => removeItem.mutate(item.id)}
                  disabled={removeItem.isPending}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors p-2 bg-muted/50 rounded-full sm:bg-transparent sm:p-0"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white border rounded-3xl p-6 shadow-sm sticky top-24">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              {shipping > 0 && (
                <div className="text-xs text-primary/80 bg-primary/10 p-2 rounded-lg text-center">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </div>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>

            <Link href="/checkout">
              <Button size="lg" className="w-full rounded-full h-14 text-base font-semibold shadow-md">
                Proceed to Checkout <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

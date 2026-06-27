import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck, Lock, CreditCard, Banknote } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  address: z.string().min(10, "Please provide a complete address"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().min(4, "Zip code is required"),
  paymentMethod: z.enum(["COD", "Card"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || user?.username || "",
      email: user?.email || "",
      address: "",
      city: "",
      zipCode: "",
      paymentMethod: "COD",
    },
  });

  // Redirect if not logged in or cart is empty
  if (!userLoading && !user) {
    setLocation("/auth?redirect=/checkout");
    return null;
  }

  if (!cartLoading && (!cartItems || cartItems.length === 0)) {
    setLocation("/cart");
    return null;
  }

  if (cartLoading || userLoading || !cartItems) {
    return <div className="p-12 text-center">Loading checkout...</div>;
  }

  const subtotal = cartItems.reduce((total, item) => {
    const price = parseFloat((item.product.discountPrice || item.product.price).toString());
    return total + (price * item.quantity);
  }, 0);
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + shipping;

  const onSubmit = (data: CheckoutForm) => {
    const fullAddress = `${data.address}, ${data.city}, ${data.zipCode}`;
    createOrder.mutate({
      totalAmount: total.toString(), // Send as string to match decimal schema if needed, but coercion is usually handled
      paymentMethod: data.paymentMethod,
      address: fullAddress,
    });
  };

  return (
    <div className="bg-muted/30 min-h-[calc(100vh-64px)] pb-20">
      <div className="bg-white border-b mb-8 py-4">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <Lock className="w-5 h-5" /> Secure Checkout
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Checkout Form */}
          <div className="lg:col-span-7 xl:col-span-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Shipping Details */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border shadow-sm">
                  <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} className="h-12 rounded-xl bg-muted/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" {...field} className="h-12 rounded-xl bg-muted/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl><Textarea {...field} className="resize-none rounded-xl bg-muted/50" rows={3} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input {...field} className="h-12 rounded-xl bg-muted/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="zipCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal / Zip Code</FormLabel>
                        <FormControl><Input {...field} className="h-12 rounded-xl bg-muted/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border shadow-sm">
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                  
                  <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          className="space-y-4"
                        >
                          <div className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-colors ${field.value === 'COD' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                            <RadioGroupItem value="COD" id="cod" />
                            <Label htmlFor="cod" className="flex-1 flex items-center justify-between cursor-pointer font-medium text-base">
                              <span className="flex items-center gap-3"><Banknote className="w-5 h-5 text-green-600"/> Cash on Delivery</span>
                            </Label>
                          </div>
                          
                          <div className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-colors ${field.value === 'Card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                            <RadioGroupItem value="Card" id="card" disabled />
                            <Label htmlFor="card" className="flex-1 flex flex-col cursor-pointer">
                              <span className="flex items-center gap-3 font-medium text-base opacity-50"><CreditCard className="w-5 h-5 text-blue-600"/> Credit/Debit Card</span>
                              <span className="text-xs text-muted-foreground mt-1 ml-8">Stripe integration disabled. Simulated environment.</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="lg:hidden">
                   <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full rounded-full h-14 text-lg shadow-lg"
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? "Processing..." : `Place Order • $${total.toFixed(2)}`}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white border rounded-3xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-lg mb-4">In Your Cart</h3>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
                {cartItems.map(item => {
                   const price = parseFloat((item.product.discountPrice || item.product.price).toString());
                   return (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                        <img src={item.product.images?.[0] || ""} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium line-clamp-2 leading-tight">{item.product.title}</p>
                        <p className="text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-semibold text-sm">
                        ${(price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                   );
                })}
              </div>
              
              <Separator className="mb-4" />
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
              </div>
              
              <Separator className="mb-4" />
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>

              <Button 
                onClick={() => form.handleSubmit(onSubmit)()}
                size="lg" 
                className="w-full rounded-full h-14 text-base font-semibold shadow-md hidden lg:flex"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Processing..." : "Place Order"}
              </Button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                Your data is encrypted and secure.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

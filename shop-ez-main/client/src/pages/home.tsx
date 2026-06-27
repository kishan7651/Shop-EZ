import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ui/product-card";
import { ArrowRight, Zap, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const featuredProducts = products?.filter(p => p.isFeatured).slice(0, 4) || products?.slice(0, 4);

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-muted/30 pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-accent/30 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <span className="inline-block py-1 px-3 rounded-full bg-accent text-accent-foreground text-sm font-semibold mb-6">
                New Collection 2025
              </span>
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-foreground leading-[1.1] mb-6 tracking-tight text-balance">
                Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">Perfect</span> Style
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
                Shop the latest trends in electronics, fashion, and home goods. Premium quality products curated just for you.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products">
                  <Button size="lg" className="rounded-full px-8 h-14 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/products?category=electronics">
                  <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-base border-2 hover:bg-muted transition-all">
                    Explore Tech
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                {/* hero minimal desk setup */}
                <img 
                  src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80" 
                  alt="Premium Products" 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 glass p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
                <div className="bg-green-500/20 p-3 rounded-full text-green-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm">100% Secure</p>
                  <p className="text-xs text-muted-foreground">Verified Products</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-y bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x">
            <div className="flex items-center gap-4 py-4 md:py-0 md:px-6">
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">Free Shipping</h4>
                <p className="text-sm text-muted-foreground">On all orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-4 md:py-0 md:px-6">
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">Fast Delivery</h4>
                <p className="text-sm text-muted-foreground">Within 2-4 business days</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-4 md:py-0 md:px-6">
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">Secure Payment</h4>
                <p className="text-sm text-muted-foreground">100% secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold tracking-tight mb-2">Featured Products</h2>
              <p className="text-muted-foreground text-lg">Handpicked selection of our finest items.</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center text-primary font-medium hover:underline">
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl h-[400px] bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-10 sm:hidden text-center">
             <Link href="/products">
                <Button variant="outline" className="rounded-full w-full">
                  View All Products
                </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Categories Banner */}
      <section className="py-20 bg-foreground text-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6">Upgrade Your Lifestyle</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-md">
                Explore our massive collection of top-tier electronics and trending fashion. Unbeatable prices, unmatched quality.
              </p>
              <div className="flex gap-4">
                <Link href="/products?category=electronics">
                  <Button variant="secondary" className="rounded-full px-6">Shop Electronics</Button>
                </Link>
                <Link href="/products?category=fashion">
                  <Button variant="outline" className="rounded-full px-6 border-gray-600 text-white hover:bg-gray-800">Shop Fashion</Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {/* abstract dark electronics */}
               <img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80" alt="Category" className="rounded-2xl object-cover aspect-square w-full" />
               {/* abstract fashion texture */}
               <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80" alt="Category" className="rounded-2xl object-cover aspect-square w-full translate-y-8" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

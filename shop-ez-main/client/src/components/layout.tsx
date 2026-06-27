import { Link } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, User as UserIcon, LogOut, Menu, Search, Package, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLocation } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: cart } = useCart();
  const logout = useLogout();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const cartItemsCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-primary p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight hidden sm:block text-foreground">
                  ShopEZ
                </span>
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="flex-1 max-w-2xl hidden md:flex">
              <form onSubmit={handleSearch} className="w-full relative">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="search"
                    placeholder="Search for products, brands and more..."
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border-transparent hover:border-border focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/products">
                <Button variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-foreground">
                  Products
                </Button>
              </Link>

              <Link href="/cart" className="relative group">
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <ShoppingBag className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                  {cartItemsCount > 0 && (
                    <span className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground transform bg-primary rounded-full min-w-[20px] shadow-sm animate-in zoom-in">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>

              {userLoading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-accent/50 hover:bg-accent border border-accent">
                      <UserIcon className="w-5 h-5 text-accent-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email || 'Customer Account'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer py-2 px-3 rounded-lg">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>My Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/orders">
                      <DropdownMenuItem className="cursor-pointer py-2 px-3 rounded-lg">
                        <Package className="mr-2 h-4 w-4" />
                        <span>My Orders</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive py-2 px-3 rounded-lg"
                      onClick={() => logout.mutate()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button className="rounded-full px-6 font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="pb-3 md:hidden">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-10 bg-muted/50 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="bg-white border-t py-12 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary p-1.5 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg">ShopEZ</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your premium destination for the best products. Quality guaranteed, delivered to your door.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link href="/products?category=electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
                <li><Link href="/products?category=fashion" className="hover:text-primary transition-colors">Fashion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ShopEZ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

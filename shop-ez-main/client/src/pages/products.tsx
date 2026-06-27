import { useLocation } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ui/product-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  
  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: products, isLoading } = useProducts({ 
    search: debouncedSearch, 
    category: category 
  });

  const categories = ["all", "electronics", "fashion", "home", "beauty", "sports"];

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" /> Filters
        </h3>
        <Separator className="mb-4" />
      </div>

      <div>
        <h4 className="font-medium mb-3">Categories</h4>
        <RadioGroup value={category} onValueChange={setCategory} className="space-y-3">
          {categories.map((c) => (
            <div key={c} className="flex items-center space-x-2">
              <RadioGroupItem value={c} id={`cat-${c}`} />
              <Label htmlFor={`cat-${c}`} className="capitalize cursor-pointer font-normal">
                {c}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button 
        variant="outline" 
        className="w-full text-muted-foreground"
        onClick={() => {
          setSearch("");
          setCategory("all");
        }}
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      
      {/* Header & Mobile Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Our Products</h1>
          <p className="text-muted-foreground mt-1">Explore our entire collection.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-9 pr-4 rounded-full bg-white shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden shrink-0 rounded-full">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-24 bg-white p-6 rounded-2xl border shadow-sm">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-2xl h-[400px] bg-muted animate-pulse" />
              ))}
            </div>
          ) : products?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-2xl text-center px-4">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find anything matching your search. Try adjusting your filters or search term.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-full"
                onClick={() => { setSearch(""); setCategory("all"); }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

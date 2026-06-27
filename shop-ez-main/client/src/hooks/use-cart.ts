import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCart() {
  return useQuery({
    queryKey: [api.cart.list.path],
    queryFn: async () => {
      const res = await fetch(api.cart.list.path, { credentials: "include" });
      if (res.status === 401) return []; // Not logged in = empty cart UI gracefully
      if (!res.ok) throw new Error("Failed to fetch cart");
      return api.cart.list.responses[200].parse(await res.json());
    }
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number, quantity?: number }) => {
      const res = await fetch(api.cart.add.path, {
        method: api.cart.add.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
        credentials: "include",
      });
      if (res.status === 401) throw new Error("Please login to add to cart");
      if (!res.ok) throw new Error("Failed to add to cart");
      return api.cart.add.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
      toast({ title: "Added to Cart", description: "Item successfully added to your cart." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: number, quantity: number }) => {
      const url = buildUrl(api.cart.update.path, { id });
      const res = await fetch(url, {
        method: api.cart.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update cart item");
      return api.cart.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
    }
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cart.remove.path, { id });
      const res = await fetch(url, {
        method: api.cart.remove.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
      toast({ description: "Item removed from cart" });
    }
  });
}

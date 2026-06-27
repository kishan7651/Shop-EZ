import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type ProductsQueryInput = z.infer<typeof api.products.list.input>;

export function useProducts(params?: ProductsQueryInput) {
  return useQuery({
    queryKey: [api.products.list.path, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set("search", params.search);
      if (params?.category && params.category !== "all") searchParams.set("category", params.category);
      if (params?.brand) searchParams.set("brand", params.brand);
      
      const url = `${api.products.list.path}?${searchParams.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      
      const data = await res.json();
      return api.products.list.responses[200].parse(data);
    }
  });
}

export function useProduct(id: string | number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      
      const data = await res.json();
      return api.products.get.responses[200].parse(data);
    },
    enabled: !!id
  });
}

import { z } from 'zod';
import { 
  insertUserSchema, insertProductSchema, insertOrderSchema,
  users, products, cartItems, orders, orderItems
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        brand: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  cart: {
    list: {
      method: 'GET' as const,
      path: '/api/cart' as const,
      responses: {
        200: z.array(z.custom<typeof cartItems.$inferSelect & { product: typeof products.$inferSelect }>()),
        401: errorSchemas.unauthorized,
      }
    },
    add: {
      method: 'POST' as const,
      path: '/api/cart' as const,
      input: z.object({ productId: z.number(), quantity: z.number().default(1) }),
      responses: {
        201: z.custom<typeof cartItems.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/cart/:id' as const,
      input: z.object({ quantity: z.number() }),
      responses: {
        200: z.custom<typeof cartItems.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    remove: {
      method: 'DELETE' as const,
      path: '/api/cart/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
        401: errorSchemas.unauthorized,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: insertOrderSchema.omit({ userId: true, status: true }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id' as const,
      responses: {
        200: z.custom<typeof orders.$inferSelect & { items: (typeof orderItems.$inferSelect & { product: typeof products.$inferSelect })[] }>(),
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

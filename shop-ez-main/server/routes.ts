import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import passport from "passport";
import { LocalStrategy, setupAuth } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication with session and passport
  setupAuth(app);

  // Auth Routes
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(req.body);
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      next(err);
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      return res.status(200).json(req.user);
    }
    res.status(401).json({ message: "Not authenticated" });
  });

  // Products Routes
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  // Cart Routes (Protected)
  app.get(api.cart.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const items = await storage.getCartItems(req.user.id);
    res.json(items);
  });

  app.post(api.cart.add.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const input = api.cart.add.input.parse(req.body);
      const item = await storage.addCartItem({
        userId: req.user.id,
        productId: input.productId,
        quantity: input.quantity
      });
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.patch(api.cart.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const input = api.cart.update.input.parse(req.body);
      const item = await storage.updateCartItem(Number(req.params.id), input.quantity);
      if (!item) return res.status(404).json({ message: "Cart item not found" });
      res.json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.delete(api.cart.remove.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    await storage.removeCartItem(Number(req.params.id));
    res.status(204).end();
  });

  // Orders Routes (Protected)
  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const orders = await storage.getOrders(req.user.id);
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const input = api.orders.create.input.parse(req.body);
      
      // Get cart items to create order items
      const cartItems = await storage.getCartItems(req.user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Create the order
      const order = await storage.createOrder(
        {
          userId: req.user.id,
          totalAmount: input.totalAmount,
          paymentMethod: input.paymentMethod,
          address: input.address,
        },
        cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          orderId: 0 // Will be set in storage
        }))
      );

      // Clear the cart
      await storage.clearCart(req.user.id);

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.get(api.orders.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== req.user.id) return res.status(401).json({ message: "Unauthorized" });
    
    res.json(order);
  });

  // Initial Seed Data (if products are empty)
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    const { db } = await import("./db");
    const { products } = await import("@shared/schema");
    
    await db.insert(products).values([
      {
        title: "Wireless Noise-Canceling Headphones",
        description: "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and high-fidelity audio.",
        price: "299.99",
        category: "Electronics",
        brand: "AudioTech",
        stock: 50,
        rating: "4.8",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"],
        isFeatured: true
      },
      {
        title: "Minimalist Leather Watch",
        description: "Classic design with genuine leather strap, quartz movement, and water resistance up to 30 meters.",
        price: "129.50",
        category: "Accessories",
        brand: "TimePiece",
        stock: 20,
        rating: "4.5",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30"],
        isFeatured: true
      },
      {
        title: "Smart Home Security Camera",
        description: "1080p HD indoor security camera with motion detection, two-way audio, and night vision.",
        price: "79.99",
        category: "Electronics",
        brand: "SafeHome",
        stock: 100,
        rating: "4.2",
        images: ["https://images.unsplash.com/photo-1557825835-70d97c4aa567"],
        isFeatured: false
      },
      {
        title: "Ergonomic Office Chair",
        description: "Comfortable mesh back chair with adjustable lumbar support and armrests for long working hours.",
        price: "199.00",
        category: "Furniture",
        brand: "ComfortPlus",
        stock: 15,
        rating: "4.6",
        images: ["https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1"],
        isFeatured: true
      }
    ]);
    console.log("Seeded database with initial products");
  }
}

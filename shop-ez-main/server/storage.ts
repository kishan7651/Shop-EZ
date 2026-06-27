import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  users, products, cartItems, orders, orderItems,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProducts(search?: string, category?: string, brand?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  
  getCartItems(userId: number): Promise<(CartItem & { product: Product })[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;

  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(search?: string, category?: string, brand?: string): Promise<Product[]> {
    let query = db.select().from(products).$dynamic();
    
    // In a real app we'd add where clauses here for filtering,
    // but for simplicity in this MVP we just return all and let frontend filter,
    // or we'd construct complex conditions. Let's just return all for now or do basic exact match.
    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const items = await db.select({
      cartItem: cartItems,
      product: products
    }).from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

    return items.map(row => ({
      ...row.cartItem,
      product: row.product
    }));
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    // Check if it already exists
    const [existing] = await db.select().from(cartItems).where(
      and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId))
    );

    if (existing) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing.quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }

    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeCartItem(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }
  
  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(orders.createdAt);
  }

  async getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select({
      orderItem: orderItems,
      product: products
    }).from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id));

    return {
      ...order,
      items: items.map(row => ({
        ...row.orderItem,
        product: row.product
      }))
    };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      const itemsToInsert = items.map(i => ({
        ...i,
        orderId: newOrder.id
      }));
      
      if (itemsToInsert.length > 0) {
        await tx.insert(orderItems).values(itemsToInsert);
      }
      
      return newOrder;
    });
  }
}

export const storage = new DatabaseStorage();

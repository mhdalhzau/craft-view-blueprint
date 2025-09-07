import {
  users,
  inventory,
  categories,
  products,
  productInventory,
  transactions,
  transactionItems,
  cashFlow,
  stockMovements,
  type User,
  type UpsertUser,
  type Inventory,
  type InsertInventory,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductInventory,
  type InsertProductInventory,
  type Transaction,
  type InsertTransaction,
  type TransactionItem,
  type InsertTransactionItem,
  type CashFlow,
  type InsertCashFlow,
  type StockMovement,
  type InsertStockMovement,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Inventory operations
  getAllInventory(): Promise<Inventory[]>;
  getInventory(id: string): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: string, inventory: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventory(id: string): Promise<void>;
  updateInventoryStock(id: string, newStock: number): Promise<void>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Product inventory operations
  getProductInventory(productId: string): Promise<ProductInventory[]>;
  createProductInventory(productInventory: InsertProductInventory): Promise<ProductInventory>;
  deleteProductInventory(productId: string): Promise<void>;
  
  // Transaction operations
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionItems(transactionId: string): Promise<TransactionItem[]>;
  createTransactionItem(item: InsertTransactionItem): Promise<TransactionItem>;
  
  // Cash flow operations
  getAllCashFlow(): Promise<CashFlow[]>;
  createCashFlow(cashFlow: InsertCashFlow): Promise<CashFlow>;
  
  // Stock movement operations
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  getStockMovements(inventoryId?: string): Promise<StockMovement[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Inventory operations
  async getAllInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory).orderBy(inventory.name);
  }

  async getInventory(id: string): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }

  async createInventory(inventoryData: InsertInventory): Promise<Inventory> {
    const [item] = await db.insert(inventory).values(inventoryData).returning();
    return item;
  }

  async updateInventory(id: string, inventoryData: Partial<InsertInventory>): Promise<Inventory> {
    const [item] = await db
      .update(inventory)
      .set({ ...inventoryData, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }

  async deleteInventory(id: string): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  async updateInventoryStock(id: string, newStock: number): Promise<void> {
    await db
      .update(inventory)
      .set({ stock: newStock, updatedAt: new Date() })
      .where(eq(inventory.id, id));
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Product inventory operations
  async getProductInventory(productId: string): Promise<ProductInventory[]> {
    return await db
      .select()
      .from(productInventory)
      .where(eq(productInventory.productId, productId));
  }

  async createProductInventory(productInventoryData: InsertProductInventory): Promise<ProductInventory> {
    const [item] = await db.insert(productInventory).values(productInventoryData).returning();
    return item;
  }

  async deleteProductInventory(productId: string): Promise<void> {
    await db.delete(productInventory).where(eq(productInventory.productId, productId));
  }

  // Transaction operations
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(transactionData).returning();
    return transaction;
  }

  async getTransactionItems(transactionId: string): Promise<TransactionItem[]> {
    return await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId));
  }

  async createTransactionItem(itemData: InsertTransactionItem): Promise<TransactionItem> {
    const [item] = await db.insert(transactionItems).values(itemData).returning();
    return item;
  }

  // Cash flow operations
  async getAllCashFlow(): Promise<CashFlow[]> {
    return await db.select().from(cashFlow).orderBy(desc(cashFlow.createdAt));
  }

  async createCashFlow(cashFlowData: InsertCashFlow): Promise<CashFlow> {
    const [flow] = await db.insert(cashFlow).values(cashFlowData).returning();
    return flow;
  }

  // Stock movement operations
  async createStockMovement(movementData: InsertStockMovement): Promise<StockMovement> {
    const [movement] = await db.insert(stockMovements).values(movementData).returning();
    return movement;
  }

  async getStockMovements(inventoryId?: string): Promise<StockMovement[]> {
    if (inventoryId) {
      return await db
        .select()
        .from(stockMovements)
        .where(eq(stockMovements.inventoryId, inventoryId))
        .orderBy(desc(stockMovements.createdAt));
    }
    return await db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt));
  }
}

export const storage = new DatabaseStorage();
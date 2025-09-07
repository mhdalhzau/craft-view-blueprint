import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertInventorySchema,
  insertCategorySchema,
  insertProductSchema,
  insertProductInventorySchema,
  insertTransactionSchema,
  insertTransactionItemSchema,
  insertCashFlowSchema,
  insertStockMovementSchema,
} from "../shared/schema";

// Helper function to generate receipt text for thermal printer
function generateReceiptText(transaction: any, items: any[]) {
  const date = new Date(transaction.createdAt).toLocaleString('id-ID');
  
  let receipt = '';
  receipt += '================================\n';
  receipt += '         DIMSUM WARUNG\n';
  receipt += '================================\n';
  receipt += `No: ${transaction.transactionNumber}\n`;
  receipt += `Tanggal: ${date}\n`;
  receipt += `Kasir: ${transaction.userId}\n`;
  receipt += '--------------------------------\n';
  
  items.forEach(item => {
    receipt += `${item.productName}\n`;
    receipt += `${item.quantity} x ${item.unitPrice.toLocaleString('id-ID')} = ${item.totalPrice.toLocaleString('id-ID')}\n`;
    receipt += '--------------------------------\n';
  });
  
  receipt += `Subtotal: Rp ${transaction.subtotal.toLocaleString('id-ID')}\n`;
  if (transaction.discount > 0) {
    receipt += `Diskon: Rp ${transaction.discount.toLocaleString('id-ID')}\n`;
  }
  if (transaction.tax > 0) {
    receipt += `Pajak: Rp ${transaction.tax.toLocaleString('id-ID')}\n`;
  }
  receipt += `TOTAL: Rp ${transaction.totalAmount.toLocaleString('id-ID')}\n`;
  receipt += `Bayar: Rp ${transaction.paidAmount.toLocaleString('id-ID')}\n`;
  receipt += `Kembali: Rp ${transaction.changeAmount.toLocaleString('id-ID')}\n`;
  receipt += '================================\n';
  receipt += '    Terima Kasih Atas\n';
  receipt += '     Kunjungan Anda!\n';
  receipt += '================================\n';
  receipt += '\n\n\n'; // Extra space for cutting
  
  return receipt;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Inventory routes
  app.get('/api/inventory', isAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.getAllInventory();
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.post('/api/inventory', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const inventory = await storage.createInventory(validatedData);
      res.json(inventory);
    } catch (error) {
      console.error("Error creating inventory:", error);
      res.status(400).json({ message: "Failed to create inventory" });
    }
  });

  app.put('/api/inventory/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertInventorySchema.partial().parse(req.body);
      const inventory = await storage.updateInventory(id, validatedData);
      res.json(inventory);
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(400).json({ message: "Failed to update inventory" });
    }
  });

  app.delete('/api/inventory/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteInventory(id);
      res.json({ message: "Inventory deleted successfully" });
    } catch (error) {
      console.error("Error deleting inventory:", error);
      res.status(500).json({ message: "Failed to delete inventory" });
    }
  });

  app.post('/api/inventory/:id/stock', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { newStock, notes, type } = req.body;
      const userId = req.user?.claims?.sub;
      
      const currentInventory = await storage.getInventory(id);
      if (!currentInventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }

      await storage.updateInventoryStock(id, newStock);
      
      // Create stock movement record
      await storage.createStockMovement({
        inventoryId: id,
        type: type || 'adjustment',
        quantity: newStock - currentInventory.stock,
        previousStock: currentInventory.stock,
        newStock: newStock,
        notes: notes,
        userId: userId,
      });

      res.json({ message: "Stock updated successfully" });
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ message: "Failed to update stock" });
    }
  });

  // Category routes
  app.get('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req, res) => {
    try {
      const { categoryId } = req.query;
      let products;
      if (categoryId) {
        products = await storage.getProductsByCategory(categoryId as string);
      } else {
        products = await storage.getAllProducts();
      }
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req, res) => {
    try {
      const { inventoryItems, ...productData } = req.body;
      const validatedProductData = insertProductSchema.parse(productData);
      
      const product = await storage.createProduct(validatedProductData);
      
      // Add inventory mappings if provided
      if (inventoryItems && inventoryItems.length > 0) {
        for (const item of inventoryItems) {
          const validatedInventoryData = insertProductInventorySchema.parse({
            productId: product.id,
            inventoryId: item.inventoryId,
            quantity: item.quantity,
          });
          await storage.createProductInventory(validatedInventoryData);
        }
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { inventoryItems, ...productData } = req.body;
      const validatedData = insertProductSchema.partial().parse(productData);
      
      const product = await storage.updateProduct(id, validatedData);
      
      // Update inventory mappings if provided
      if (inventoryItems !== undefined) {
        await storage.deleteProductInventory(id);
        for (const item of inventoryItems) {
          const validatedInventoryData = insertProductInventorySchema.parse({
            productId: id,
            inventoryId: item.inventoryId,
            quantity: item.quantity,
          });
          await storage.createProductInventory(validatedInventoryData);
        }
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProductInventory(id);
      await storage.deleteProduct(id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get('/api/products/:id/inventory', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const productInventory = await storage.getProductInventory(id);
      res.json(productInventory);
    } catch (error) {
      console.error("Error fetching product inventory:", error);
      res.status(500).json({ message: "Failed to fetch product inventory" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const { items, ...transactionData } = req.body;
      const userId = req.user?.claims?.sub;
      
      // Generate transaction number
      const transactionNumber = `TXN-${Date.now()}`;
      
      const validatedTransactionData = insertTransactionSchema.parse({
        ...transactionData,
        transactionNumber,
        userId,
      });
      
      const transaction = await storage.createTransaction(validatedTransactionData);
      
      // Add transaction items and update inventory
      for (const item of items) {
        const validatedItemData = insertTransactionItemSchema.parse({
          transactionId: transaction.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        });
        
        await storage.createTransactionItem(validatedItemData);
        
        // Reduce inventory stock for products
        const productInventory = await storage.getProductInventory(item.productId);
        for (const inv of productInventory) {
          const currentInventory = await storage.getInventory(inv.inventoryId);
          if (currentInventory) {
            const usedQuantity = parseFloat(inv.quantity) * item.quantity;
            const newStock = currentInventory.stock - usedQuantity;
            
            await storage.updateInventoryStock(inv.inventoryId, newStock);
            
            // Create stock movement record
            await storage.createStockMovement({
              inventoryId: inv.inventoryId,
              type: 'out',
              quantity: -usedQuantity,
              previousStock: currentInventory.stock,
              newStock: newStock,
              notes: `Sale: ${transactionNumber}`,
              userId: userId,
              transactionId: transaction.id,
            });
          }
        }
      }
      
      // Create cash flow record
      await storage.createCashFlow({
        type: 'income',
        category: 'sales',
        amount: transactionData.totalAmount,
        description: `Sale: ${transactionNumber}`,
        referenceId: transaction.id,
        userId: userId,
      });
      
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  app.get('/api/transactions/:id/items', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getTransactionItems(id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching transaction items:", error);
      res.status(500).json({ message: "Failed to fetch transaction items" });
    }
  });

  // Cash flow routes
  app.get('/api/cash-flow', isAuthenticated, async (req, res) => {
    try {
      const cashFlow = await storage.getAllCashFlow();
      res.json(cashFlow);
    } catch (error) {
      console.error("Error fetching cash flow:", error);
      res.status(500).json({ message: "Failed to fetch cash flow" });
    }
  });

  app.post('/api/cash-flow', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validatedData = insertCashFlowSchema.parse({
        ...req.body,
        userId,
      });
      const cashFlow = await storage.createCashFlow(validatedData);
      res.json(cashFlow);
    } catch (error) {
      console.error("Error creating cash flow:", error);
      res.status(400).json({ message: "Failed to create cash flow" });
    }
  });

  // Stock movement routes
  app.get('/api/stock-movements', isAuthenticated, async (req, res) => {
    try {
      const { inventoryId } = req.query;
      const movements = await storage.getStockMovements(inventoryId as string);
      res.json(movements);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      res.status(500).json({ message: "Failed to fetch stock movements" });
    }
  });

  // Initialize default categories
  app.post('/api/init-categories', isAuthenticated, async (req, res) => {
    try {
      const defaultCategories = [
        { name: 'Satuan', type: 'satuan' },
        { name: 'Paket', type: 'paket' },
        { name: 'Topping', type: 'topping' },
      ];
      
      const categories = [];
      for (const category of defaultCategories) {
        const created = await storage.createCategory(category);
        categories.push(created);
      }
      
      res.json(categories);
    } catch (error) {
      console.error("Error initializing categories:", error);
      res.status(500).json({ message: "Failed to initialize categories" });
    }
  });

  // Print receipt via Bluetooth RPP02N printer
  app.post('/api/print-receipt', isAuthenticated, async (req, res) => {
    try {
      const { transactionId } = req.body;
      
      // Get transaction details
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      const items = await storage.getTransactionItems(transactionId);
      
      // Generate receipt text for thermal printer
      const receiptText = generateReceiptText(transaction, items);
      
      // Send to print server API (Node Print Server for RPP02N)
      const printResponse = await fetch('http://localhost:3001/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: receiptText,
          printer: 'RPP02N', // Bluetooth printer name
          options: {
            characterSet: 'UTF8',
            fontSize: 'small',
            alignment: 'left'
          }
        }),
      });
      
      if (!printResponse.ok) {
        throw new Error('Print server error');
      }
      
      const result = await printResponse.json();
      res.json({ message: "Receipt printed successfully", result });
    } catch (error) {
      console.error("Error printing receipt:", error);
      res.status(500).json({ message: "Failed to print receipt" });
    }
  });

  // Check printer status
  app.get('/api/printer-status', isAuthenticated, async (req, res) => {
    try {
      const statusResponse = await fetch('http://localhost:3001/status');
      const status = await statusResponse.json();
      res.json(status);
    } catch (error) {
      console.error("Error checking printer status:", error);
      res.status(500).json({ message: "Failed to check printer status", connected: false });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
import { 
  Transaction, 
  InsertTransaction, 
  Settings,
  InsertSettings,
  TRANSACTION_CATEGORIES
} from "@shared/schema";

export interface IStorage {
  // Transaction methods
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByMonth(year: number, month: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Settings methods
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
  
  // Aggregation methods
  getMonthsWithTransactions(): Promise<{ year: number, month: number }[]>;
  getCategorySummaryByMonth(year: number, month: number): Promise<{ category: string, total: number }[]>;
}

export class MemStorage implements IStorage {
  private transactions: Map<number, Transaction>;
  private settings: Settings | undefined;
  private currentTransactionId: number;

  constructor() {
    this.transactions = new Map();
    this.currentTransactionId = 1;
    this.settings = {
      id: 1,
      smsPermissionGranted: false,
      darkMode: false,
      lastSyncTimestamp: null
    };
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => {
        const date = new Date(transaction.timestamp);
        return date.getFullYear() === year && date.getMonth() === month;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      timestamp: transaction.timestamp || new Date(),
      // Ensure nullable fields have null values instead of undefined
      merchantName: transaction.merchantName || null,
      smsBody: transaction.smsBody || null,
      smsId: transaction.smsId || null
    };
    
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    
    if (!existingTransaction) {
      return undefined;
    }
    
    // Properly handle nullable fields by ensuring they're set to null and not undefined
    const updatedTransaction: Transaction = {
      ...existingTransaction,
      ...transaction,
      // Ensure nullable fields maintain null values and aren't set to undefined
      merchantName: transaction.merchantName !== undefined ? transaction.merchantName : existingTransaction.merchantName,
      smsBody: transaction.smsBody !== undefined ? transaction.smsBody : existingTransaction.smsBody,
      smsId: transaction.smsId !== undefined ? transaction.smsId : existingTransaction.smsId
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(settings: Partial<InsertSettings>): Promise<Settings> {
    if (!this.settings) {
      this.settings = {
        id: 1,
        smsPermissionGranted: settings.smsPermissionGranted || false,
        darkMode: settings.darkMode || false,
        lastSyncTimestamp: settings.lastSyncTimestamp || null
      };
    } else {
      this.settings = {
        ...this.settings,
        ...settings
      };
    }
    
    return this.settings;
  }

  async getMonthsWithTransactions(): Promise<{ year: number, month: number }[]> {
    const months = new Set<string>();
    
    Array.from(this.transactions.values()).forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;
      months.add(yearMonth);
    });
    
    return Array.from(months).map(yearMonth => {
      const [year, month] = yearMonth.split('-').map(Number);
      return { year, month };
    }).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }

  async getCategorySummaryByMonth(year: number, month: number): Promise<{ category: string, total: number }[]> {
    const transactions = await this.getTransactionsByMonth(year, month);
    const categoryMap = new Map<string, number>();
    
    // Initialize all categories with 0
    TRANSACTION_CATEGORIES.forEach(category => {
      categoryMap.set(category, 0);
    });
    
    // Sum up transaction amounts by category (only debits)
    transactions
      .filter(transaction => transaction.type === 'debit')
      .forEach(transaction => {
        const currentTotal = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, currentTotal + transaction.amount);
      });
    
    // Convert map to array of objects
    return Array.from(categoryMap.entries())
      .map(([category, total]) => ({ category, total }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }
}

export const storage = new MemStorage();

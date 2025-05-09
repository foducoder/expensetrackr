import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define transaction categories
export const TRANSACTION_CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Entertainment",
  "Transportation",
  "Utilities",
  "Health",
  "Education",
  "Travel",
  "Groceries",
  "Investment",
  "Salary",
  "Rent",
  "Other Income",
  "Other Expense",
] as const;

// Define transaction types
export const TRANSACTION_TYPES = ["debit", "credit"] as const;

// Define transaction sources
export const TRANSACTION_SOURCES = [
  "UPI",
  "Debit Card",
  "Credit Card",
  "Net Banking",
  "ATM",
  "Other",
] as const;

// Transaction table schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  amount: doublePrecision("amount").notNull(),
  description: text("description").notNull(),
  merchantName: text("merchant_name"),
  category: text("category").$type<typeof TRANSACTION_CATEGORIES[number]>().notNull(),
  type: text("type").$type<typeof TRANSACTION_TYPES[number]>().notNull(),
  source: text("source").$type<typeof TRANSACTION_SOURCES[number]>().notNull(),
  smsBody: text("sms_body"),
  smsId: text("sms_id"),
});

// Configuration settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  smsPermissionGranted: boolean("sms_permission_granted").notNull().default(false),
  darkMode: boolean("dark_mode").notNull().default(false),
  lastSyncTimestamp: timestamp("last_sync_timestamp"),
});

// Create insert schemas
export const insertTransactionSchema = createInsertSchema(transactions, {
  category: z.enum(TRANSACTION_CATEGORIES),
  type: z.enum(TRANSACTION_TYPES),
  source: z.enum(TRANSACTION_SOURCES),
}).omit({ id: true });

export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });

// Create types for TypeScript
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingSchema>;

// Custom types for frontend use
export type MonthData = {
  month: string; // Format: "YYYY-MM"
  totalCredit: number;
  totalDebit: number;
  balance: number;
  transactions: Transaction[];
};

export type CategorySummary = {
  category: typeof TRANSACTION_CATEGORIES[number];
  amount: number;
  percentage: number;
  count: number;
};

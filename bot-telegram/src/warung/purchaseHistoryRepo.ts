import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export interface PurchaseRecordInput {
  chatId: number;
  telegramUserId: number | null;
  telegramUsername: string | null;
  orderId: string;
  transactionId: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  provider: string;
  storeName: string | null;
}

export interface PurchaseRecordRow {
  id: number;
  orderId: string;
  transactionId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  provider: string;
  storeName: string | null;
  createdAt: string;
}

interface PurchaseRecordDbRow {
  id: number;
  order_id: string;
  transaction_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  provider: string;
  store_name: string | null;
  created_at: string;
}

export class PurchaseHistoryRepository {
  private readonly db: Database.Database;

  constructor(dbFilePath: string) {
    const parentDir = path.dirname(dbFilePath);
    fs.mkdirSync(parentDir, { recursive: true });

    this.db = new Database(dbFilePath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS purchase_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        telegram_user_id INTEGER,
        telegram_username TEXT,
        order_id TEXT NOT NULL UNIQUE,
        transaction_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total_price INTEGER NOT NULL,
        provider TEXT NOT NULL,
        store_name TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_purchase_history_chat_created
      ON purchase_history(chat_id, created_at DESC);
    `);
  }

  savePurchase(input: PurchaseRecordInput): void {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO purchase_history (
        chat_id,
        telegram_user_id,
        telegram_username,
        order_id,
        transaction_id,
        product_id,
        product_name,
        quantity,
        total_price,
        provider,
        store_name
      ) VALUES (
        @chatId,
        @telegramUserId,
        @telegramUsername,
        @orderId,
        @transactionId,
        @productId,
        @productName,
        @quantity,
        @totalPrice,
        @provider,
        @storeName
      )
    `);

    stmt.run(input);
  }

  getRecentByChat(chatId: number, limit = 10): PurchaseRecordRow[] {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const stmt = this.db.prepare<[number, number], PurchaseRecordDbRow>(`
      SELECT
        id,
        order_id,
        transaction_id,
        product_name,
        quantity,
        total_price,
        provider,
        store_name,
        created_at
      FROM purchase_history
      WHERE chat_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `);
    const rows = stmt.all(chatId, safeLimit);
    return rows.map((row) => ({
      id: row.id,
      orderId: row.order_id,
      transactionId: row.transaction_id,
      productName: row.product_name,
      quantity: row.quantity,
      totalPrice: row.total_price,
      provider: row.provider,
      storeName: row.store_name,
      createdAt: row.created_at,
    }));
  }
}

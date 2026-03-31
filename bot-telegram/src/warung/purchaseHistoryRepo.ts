import { MongoClient, type Collection, type Document, type WithId } from "mongodb";

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

interface PurchaseHistoryDocument extends Document {
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
  createdAt: Date;
}

export class PurchaseHistoryRepository {
  private readonly client: MongoClient | null;
  private readonly dbName: string;
  private collection: Collection<PurchaseHistoryDocument> | null = null;
  private initialized = false;
  private readonly fallbackRows: PurchaseHistoryDocument[] = [];
  private usingInMemoryFallback = false;

  constructor(mongoUri?: string, dbName = "warung_agent") {
    const trimmedUri = mongoUri?.trim();
    this.client = trimmedUri ? new MongoClient(trimmedUri) : null;
    this.dbName = dbName;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    if (!this.client) {
      this.usingInMemoryFallback = true;
      this.initialized = true;
      console.warn("[warung-bot-telegram] MONGODB_URI missing. Falling back to in-memory purchase history.");
      return;
    }
    try {
      await this.client.connect();
      this.collection = this.client.db(this.dbName).collection<PurchaseHistoryDocument>("purchase_history");
      await this.collection.createIndex({ orderId: 1 }, { unique: true, name: "idx_purchase_history_order_id" });
      await this.collection.createIndex({ chatId: 1, createdAt: -1 }, { name: "idx_purchase_history_chat_created" });
    } catch (err) {
      this.usingInMemoryFallback = true;
      this.collection = null;
      console.warn("[warung-bot-telegram] Purchase history DB unavailable on startup. Falling back to in-memory DB.", err);
    }
    this.initialized = true;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
    this.initialized = false;
    this.collection = null;
  }

  async savePurchase(input: PurchaseRecordInput): Promise<void> {
    if (!this.initialized) {
      throw new Error("PurchaseHistoryRepository not initialized. Call init() first.");
    }
    if (this.usingInMemoryFallback || !this.collection) {
      if (this.fallbackRows.some((row) => row.orderId === input.orderId)) {
        return;
      }
      this.fallbackRows.push({
        ...input,
        createdAt: new Date(),
      });
      return;
    }
    const collection = this.collection;
    await collection.updateOne(
      { orderId: input.orderId },
      {
        $setOnInsert: {
          ...input,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  async getRecentByChat(chatId: number, limit = 10): Promise<PurchaseRecordRow[]> {
    if (!this.initialized) {
      throw new Error("PurchaseHistoryRepository not initialized. Call init() first.");
    }
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    if (this.usingInMemoryFallback || !this.collection) {
      const docs = this.fallbackRows
        .filter((doc) => doc.chatId === chatId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, safeLimit);
      return docs.map((doc, index) => ({
        id: index + 1,
        orderId: doc.orderId,
        transactionId: doc.transactionId,
        productName: doc.productName,
        quantity: doc.quantity,
        totalPrice: doc.totalPrice,
        provider: doc.provider,
        storeName: doc.storeName,
        createdAt: doc.createdAt.toISOString(),
      }));
    }
    const docs: Array<WithId<PurchaseHistoryDocument>> = await this.collection
      .find({ chatId })
      .sort({ createdAt: -1, _id: -1 })
      .limit(safeLimit)
      .toArray();

    return docs.map((doc, index) => ({
      id: index + 1,
      orderId: doc.orderId,
      transactionId: doc.transactionId,
      productName: doc.productName,
      quantity: doc.quantity,
      totalPrice: doc.totalPrice,
      provider: doc.provider,
      storeName: doc.storeName,
      createdAt: doc.createdAt.toISOString(),
    }));
  }
}

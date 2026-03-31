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
  private readonly client: MongoClient;
  private readonly dbName: string;
  private collection: Collection<PurchaseHistoryDocument> | null = null;
  private initialized = false;

  constructor(mongoUri: string, dbName = "warung_agent") {
    this.client = new MongoClient(mongoUri);
    this.dbName = dbName;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await this.client.connect();
    this.collection = this.client.db(this.dbName).collection<PurchaseHistoryDocument>("purchase_history");
    await this.collection.createIndex({ orderId: 1 }, { unique: true, name: "idx_purchase_history_order_id" });
    await this.collection.createIndex({ chatId: 1, createdAt: -1 }, { name: "idx_purchase_history_chat_created" });
    this.initialized = true;
  }

  async close(): Promise<void> {
    await this.client.close();
    this.initialized = false;
    this.collection = null;
  }

  private getCollection(): Collection<PurchaseHistoryDocument> {
    if (!this.collection) {
      throw new Error("PurchaseHistoryRepository not initialized. Call init() first.");
    }
    return this.collection;
  }

  async savePurchase(input: PurchaseRecordInput): Promise<void> {
    const collection = this.getCollection();
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
    const collection = this.getCollection();
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const docs: Array<WithId<PurchaseHistoryDocument>> = await collection
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

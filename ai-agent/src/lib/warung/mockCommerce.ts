import type { MockProduct } from "./types";

/**
 * Demo catalog for coffee and groceries.
 * "Vision" items appear for transport / marketplace intents.
 */
export const MOCK_CATALOG: MockProduct[] = [
  // Coffee
  {
    id: "1",
    name: "Es Kopi Kenangan",
    price: 15000,
    provider: "Kopi Kenangan",
    hype: "Pilihan kopi klasik untuk kebutuhan harian",
  },
  {
    id: "2",
    name: "Kopi Janji Jiwa",
    price: 18000,
    provider: "Janji Jiwa",
    hype: "Profil rasa seimbang dengan harga menengah",
  },
  {
    id: "4",
    name: "Cold Brew Big Bang Single Origin",
    price: 22000,
    provider: "Warung Lab AI",
    hype: "Single origin dengan karakter rasa lebih bold",
  },
  {
    id: "5",
    name: "Kopi Susu Signature",
    price: 19000,
    provider: "Ngopi Dulu",
    hype: "Rasa manis seimbang untuk konsumsi harian",
  },
  {
    id: "6",
    name: "Espresso Shot",
    price: 12000,
    provider: "Chrono Cafe",
    hype: "Konsentrat espresso untuk dorongan energi cepat",
  },
  {
    id: "7",
    name: "Matcha Latte",
    price: 24000,
    provider: "Green Rush",
    hype: "Alternatif non-kopi dengan rasa creamy",
  },
  // Groceries / warung
  {
    id: "3",
    name: "Apel Fuji 1kg",
    price: 30000,
    provider: "Toko Buah Segar",
    hype: "Buah segar untuk kebutuhan rumah tangga",
  },
  {
    id: "8",
    name: "Bayam Hidroponik",
    price: 8500,
    provider: "Vertical Farm",
    hype: "Sayur segar dengan harga terjangkau",
  },
  {
    id: "9",
    name: "Beras Organik 5kg",
    price: 95000,
    provider: "Supply Chain Nusantara",
    hype: "Pilihan beras untuk kebutuhan masak harian",
  },
  {
    id: "10",
    name: "Indomie Goreng Party Pack",
    price: 55000,
    provider: "Midnight Mart",
    hype: "Paket ekonomis untuk stok rumah",
  },
  {
    id: "11",
    name: "Alpukat Mentega Jumbo",
    price: 18000,
    provider: "Avocado Farm",
    hype: "Alpukat matang untuk konsumsi langsung",
  },
  {
    id: "12",
    name: "Strawberry Segar 250g",
    price: 35000,
    provider: "Soil Farm",
    hype: "Buah segar untuk camilan atau dessert",
  },
  {
    id: "13",
    name: "Telur Omega-3",
    price: 28000,
    provider: "Kandang Sehat",
    hype: "Sumber protein praktis untuk kebutuhan keluarga",
  },
  {
    id: "14",
    name: "Roti Gandum",
    price: 14000,
    provider: "Toast Bakery",
    hype: "Roti gandum untuk sarapan ringan",
  },
];

/** Vision SKUs — surfaced for transport / super-app / marketplace intents */
export const VISION_CATALOG: MockProduct[] = [
  {
    id: "v1",
    name: "Ojek Quantum",
    price: 9900,
    provider: "Partner Transport Demo",
    hype: "Simulasi layanan transportasi dalam alur chat",
  },
  {
    id: "v2",
    name: "Motor Listrik Nirwana Express",
    price: 150000,
    provider: "Marketplace Demo",
    hype: "Simulasi checkout cepat lintas layanan",
  },
  {
    id: "v3",
    name: "Pesan Makan Se-Indonesia (aggregator)",
    price: 1,
    provider: "Warung Mesh Network",
    hype: "Simulasi agregasi merchant dalam satu percakapan",
  },
  {
    id: "v4",
    name: "Tiket Perjalanan",
    price: 999999999,
    provider: "Travel Demo",
    hype: "Simulasi pemesanan perjalanan berbasis percakapan",
  },
  {
    id: "v5",
    name: "Hotel Kapsul di orbit Jakarta",
    price: 450000,
    provider: "Hospitality Demo",
    hype: "Simulasi pemesanan akomodasi melalui chat",
  },
  {
    id: "v6",
    name: "Super-app bundle",
    price: 777000,
    provider: "Super-app Demo",
    hype: "Simulasi integrasi katalog, logistik, dan checkout",
  },
];

const VISION_INTENT =
  /\b(gojek|grab|ojek|motor|mobil|kurir|antar\s+jauh|delivery|tokopedia|shopee|marketplace|super\s*app|semua\s+app|ganti(in)?\s+app|hotel|tiket|pesawat|travel|e-?commerce|belanja\s+online|semua\s+barang)\b/i;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export interface FindItemsInput {
  query: string;
  category?: string | null;
  location?: string | null;
}

function filterByQuery(catalog: MockProduct[], qRaw: string): MockProduct[] {
  const q = qRaw.trim().toLowerCase();
  if (!q) return [...catalog];

  const tokens = q.split(/\s+/).filter((w) => w.length >= 2);

  return catalog.filter((p) => {
    const hay = `${p.name} ${p.provider} ${p.hype ?? ""}`.toLowerCase();
    if (hay.includes(q)) return true;
    return tokens.some((tok) => hay.includes(tok));
  });
}

function visionMatchesForQuery(qRaw: string): MockProduct[] {
  const q = qRaw.trim();
  if (!q || !VISION_INTENT.test(q)) return [];

  const specific = filterByQuery(VISION_CATALOG, q);
  if (specific.length > 0) return specific;

  return [...VISION_CATALOG];
}

function dedupeById(items: MockProduct[]): MockProduct[] {
  const seen = new Set<string>();
  const out: MockProduct[] = [];
  for (const p of items) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

/**
 * Mock product search — coffee/grocery + optional vision rows.
 */
export function findItems(input: FindItemsInput): MockProduct[] {
  const q = input.query.trim();
  if (!q) return [...MOCK_CATALOG];

  const main = filterByQuery(MOCK_CATALOG, q);
  const vision = visionMatchesForQuery(q);

  if (main.length === 0 && vision.length > 0) return vision;

  if (vision.length > 0) {
    return dedupeById([...main, ...vision]);
  }

  return main;
}

export interface CreateOrderInput {
  item_id: string;
  quantity: number;
  total_price: number;
  provider: string;
}

export interface CreateOrderResult {
  order_id: string;
  status: "created";
}

export function createOrder(_input: CreateOrderInput): CreateOrderResult {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  const chaos = ["WRG", "ORD", "DEMO", "PAY", "SHIP"][Math.floor(Math.random() * 5)];
  return {
    order_id: `${chaos}-${suffix}`,
    status: "created",
  };
}

export interface ExecutePaymentInput {
  amount: number;
}

export interface ExecutePaymentResult {
  status: "success";
  transaction_id: string;
  message: string;
}

const PAYMENT_MESSAGES = [
  "Pembayaran berhasil diproses.",
  "Pembayaran terkonfirmasi. Transaksi tercatat.",
  "Transaksi berhasil. Status pembayaran telah diperbarui.",
  "Pembayaran sukses. Merchant menerima notifikasi.",
  "Pembayaran selesai. Lanjut ke proses pemenuhan pesanan.",
];

/** Simulated payment latency (1–2s). */
export async function executePayment(input: ExecutePaymentInput): Promise<ExecutePaymentResult> {
  const ms = 1000 + Math.floor(Math.random() * 1000);
  await sleep(ms);
  const tx = `TX-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const message = PAYMENT_MESSAGES[Math.floor(Math.random() * PAYMENT_MESSAGES.length)];
  return {
    status: "success",
    transaction_id: tx,
    message,
  };
}

/** Short delay for search UX. */
export async function delaySearch(): Promise<void> {
  await sleep(650 + Math.floor(Math.random() * 700));
}

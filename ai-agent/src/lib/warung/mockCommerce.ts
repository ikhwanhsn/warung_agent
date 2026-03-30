import type { MockProduct } from "./types";

/**
 * Today: coffee + groceries. “Vision” items appear when users ask for motor/ojek/marketplace/etc.
 * All prices are mock IDR for demo chaos.
 */
export const MOCK_CATALOG: MockProduct[] = [
  // Coffee chaos
  {
    id: "1",
    name: "Es Kopi Kenangan",
    price: 15000,
    provider: "Kopi Kenangan",
    hype: "Klasik, aman, cocok buat demo investor",
  },
  {
    id: "2",
    name: "Kopi Janji Jiwa",
    price: 18000,
    provider: "Janji Jiwa",
    hype: "Jiwa tenang, dompet ikut meditasi",
  },
  {
    id: "4",
    name: "Cold Brew Big Bang Single Origin",
    price: 22000,
    provider: "Warung Lab AI",
    hype: "Diseduh dengan algoritma “sedikit lebih keras dari kemarin”",
  },
  {
    id: "5",
    name: "Kopi Susu Gila Level 11",
    price: 19000,
    provider: "Ngopi Dulu Baru Mikir",
    hype: "Gula? Optional. Adrenaline? Built-in.",
  },
  {
    id: "6",
    name: "Espresso Shot Time-Travel",
    price: 12000,
    provider: "Chrono Café",
    hype: "Rasanya seperti sudah bangun padahal belum tidur",
  },
  {
    id: "7",
    name: "Matcha Latte Panik Deadline",
    price: 24000,
    provider: "Green Rush",
    hype: "Warna hijau, mood merah",
  },
  // Groceries / warung
  {
    id: "3",
    name: "Apel Fuji 1kg",
    price: 30000,
    provider: "Toko Buah Segar",
    hype: "1kg kebahagiaan + serat",
  },
  {
    id: "8",
    name: "Bayam Hidroponik Anti-Gravity",
    price: 8500,
    provider: "Vertical Farm 9000",
    hype: "Daunnya naik, harga tetap waras",
  },
  {
    id: "9",
    name: "Beras Organik 5kg (Desa Download)",
    price: 95000,
    provider: "Supply Chain Ngimpi",
    hype: "Mock logistics: instant, real life: nanti dulu",
  },
  {
    id: "10",
    name: "Indomie Goreng Party Pack",
    price: 55000,
    provider: "Midnight Strategy Co.",
    hype: "Hackathon fuel resmi",
  },
  {
    id: "11",
    name: "Alpukat Mentega Jumbo",
    price: 18000,
    provider: "Avocado DAO",
    hype: "Smooth seperti pitch deck",
  },
  {
    id: "12",
    name: "Strawberry Metaverse Farm 250g",
    price: 35000,
    provider: "Soil.exe",
    hype: "Manisnya 30% real, 70% storytelling",
  },
  {
    id: "13",
    name: "Telur Omega-3 Plot Twist",
    price: 28000,
    provider: "Kandang Narrative",
    hype: "Isi 6, kejutan filosofis 1",
  },
  {
    id: "14",
    name: "Roti Gandum “No Cap”",
    price: 14000,
    provider: "Toast Trust Layer",
    hype: "Gluten hadir, drama tidak",
  },
];

/** Roadmap fantasy SKUs — surfaced when user mentions transport / super-app / e-commerce giants */
export const VISION_CATALOG: MockProduct[] = [
  {
    id: "v1",
    name: "Ojek Quantum (simulasi)",
    price: 9900,
    provider: "Gojek∞ Beta",
    hype: "Routing: multiverse. Driver: belum hire. Ini cuma mock API ngabers.",
  },
  {
    id: "v2",
    name: "Motor Listrik Nirwana Express",
    price: 150000,
    provider: "Tokopedia Warp",
    hype: "Checkout 1 klik — di demo ini kliknya masih bohong tapi vision-nya serius.",
  },
  {
    id: "v3",
    name: "Pesan Makan Se-Indonesia (aggregator)",
    price: 1,
    provider: "Warung Mesh Network",
    hype: "Satu chat → ribuan warung. Roadmap; hari ini cuma JSON mock.",
  },
  {
    id: "v4",
    name: "Tiket Pesawat ke Bulan (ETA 2035)",
    price: 999999999,
    provider: "Lunar x402 Airways",
    hype: "Bayar pakai mimpi dulu, USDC nanti.",
  },
  {
    id: "v5",
    name: "Hotel Kapsul di orbit Jakarta",
    price: 450000,
    provider: "Grab Nebula Stays",
    hype: "Check-in: chat. Check-out: sadar ini demo.",
  },
  {
    id: "v6",
    name: "Tokopedia + Gojek + Warung merge pack",
    price: 777000,
    provider: "Super-App Singularity",
    hype: "Tagline kita: replace them all — slowly, then suddenly.",
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
 * Mock product search — groceries/coffee + optional “vision” roadmap rows.
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
  const chaos = ["WRG", "HYPE", "MOCK", "DEMO", "SHIP"][Math.floor(Math.random() * 5)];
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
  "Payment successful — dompet mock ikut senang.",
  "Berhasil! Dana (palsu) sudah masuk ke universe paralel merchant.",
  "Transaksi cleared. Bank sentral demo mencatat… tidak ada apa-apa, itu kan mock.",
  "Sukses! QRIS imajiner berkedip hijau.",
  "Payment OK. Gojek/Tokopedia asli belum tersentuh — ini rehearsal.",
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

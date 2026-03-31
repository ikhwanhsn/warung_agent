import type { MockProduct, MockStore } from "./types.js";
import { generateMockProducts } from "./mockCatalogGenerated.js";

/** Hand-authored seed rows; catalog is extended to 1000+ items via generator. */
const MOCK_CATALOG_SEED: MockProduct[] = [
  {
    id: "1",
    name: "Es Kopi Susu Gula Aren",
    price: 18000,
    provider: "Kopi Nusantara",
    hype: "Signature warung coffee dengan gula aren seimbang",
  },
  {
    id: "2",
    name: "Americano Hot",
    price: 16000,
    provider: "Brew Bros",
    hype: "Pilihan klasik low-calorie dengan rasa clean",
  },
  {
    id: "3",
    name: "Cappuccino",
    price: 22000,
    provider: "Brew Bros",
    hype: "Foam creamy untuk penikmat kopi susu",
  },
  {
    id: "4",
    name: "Cafe Latte",
    price: 21000,
    provider: "Brew Bros",
    hype: "Rasa lembut untuk minum harian",
  },
  {
    id: "5",
    name: "Flat White",
    price: 23000,
    provider: "Daily Roast",
    hype: "Tekstur silky dengan espresso bold",
  },
  {
    id: "6",
    name: "Mocha",
    price: 24000,
    provider: "Daily Roast",
    hype: "Perpaduan kopi dan coklat paling populer",
  },
  {
    id: "7",
    name: "Caramel Macchiato",
    price: 26000,
    provider: "Morning Cup",
    hype: "Manis karamel untuk boost mood",
  },
  {
    id: "8",
    name: "Cold Brew Original",
    price: 22000,
    provider: "Warung Lab AI",
    hype: "Seduhan dingin 12 jam, ringan dan smooth",
  },
  {
    id: "9",
    name: "Cold Brew Single Origin",
    price: 25000,
    provider: "Warung Lab AI",
    hype: "Single origin dengan aroma buah lebih kompleks",
  },
  {
    id: "10",
    name: "Espresso Shot Double",
    price: 14000,
    provider: "Chrono Cafe",
    hype: "Dorongan energi cepat untuk jam sibuk",
  },
  {
    id: "11",
    name: "Kopi Tubruk Robusta 200g",
    price: 28000,
    provider: "Gudang Kopi Rakyat",
    hype: "Bubuk robusta pekat untuk stok warung",
  },
  {
    id: "12",
    name: "Arabica Gayo Beans 250g",
    price: 68000,
    provider: "Aceh Origin",
    hype: "Whole beans premium dengan acidity seimbang",
  },
  {
    id: "13",
    name: "House Blend Beans 1kg",
    price: 230000,
    provider: "Roastery Sentral",
    hype: "Paket hemat untuk kebutuhan kedai harian",
  },
  {
    id: "14",
    name: "Drip Bag Ethiopian x10",
    price: 52000,
    provider: "Roastery Sentral",
    hype: "Praktis untuk seduh cepat tanpa mesin",
  },
  {
    id: "15",
    name: "V60 Filter Paper 100pcs",
    price: 35000,
    provider: "Manual Brew Supply",
    hype: "Filter kertas food grade untuk pour over",
  },
  {
    id: "16",
    name: "Oat Milk Barista 1L",
    price: 42000,
    provider: "Plant Based Co",
    hype: "Alternatif susu non-dairy untuk latte art",
  },
  {
    id: "17",
    name: "Fresh Milk UHT 1L",
    price: 21000,
    provider: "Dairy Fresh",
    hype: "Susu UHT untuk campuran minuman kopi",
  },
  {
    id: "18",
    name: "Vanilla Syrup 750ml",
    price: 59000,
    provider: "Barista Pantry",
    hype: "Sirup premium untuk menu flavored latte",
  },
  {
    id: "19",
    name: "Matcha Latte",
    price: 24000,
    provider: "Green Rush",
    hype: "Alternatif non-kopi dengan rasa creamy",
  },
  {
    id: "20",
    name: "Chocolate Hazelnut Latte",
    price: 27000,
    provider: "Morning Cup",
    hype: "Favorit pelanggan dengan profil rasa manis",
  },
  {
    id: "21",
    name: "Beras Premium 5kg",
    price: 89000,
    provider: "Supply Chain Nusantara",
    hype: "Beras pulen untuk kebutuhan rumah tangga",
  },
  {
    id: "22",
    name: "Beras Medium 5kg",
    price: 76000,
    provider: "Supply Chain Nusantara",
    hype: "Pilihan ekonomis untuk stok mingguan",
  },
  {
    id: "23",
    name: "Gula Pasir 1kg",
    price: 18000,
    provider: "Sembako Hemat",
    hype: "Bahan dasar dapur untuk minum dan masak",
  },
  {
    id: "24",
    name: "Garam Halus 500g",
    price: 7000,
    provider: "Sembako Hemat",
    hype: "Garam dapur halus untuk kebutuhan harian",
  },
  {
    id: "25",
    name: "Minyak Goreng 2L",
    price: 39000,
    provider: "Sembako Hemat",
    hype: "Kemasan keluarga untuk masak harian",
  },
  {
    id: "26",
    name: "Telur Ayam Negeri 1kg",
    price: 31000,
    provider: "Kandang Sehat",
    hype: "Sumber protein andalan warung",
  },
  {
    id: "27",
    name: "Roti Tawar Gandum",
    price: 16500,
    provider: "Toast Bakery",
    hype: "Sarapan praktis untuk semua umur",
  },
  {
    id: "28",
    name: "Indomie Goreng 5 Pack",
    price: 18500,
    provider: "Midnight Mart",
    hype: "Mie instan favorit untuk stok darurat",
  },
  {
    id: "29",
    name: "Mie Sedaap Soto 5 Pack",
    price: 19000,
    provider: "Midnight Mart",
    hype: "Varian mie kuah gurih untuk keluarga",
  },
  {
    id: "30",
    name: "Tepung Terigu 1kg",
    price: 14500,
    provider: "Pasar Dapur",
    hype: "Bahan wajib untuk gorengan dan baking",
  },
  {
    id: "31",
    name: "Bawang Merah 500g",
    price: 26000,
    provider: "Pasar Segar",
    hype: "Aromatik utama untuk masakan Indonesia",
  },
  {
    id: "32",
    name: "Bawang Putih 500g",
    price: 24000,
    provider: "Pasar Segar",
    hype: "Bumbu dasar serbaguna",
  },
  {
    id: "33",
    name: "Cabai Merah 250g",
    price: 18000,
    provider: "Pasar Segar",
    hype: "Tingkat pedas pas untuk sambal harian",
  },
  {
    id: "34",
    name: "Tomat Merah 500g",
    price: 12000,
    provider: "Pasar Segar",
    hype: "Tomat segar untuk sambal dan sup",
  },
  {
    id: "35",
    name: "Kentang 1kg",
    price: 21000,
    provider: "Pasar Segar",
    hype: "Umbi serbaguna untuk lauk dan camilan",
  },
  {
    id: "36",
    name: "Wortel 500g",
    price: 11000,
    provider: "Pasar Segar",
    hype: "Sayur kaya serat untuk menu sehat",
  },
  {
    id: "37",
    name: "Bayam 250g",
    price: 8500,
    provider: "Vertical Farm",
    hype: "Sayur hijau segar harga terjangkau",
  },
  {
    id: "38",
    name: "Kangkung 250g",
    price: 7000,
    provider: "Vertical Farm",
    hype: "Cocok untuk tumis cepat ala rumahan",
  },
  {
    id: "39",
    name: "Sawi Hijau 250g",
    price: 9000,
    provider: "Vertical Farm",
    hype: "Pelengkap mie dan capcay favorit",
  },
  {
    id: "40",
    name: "Tahu Putih 10pcs",
    price: 12000,
    provider: "Protein Corner",
    hype: "Sumber protein ekonomis untuk lauk",
  },
  {
    id: "41",
    name: "Tempe 1 Papan",
    price: 9000,
    provider: "Protein Corner",
    hype: "Tempe segar cocok untuk goreng atau orek",
  },
  {
    id: "42",
    name: "Ayam Fillet 500g",
    price: 42000,
    provider: "Fresh Poultry",
    hype: "Protein praktis tanpa tulang",
  },
  {
    id: "43",
    name: "Daging Sapi Slice 500g",
    price: 78000,
    provider: "Fresh Butcher",
    hype: "Irisan tipis untuk tumis dan yakiniku",
  },
  {
    id: "44",
    name: "Susu UHT Coklat 1L",
    price: 19500,
    provider: "Dairy Fresh",
    hype: "Minuman keluarga rasa coklat",
  },
  {
    id: "45",
    name: "Air Mineral 600ml x24",
    price: 48000,
    provider: "HydroMart",
    hype: "Karton hemat untuk stok rumah dan kantor",
  },
  {
    id: "46",
    name: "Kecap Manis 600ml",
    price: 24000,
    provider: "Pasar Dapur",
    hype: "Bumbu pelengkap untuk masakan nusantara",
  },
  {
    id: "47",
    name: "Saus Sambal 340ml",
    price: 13000,
    provider: "Pasar Dapur",
    hype: "Cocok untuk pelengkap gorengan dan mie",
  },
  {
    id: "48",
    name: "Sarden Kaleng 425g",
    price: 27000,
    provider: "Protein Corner",
    hype: "Lauk praktis siap olah kapan saja",
  },
  {
    id: "49",
    name: "Biskuit Marie 240g",
    price: 11500,
    provider: "Snack Hub",
    hype: "Camilan klasik untuk stok warung",
  },
  {
    id: "50",
    name: "Apel Fuji 1kg",
    price: 32000,
    provider: "Toko Buah Segar",
    hype: "Buah segar renyah untuk konsumsi harian",
  },
  {
    id: "51",
    name: "Pisang Cavendish 1 Sisir",
    price: 26000,
    provider: "Toko Buah Segar",
    hype: "Pilihan praktis untuk camilan sehat",
  },
  {
    id: "52",
    name: "Jeruk Medan 1kg",
    price: 28000,
    provider: "Toko Buah Segar",
    hype: "Sumber vitamin C untuk keluarga",
  },
  {
    id: "53",
    name: "Alpukat Mentega 1kg",
    price: 30000,
    provider: "Avocado Farm",
    hype: "Tekstur lembut cocok untuk jus dan salad",
  },
  {
    id: "54",
    name: "Strawberry Segar 250g",
    price: 35000,
    provider: "Soil Farm",
    hype: "Buah segar untuk dessert dan minuman",
  },
  {
    id: "55",
    name: "Pir Xiang Lie 1kg",
    price: 36000,
    provider: "Toko Buah Segar",
    hype: "Buah premium dengan rasa manis ringan",
  },
];

/** Extra generated demo rows (deterministic). Total catalog = seed + this. */
const GENERATED_PRODUCT_COUNT = 1000;

export const MOCK_CATALOG: MockProduct[] = [
  ...MOCK_CATALOG_SEED,
  ...generateMockProducts(MOCK_CATALOG_SEED.length + 1, GENERATED_PRODUCT_COUNT),
];

/** Telegram-safe cap for one message when a query matches many rows. */
export const MAX_PRODUCT_LIST_RESULTS = 50;

// ─── Mock store data ────────────────────────────────────────────────

interface StoreTemplate {
  name: string;
  address: string;
  baseDistanceKm: number;
  tags: string[];
}

const STORE_POOL: StoreTemplate[] = [
  { name: "Alfamart Jl. Sudirman", address: "Jl. Jend. Sudirman No.12, Kel. Karet Tengsin", baseDistanceKm: 0.3, tags: ["grocery", "drinks", "instant"] },
  { name: "Circle K Sabang", address: "Jl. H. Agus Salim No.58, Menteng", baseDistanceKm: 0.4, tags: ["grocery", "drinks", "instant"] },
  { name: "Indomaret Jl. Gatot Subroto", address: "Jl. Gatot Subroto No.45, Menteng Dalam", baseDistanceKm: 0.5, tags: ["grocery", "drinks", "instant"] },
  { name: "Toko Sembako Pak Andi", address: "Jl. Kebon Kacang III No.7, Tanah Abang", baseDistanceKm: 0.7, tags: ["grocery", "fresh"] },
  { name: "Warung Kelontong Bu Sri", address: "Jl. Tanah Abang II No.18, Jakarta Pusat", baseDistanceKm: 0.9, tags: ["grocery"] },
  { name: "Superindo Metro Thamrin", address: "Jl. MH Thamrin No.100, Thamrin City Lt.B1", baseDistanceKm: 1.2, tags: ["grocery", "drinks", "fresh"] },
  { name: "Giant Express Kuningan", address: "Jl. Prof. Dr. Satrio, Kuningan City", baseDistanceKm: 1.8, tags: ["grocery", "drinks", "fresh"] },
  { name: "Kopi Kenangan Grand Indonesia", address: "Grand Indonesia, West Mall Lt.1", baseDistanceKm: 0.4, tags: ["coffee"] },
  { name: "Fore Coffee Sudirman Plaza", address: "Sudirman Plaza, Jl. Jend. Sudirman Kav.76", baseDistanceKm: 0.6, tags: ["coffee"] },
  { name: "Tomoro Coffee Menteng", address: "Jl. HOS Cokroaminoto No.15, Menteng", baseDistanceKm: 0.8, tags: ["coffee"] },
  { name: "Starbucks Pacific Place", address: "Pacific Place, SCBD Lot 3-5, Lt.GF", baseDistanceKm: 1.0, tags: ["coffee"] },
  { name: "Pasar Tanah Abang", address: "Jl. Jatibaru Raya No.1, Tanah Abang", baseDistanceKm: 0.6, tags: ["fresh", "grocery"] },
  { name: "Pasar Santa Modern", address: "Jl. Cisanggiri II No.2, Kebayoran Baru", baseDistanceKm: 1.5, tags: ["fresh", "grocery", "coffee"] },
];

function classifyProduct(product: MockProduct): string[] {
  const n = product.name.toLowerCase();
  if (
    /\b(es kopi|americano|cappuccino|latte|flat white|mocha|macchiato|cold brew|espresso|affogato|cortado|piccolo|long black|kopi susu|matcha.*latte|chocolate.*latte)\b/i.test(
      n,
    )
  ) {
    return ["coffee"];
  }
  if (/^(es|hot|ice|signature|double shot|extra cream|classic|house)\s+/i.test(n.trim())) {
    return ["coffee"];
  }
  if (/\b(kopi arabica|arabica|beans|biji|roast|drip|capsule|cold brew concentrate|v60|filter|oat milk|fresh milk|vanilla syrup)\b/i.test(n)) {
    return ["coffee", "grocery"];
  }
  if (
    /\b(bayam|kangkung|sawi|wortel|kentang|tomat|terong|labu|oyong|cabai|bawang|brokoli|kembang kol|selada|seledri|kacang panjang|buncis|jamur|paprika|apel|pisang|jeruk|alpukat|strawberry|pir|ayam|daging|ikan|telur|tahu|tempe|udang)\b/i.test(
      n,
    )
  ) {
    return ["fresh", "grocery"];
  }
  return ["grocery"];
}

/** True when the catalog row is fresh fruit (not drinks that mention "buah" in marketing copy only). */
function isFruitProduct(p: MockProduct): boolean {
  const n = p.name.toLowerCase();
  return /\b(apel|pisang|jeruk|alpukat|strawberry|stroberi|blueberry|pir|nanas|semangka|melon|anggur|pepaya|leci|duku|kiwi|mangga|salak|jambu|buah naga)\b/i.test(
    n,
  );
}

/** User is browsing fruit only e.g. "ada buah apa", "buah apa saja". */
const FRUIT_BROWSE_RE =
  /\b(ada\s+)?buah\s+(apa|aja|saja)\b|\b(macam|jenis|list)\s+buah\b|^\s*buah\s+(apa|aja)\s*$/i;

export function findNearbyStores(product: MockProduct): MockStore[] {
  const tags = classifyProduct(product);
  const matching = STORE_POOL.filter((s) => tags.some((t) => s.tags.includes(t)));

  const stores: MockStore[] = matching.map((s, i) => ({
    id: `store-${i + 1}`,
    name: s.name,
    address: s.address,
    distanceKm: Math.max(0.1, parseFloat((s.baseDistanceKm + (Math.random() * 0.3 - 0.15)).toFixed(1))),
  }));

  stores.sort((a, b) => a.distanceKm - b.distanceKm);
  return stores.slice(0, 5);
}

// ─── Utility ────────────────────────────────────────────────────────

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

export function findItems(input: FindItemsInput): MockProduct[] {
  const q = input.query.trim();
  if (!q) return [...MOCK_CATALOG];
  const ql = q.toLowerCase();
  if (FRUIT_BROWSE_RE.test(ql)) {
    return MOCK_CATALOG.filter(isFruitProduct);
  }
  return filterByQuery(MOCK_CATALOG, q);
}

export interface CreateOrderInput {
  item_id: string;
  quantity: number;
  total_price: number;
  provider: string;
  store_name?: string;
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

export async function delaySearch(): Promise<void> {
  await sleep(650 + Math.floor(Math.random() * 700));
}

export async function delayLocationSearch(): Promise<void> {
  await sleep(500 + Math.floor(Math.random() * 500));
}

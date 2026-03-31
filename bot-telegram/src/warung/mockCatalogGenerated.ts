import type { MockProduct } from "./types.js";

/** Deterministic pseudo-random in [0, 1) from index (stable across runs). */
function det01(seed: number): number {
  const x = Math.sin(seed * 9999.1337) * 10000;
  return x - Math.floor(x);
}

function detInt(seed: number, min: number, max: number, step: number): number {
  const span = max - min;
  const steps = Math.floor(span / step);
  return min + Math.floor(det01(seed) * (steps + 1)) * step;
}

const COFFEE_SHOPS = [
  "Daily Roast",
  "Morning Cup",
  "Roastery Sentral",
  "Brew Bros",
  "Chrono Cafe",
  "Kopi Nusantara",
  "Warung Lab AI",
  "Aceh Origin",
  "Green Rush",
  "Vertical Farm",
  "Manual Brew Supply",
  "Plant Based Co",
  "Barista Pantry",
  "Gudang Kopi Rakyat",
  "Dairy Fresh",
  "Pasar Segar",
  "Toko Buah Segar",
  "Sembako Hemat",
  "Midnight Mart",
  "Snack Hub",
];

const STYLES = ["Es", "Hot", "Ice", "Signature", "Double Shot", "Extra Cream", "Classic", "House"];
const DRINKS = [
  "Americano",
  "Latte",
  "Cappuccino",
  "Mocha",
  "Flat White",
  "Macchiato",
  "Long Black",
  "Kopi Susu",
  "Affogato",
  "Cortado",
  "Piccolo",
  "Spanish Latte",
  "Dirty Latte",
  "Vanilla Latte",
  "Hazelnut Latte",
  "Caramel Latte",
  "Honey Latte",
  "Pandan Latte",
  "Tiramisu Latte",
  "Salted Caramel Latte",
];

const ORIGINS = [
  "Gayo",
  "Toraja",
  "Mandheling",
  "Sidikalang",
  "Kintamani",
  "Flores",
  "Papua",
  "Jember",
  "Ijen",
  "Lintong",
];

const BEAN_FORMS = [
  "Beans 250g",
  "Beans 500g",
  "Beans 1kg",
  "Ground 250g",
  "Drip Bag x5",
  "Drip Bag x10",
  "Capsule x12",
  "Cold Brew Concentrate 500ml",
];

const VEG = [
  "Bayam",
  "Kangkung",
  "Sawi Hijau",
  "Sawi Putih",
  "Wortel",
  "Kentang",
  "Tomat",
  "Terong",
  "Oyong",
  "Labu Siam",
  "Kacang Panjang",
  "Buncis",
  "Brokoli",
  "Kembang Kol",
  "Selada",
  "Daun Bawang",
  "Seledri",
  "Jamur Kuping",
  "Jamur Tiram",
  "Paprika Merah",
];

const VEG_W = ["150g", "200g", "250g", "300g", "400g", "500g"];

const FRUITS = [
  "Apel Fuji",
  "Apel Malang",
  "Pisang Cavendish",
  "Pisang Raja",
  "Jeruk Medan",
  "Jeruk Sunkist",
  "Anggur Hijau",
  "Anggur Merah",
  "Strawberry",
  "Blueberry",
  "Melon Sky",
  "Semangka",
  "Pepaya California",
  "Alpukat Mentega",
  "Pir Xiang Lie",
  "Nanas Honi",
  "Mangga Harum Manis",
  "Salak Pondoh",
  "Jambu Kristal",
  "Buah Naga",
];

const FRUIT_W = ["250g", "500g", "750g", "1kg", "1.2kg"];

const SEMBAKO = [
  "Beras Premium 5kg",
  "Beras Medium 5kg",
  "Beras Organik 2kg",
  "Gula Pasir 1kg",
  "Gula Aren 500g",
  "Garam Halus 500g",
  "Minyak Goreng 1L",
  "Minyak Goreng 2L",
  "Tepung Terigu 1kg",
  "Tepung Beras 500g",
  "Mie Instan 5 Pack",
  "Susu UHT 1L",
  "Madu 350g",
  "Teh Celup 25s",
  "Kopi Instan Sachet 20s",
];

const SNACK = [
  "Kerupuk Udang 250g",
  "Keripik Singkong 150g",
  "Biskuit Coklat 200g",
  "Wafer 150g",
  "Coklat Batangan 100g",
  "Permen Mint",
  "Kacang Campur 200g",
  "Abon Sapi 100g",
];

const SAUCE = [
  "Kecap Manis 600ml",
  "Saus Sambal 340ml",
  "Saus Tomat 500g",
  "Sarden Kaleng 425g",
  "Mayonnaise 300ml",
  "Cuka Masak 200ml",
];

const PROTEIN = [
  "Telur Ayam 1kg",
  "Ayam Potong 1kg",
  "Ayam Fillet 500g",
  "Daging Sapi Slice 500g",
  "Ikan Kakap 500g",
  "Ikan Tongkol 500g",
  "Udang Segar 250g",
  "Tahu Putih 10pcs",
  "Tempe 2 Papan",
  "Bakso 250g",
];

/**
 * Builds `count` additional demo products with unique ids starting at `startNumericId`.
 * Names mix Indonesian grocery + coffee; prices in realistic IDR bands.
 */
export function generateMockProducts(startNumericId: number, count: number): MockProduct[] {
  const out: MockProduct[] = [];

  for (let k = 0; k < count; k++) {
    const id = String(startNumericId + k);
    const s = startNumericId + k;
    const kind = k % 10;
    const v = Math.floor(k / 10);

    let name: string;
    let provider: string;
    let hype: string;
    let minP: number;
    let maxP: number;

    switch (kind) {
      case 0:
      case 1: {
        const st = STYLES[(v + kind) % STYLES.length];
        const dr = DRINKS[(v * 2 + kind * 3) % DRINKS.length];
        const or = ORIGINS[v % ORIGINS.length];
        name = `${st} ${dr} ${or}`;
        provider = COFFEE_SHOPS[v % COFFEE_SHOPS.length];
        hype = `Racikan demo ${or} — cocok untuk teman kerja`;
        minP = 12000;
        maxP = 42000;
        break;
      }
      case 2: {
        const form = BEAN_FORMS[v % BEAN_FORMS.length];
        const or = ORIGINS[(v + 3) % ORIGINS.length];
        name = `Kopi Arabica ${or} ${form}`;
        provider = COFFEE_SHOPS[(v + 5) % COFFEE_SHOPS.length];
        hype = `Profil rasa demo dari wilayah ${or}`;
        minP = 28000;
        maxP = 320000;
        break;
      }
      case 3: {
        const veg = VEG[v % VEG.length];
        const w = VEG_W[(v + kind) % VEG_W.length];
        name = `${veg} ${w}`;
        provider = v % 2 === 0 ? "Vertical Farm" : "Pasar Segar";
        hype = "Sayur segar untuk masak harian";
        minP = 4500;
        maxP = 32000;
        break;
      }
      case 4: {
        const fr = FRUITS[v % FRUITS.length];
        const w = FRUIT_W[v % FRUIT_W.length];
        name = `${fr} ${w}`;
        provider = v % 3 === 0 ? "Toko Buah Segar" : v % 3 === 1 ? "Soil Farm" : "Avocado Farm";
        hype = "Buah segar untuk camilan keluarga";
        minP = 12000;
        maxP = 98000;
        break;
      }
      case 5: {
        name = SEMBAKO[v % SEMBAKO.length];
        provider = "Sembako Hemat";
        hype = "Stok dapur untuk kebutuhan mingguan";
        minP = 8000;
        maxP = 120000;
        break;
      }
      case 6: {
        name = SNACK[v % SNACK.length];
        provider = "Snack Hub";
        hype = "Camilan untuk warung & rumah";
        minP = 5000;
        maxP = 52000;
        break;
      }
      case 7: {
        name = SAUCE[v % SAUCE.length];
        provider = "Pasar Dapur";
        hype = "Pelengkap masakan nusantara";
        minP = 7000;
        maxP = 42000;
        break;
      }
      case 8:
      case 9: {
        name = PROTEIN[v % PROTEIN.length];
        provider = v % 2 === 0 ? "Fresh Poultry" : "Protein Corner";
        hype = "Protein segar untuk lauk";
        minP = 9000;
        maxP = 145000;
        break;
      }
      default: {
        name = `Item Demo ${id}`;
        provider = "Supply Chain Nusantara";
        hype = "Item katalog demo";
        minP = 10000;
        maxP = 50000;
      }
    }

    const price = detInt(s * 31 + kind * 17, minP, maxP, 500);

    out.push({
      id,
      name,
      price,
      provider,
      hype,
    });
  }

  return out;
}

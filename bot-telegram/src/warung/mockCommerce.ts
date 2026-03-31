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
  {
    id: "56",
    name: "Nugget Ayam 500g",
    price: 39500,
    provider: "Protein Corner",
    hype: "Frozen food praktis untuk stok rumah",
  },
  {
    id: "57",
    name: "Sosis Sapi 375g",
    price: 28500,
    provider: "Protein Corner",
    hype: "Lauk cepat saji untuk sarapan",
  },
  {
    id: "58",
    name: "Bakso Sapi Frozen 500g",
    price: 33500,
    provider: "Protein Corner",
    hype: "Pelengkap mie dan sup favorit keluarga",
  },
  {
    id: "59",
    name: "Sarden Tuna Kaleng 185g",
    price: 16500,
    provider: "Midnight Mart",
    hype: "Lauk kaleng siap masak kapan saja",
  },
  {
    id: "60",
    name: "Kornet Sapi Kaleng 198g",
    price: 23800,
    provider: "Midnight Mart",
    hype: "Praktis untuk isian roti dan nasi goreng",
  },
  {
    id: "61",
    name: "Oatmeal Instan 800g",
    price: 48500,
    provider: "Sembako Hemat",
    hype: "Sarapan sehat dan cepat disiapkan",
  },
  {
    id: "62",
    name: "Sereal Coklat 300g",
    price: 32900,
    provider: "Sembako Hemat",
    hype: "Menu sarapan favorit anak",
  },
  {
    id: "63",
    name: "Roti Sari Roti Tawar",
    price: 17000,
    provider: "Toast Bakery",
    hype: "Roti tawar praktis untuk sarapan",
  },
  {
    id: "64",
    name: "Donat Coklat Isi 4pcs",
    price: 18900,
    provider: "Toast Bakery",
    hype: "Camilan manis siap santap",
  },
  {
    id: "65",
    name: "Nasi Bowl Ayam Teriyaki",
    price: 29500,
    provider: "Ready Meal Corner",
    hype: "Makanan siap saji untuk jam sibuk",
  },
  {
    id: "66",
    name: "Bento Beef Yakiniku",
    price: 33900,
    provider: "Ready Meal Corner",
    hype: "Menu microwave praktis dan mengenyangkan",
  },
  {
    id: "67",
    name: "Keripik Kentang Chitato 68g",
    price: 10800,
    provider: "Snack Hub",
    hype: "Snack gurih untuk teman kerja",
  },
  {
    id: "68",
    name: "Keripik Singkong Qtela 60g",
    price: 9900,
    provider: "Snack Hub",
    hype: "Camilan renyah rasa nusantara",
  },
  {
    id: "69",
    name: "Biskuit Roma Kelapa 300g",
    price: 14200,
    provider: "Snack Hub",
    hype: "Biskuit klasik untuk stok warung",
  },
  {
    id: "70",
    name: "Oreo Vanilla 137g",
    price: 12500,
    provider: "Snack Hub",
    hype: "Biskuit sandwich favorit keluarga",
  },
  {
    id: "71",
    name: "Cokelat SilverQueen 65g",
    price: 17800,
    provider: "Snack Hub",
    hype: "Cokelat premium untuk hadiah kecil",
  },
  {
    id: "72",
    name: "Cadbury Dairy Milk 62g",
    price: 18900,
    provider: "Snack Hub",
    hype: "Rasa cokelat creamy yang populer",
  },
  {
    id: "73",
    name: "Permen Mint Pack 120g",
    price: 8900,
    provider: "Snack Hub",
    hype: "Menyegarkan napas saat beraktivitas",
  },
  {
    id: "74",
    name: "Chewing Gum Spearmint 20pcs",
    price: 10800,
    provider: "Snack Hub",
    hype: "Permen karet untuk kebutuhan harian",
  },
  {
    id: "75",
    name: "Aqua 1500ml",
    price: 6500,
    provider: "HydroMart",
    hype: "Air mineral kemasan besar untuk harian",
  },
  {
    id: "76",
    name: "Le Minerale 1500ml",
    price: 6200,
    provider: "HydroMart",
    hype: "Air mineral praktis untuk keluarga",
  },
  {
    id: "77",
    name: "Teh Botol Sosro 450ml",
    price: 5600,
    provider: "Drink Station",
    hype: "Teh manis siap minum favorit",
  },
  {
    id: "78",
    name: "Teh Kotak Jasmine 300ml",
    price: 5200,
    provider: "Drink Station",
    hype: "Teh kotak dingin untuk teman makan",
  },
  {
    id: "79",
    name: "Kopi Kapal Api Sachet 10s",
    price: 13800,
    provider: "Drink Station",
    hype: "Kopi sachet ekonomis untuk stok",
  },
  {
    id: "80",
    name: "Good Day Cappuccino 5s",
    price: 9800,
    provider: "Drink Station",
    hype: "Minuman kopi instan rasa creamy",
  },
  {
    id: "81",
    name: "Coca-Cola 1L",
    price: 11200,
    provider: "Drink Station",
    hype: "Minuman soda untuk acara keluarga",
  },
  {
    id: "82",
    name: "Fanta Orange 1L",
    price: 10900,
    provider: "Drink Station",
    hype: "Soda rasa jeruk untuk santai",
  },
  {
    id: "83",
    name: "Kratingdaeng 150ml",
    price: 7200,
    provider: "Drink Station",
    hype: "Energy drink untuk dorongan stamina",
  },
  {
    id: "84",
    name: "Extra Joss Active 5s",
    price: 7600,
    provider: "Drink Station",
    hype: "Suplemen energi praktis sachet",
  },
  {
    id: "85",
    name: "Ultra Milk Full Cream 1L",
    price: 19500,
    provider: "Dairy Fresh",
    hype: "Susu UHT untuk kebutuhan keluarga",
  },
  {
    id: "86",
    name: "Indomilk Coklat 190ml",
    price: 5300,
    provider: "Dairy Fresh",
    hype: "Susu kotak favorit anak",
  },
  {
    id: "87",
    name: "Jus Jeruk Kemasan 1L",
    price: 16800,
    provider: "Drink Station",
    hype: "Minuman buah praktis untuk sarapan",
  },
  {
    id: "88",
    name: "Sabun Mandi Batang 90g",
    price: 6200,
    provider: "Care Corner",
    hype: "Sabun harian dengan aroma segar",
  },
  {
    id: "89",
    name: "Shampoo Anti Dandruff 170ml",
    price: 28900,
    provider: "Care Corner",
    hype: "Perawatan rambut untuk pemakaian rutin",
  },
  {
    id: "90",
    name: "Conditioner Smooth 160ml",
    price: 25200,
    provider: "Care Corner",
    hype: "Membantu rambut terasa lebih lembut",
  },
  {
    id: "91",
    name: "Pasta Gigi 190g",
    price: 13800,
    provider: "Care Corner",
    hype: "Perawatan gigi keluarga tiap hari",
  },
  {
    id: "92",
    name: "Sikat Gigi Soft",
    price: 7900,
    provider: "Care Corner",
    hype: "Sikat gigi nyaman untuk penggunaan harian",
  },
  {
    id: "93",
    name: "Deodoran Roll On 45ml",
    price: 19800,
    provider: "Care Corner",
    hype: "Perlindungan harian anti bau badan",
  },
  {
    id: "94",
    name: "Facial Wash 100ml",
    price: 27900,
    provider: "Care Corner",
    hype: "Pembersih wajah basic untuk daily routine",
  },
  {
    id: "95",
    name: "Sunscreen SPF50 30ml",
    price: 34800,
    provider: "Care Corner",
    hype: "Perlindungan kulit untuk aktivitas luar",
  },
  {
    id: "96",
    name: "Pembalut Malam 10pcs",
    price: 14500,
    provider: "Care Corner",
    hype: "Kenyamanan ekstra untuk malam hari",
  },
  {
    id: "97",
    name: "Pantyliner 20pcs",
    price: 13200,
    provider: "Care Corner",
    hype: "Praktis untuk perlindungan harian",
  },
  {
    id: "98",
    name: "Popok Bayi M 24pcs",
    price: 52800,
    provider: "Baby Needs",
    hype: "Popok ekonomis untuk stok mingguan",
  },
  {
    id: "99",
    name: "Deterjen Bubuk 800g",
    price: 17800,
    provider: "Home Care",
    hype: "Deterjen andalan untuk cucian harian",
  },
  {
    id: "100",
    name: "Pewangi Pakaian 900ml",
    price: 16200,
    provider: "Home Care",
    hype: "Aroma tahan lama untuk pakaian",
  },
  {
    id: "101",
    name: "Sabun Cuci Piring 800ml",
    price: 14900,
    provider: "Home Care",
    hype: "Membersihkan lemak membandel dengan cepat",
  },
  {
    id: "102",
    name: "Pembersih Lantai 780ml",
    price: 17200,
    provider: "Home Care",
    hype: "Wangi segar untuk kebersihan rumah",
  },
  {
    id: "103",
    name: "Tisu Wajah 250s",
    price: 12200,
    provider: "Home Care",
    hype: "Tisu lembut untuk kebutuhan harian",
  },
  {
    id: "104",
    name: "Tissue Roll 10 Roll",
    price: 29800,
    provider: "Home Care",
    hype: "Kebutuhan rumah tangga bulanan",
  },
  {
    id: "105",
    name: "Kantong Sampah Besar 20pcs",
    price: 11800,
    provider: "Home Care",
    hype: "Plastik sampah kuat untuk dapur",
  },
  {
    id: "106",
    name: "Korek Gas Refill",
    price: 6500,
    provider: "Daily Utility",
    hype: "Kebutuhan dapur dan darurat harian",
  },
  {
    id: "107",
    name: "Lampu LED 10W",
    price: 22900,
    provider: "Daily Utility",
    hype: "Lampu hemat energi untuk rumah",
  },
  {
    id: "108",
    name: "Baterai AA Alkaline 2pcs",
    price: 13900,
    provider: "Daily Utility",
    hype: "Baterai untuk remote dan perangkat kecil",
  },
  {
    id: "109",
    name: "Charger USB 2A",
    price: 39800,
    provider: "Daily Utility",
    hype: "Charger basic untuk penggunaan sehari-hari",
  },
  {
    id: "110",
    name: "Kabel Data Type-C 1m",
    price: 28500,
    provider: "Daily Utility",
    hype: "Kabel isi daya cepat untuk perangkat modern",
  },
  {
    id: "111",
    name: "Payung Lipat",
    price: 45900,
    provider: "Daily Utility",
    hype: "Perlindungan praktis saat hujan",
  },
  {
    id: "112",
    name: "Pulpen Hitam 3pcs",
    price: 8400,
    provider: "Daily Utility",
    hype: "Alat tulis wajib untuk rumah dan kantor",
  },
  {
    id: "113",
    name: "Buku Tulis 38 Lembar",
    price: 5900,
    provider: "Daily Utility",
    hype: "Kebutuhan sekolah dan catatan harian",
  },
  {
    id: "114",
    name: "Paracetamol 10 Tablet",
    price: 7800,
    provider: "Health Corner",
    hype: "Obat penurun demam dan pereda nyeri",
  },
  {
    id: "115",
    name: "Obat Flu & Batuk Sirup 60ml",
    price: 23800,
    provider: "Health Corner",
    hype: "Membantu meredakan gejala flu ringan",
  },
  {
    id: "116",
    name: "Vitamin C 500mg 10 Tablet",
    price: 16900,
    provider: "Health Corner",
    hype: "Suplemen daya tahan tubuh harian",
  },
  {
    id: "117",
    name: "Minyak Kayu Putih 60ml",
    price: 25200,
    provider: "Health Corner",
    hype: "Andalan keluarga untuk hangatkan badan",
  },
  {
    id: "118",
    name: "Obat Maag Sachet 6s",
    price: 13200,
    provider: "Health Corner",
    hype: "Pereda keluhan lambung setelah makan",
  },
  {
    id: "119",
    name: "Voucher Pulsa 50K",
    price: 50000,
    provider: "Digital Service",
    hype: "Top up pulsa cepat tanpa ribet",
  },
  {
    id: "120",
    name: "Token Listrik PLN 100K",
    price: 100000,
    provider: "Digital Service",
    hype: "Isi ulang listrik prabayar instan",
  },
  {
    id: "121",
    name: "Top Up OVO 50K",
    price: 50000,
    provider: "Digital Service",
    hype: "Isi saldo e-wallet untuk transaksi harian",
  },
  {
    id: "122",
    name: "Voucher Game 60 Diamonds",
    price: 16000,
    provider: "Digital Service",
    hype: "Voucher game populer untuk top up cepat",
  },
  {
    id: "123",
    name: "Top Up GoPay 50K",
    price: 50000,
    provider: "Digital Service",
    hype: "Isi saldo GoPay instan di kasir",
  },
  {
    id: "124",
    name: "Top Up DANA 50K",
    price: 50000,
    provider: "Digital Service",
    hype: "Top up e-wallet untuk transaksi harian",
  },
  {
    id: "125",
    name: "Voucher Paket Data 10GB",
    price: 48000,
    provider: "Digital Service",
    hype: "Paket internet cepat tanpa registrasi rumit",
  },
  {
    id: "126",
    name: "Voucher Tiket Kereta Lokal",
    price: 75000,
    provider: "Digital Service",
    hype: "Pembelian tiket transportasi dari minimarket",
  },
  {
    id: "127",
    name: "Pembayaran BPJS Kesehatan",
    price: 100000,
    provider: "Digital Service",
    hype: "Layanan bayar tagihan BPJS bulanan",
  },
  {
    id: "128",
    name: "Pembayaran Tagihan Air PDAM",
    price: 85000,
    provider: "Digital Service",
    hype: "Pembayaran tagihan air rumah tangga",
  },
  {
    id: "129",
    name: "Pembayaran Listrik Pascabayar",
    price: 150000,
    provider: "Digital Service",
    hype: "Bayar listrik bulanan langsung di kasir",
  },
  {
    id: "130",
    name: "Tarik Tunai Minimarket",
    price: 2500,
    provider: "Service Counter",
    hype: "Layanan tarik tunai cepat tanpa ATM",
  },
  {
    id: "131",
    name: "Setor Tunai Minimarket",
    price: 3000,
    provider: "Service Counter",
    hype: "Layanan setor tunai ke rekening terpilih",
  },
  {
    id: "132",
    name: "Transfer ATM Bersama",
    price: 6500,
    provider: "Service Counter",
    hype: "Akses transfer antar bank via mesin ATM",
  },
  {
    id: "133",
    name: "Layanan Pickup KlikIndomaret",
    price: 0,
    provider: "Service Counter",
    hype: "Ambil pesanan online di gerai terdekat",
  },
  {
    id: "134",
    name: "Layanan Delivery GoMart",
    price: 0,
    provider: "Service Counter",
    hype: "Pengantaran belanja minimarket ke rumah",
  },
  {
    id: "135",
    name: "Point Coffee Latte Fresh",
    price: 18000,
    provider: "Coffee Corner",
    hype: "Kopi fresh brew dari mesin in-store",
  },
  {
    id: "136",
    name: "Americano Mesin Kopi",
    price: 15000,
    provider: "Coffee Corner",
    hype: "Pilihan kopi hitam cepat saji",
  },
  {
    id: "137",
    name: "Fried Chicken Crispy 2pcs",
    price: 26000,
    provider: "Ready Food Corner",
    hype: "Ayam goreng hangat siap santap",
  },
  {
    id: "138",
    name: "Burger Beef Ready",
    price: 22000,
    provider: "Ready Food Corner",
    hype: "Menu cepat saji untuk makan praktis",
  },
  {
    id: "139",
    name: "Hotdog Classic",
    price: 18000,
    provider: "Ready Food Corner",
    hype: "Snack gurih favorit di food corner",
  },
  {
    id: "140",
    name: "Ice Cream Cup Vanilla",
    price: 12000,
    provider: "Ready Food Corner",
    hype: "Ice cream dingin untuk camilan cepat",
  },
  {
    id: "141",
    name: "Kaos Kaki Sekolah 1 Pasang",
    price: 14500,
    provider: "Daily Utility",
    hype: "Kebutuhan harian random item minimarket",
  },
  {
    id: "142",
    name: "Mainan Anak Mini Puzzle",
    price: 19900,
    provider: "Seasonal Rack",
    hype: "Mainan kecil untuk pembelian impulsif",
  },
  {
    id: "143",
    name: "Spatula Silikon Dapur",
    price: 17500,
    provider: "Home Utility Hub",
    hype: "Alat dapur kecil untuk kebutuhan rumah",
  },
  {
    id: "144",
    name: "Masker Medis 10pcs",
    price: 12000,
    provider: "Care Corner",
    hype: "Perlengkapan kesehatan harian",
  },
  {
    id: "145",
    name: "Hair Tie 6pcs",
    price: 8900,
    provider: "Care Corner",
    hype: "Aksesori kecil kebutuhan sehari-hari",
  },
  {
    id: "146",
    name: "Paket Hampers Lebaran Mini",
    price: 99000,
    provider: "Seasonal Rack",
    hype: "Produk promo musiman periode Lebaran",
  },
  {
    id: "147",
    name: "Parcel Natal Snack Box",
    price: 129000,
    provider: "Seasonal Rack",
    hype: "Produk promo musiman periode Natal",
  },
  {
    id: "148",
    name: "Kembang Api Tahun Baru Pack",
    price: 45000,
    provider: "Seasonal Rack",
    hype: "Produk musiman untuk perayaan akhir tahun",
  },
  {
    id: "149",
    name: "Paket Alat Tulis Sekolah",
    price: 25500,
    provider: "Daily Utility",
    hype: "Bundle pulpen dan buku untuk back-to-school",
  },
  {
    id: "150",
    name: "Tahu Isi Frozen 10pcs",
    price: 24500,
    provider: "Protein Corner",
    hype: "Camilan beku siap goreng untuk stok rumah",
  },
];

/** Extra generated demo rows (deterministic). Total catalog = seed + this. */
const GENERATED_PRODUCT_COUNT = 1600;

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

const SEARCH_STOPWORDS = new Set([
  "beli",
  "beliin",
  "pesan",
  "order",
  "mau",
  "dong",
  "tolong",
  "cari",
  "yang",
  "dan",
  "atau",
  "ya",
  "nih",
  "aku",
  "saya",
  "buat",
  "untuk",
  "butuh",
  "kebutuhan",
  "ada",
  "stok",
  "apa",
  "saja",
  "aja",
  "termurah",
  "murah",
]);

const TOKEN_SYNONYMS: Record<string, string[]> = {
  mi: ["mie", "indomie", "sedaap"],
  mie: ["mi", "indomie", "sedaap"],
  indomi: ["indomie"],
  kopi: ["coffee", "espresso", "americano", "latte", "cappuccino"],
  susu: ["milk", "uht"],
  telur: ["egg"],
  beras: ["rice"],
  pedas: ["cabai", "sambal"],
  stroberi: ["strawberry"],
  strawberry: ["stroberi"],
  buah: ["apel", "pisang", "jeruk", "alpukat", "pir", "strawberry", "stroberi"],
  sayur: ["bayam", "kangkung", "sawi", "wortel", "kentang", "tomat", "brokoli"],
  ayam: ["fillet", "nugget", "sosis"],
};

function normalizeToken(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim()
    .toLowerCase();
}

function tokenizeForSearch(raw: string): string[] {
  const base = raw
    .toLowerCase()
    .split(/\s+/)
    .map(normalizeToken)
    .filter((t) => t.length >= 2 && !SEARCH_STOPWORDS.has(t));
  return Array.from(new Set(base));
}

function expandQueryTokens(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  for (const token of tokens) {
    const synonyms = TOKEN_SYNONYMS[token];
    if (!synonyms) continue;
    for (const syn of synonyms) {
      const n = normalizeToken(syn);
      if (n.length >= 2) expanded.add(n);
    }
  }
  return Array.from(expanded);
}

function scoreProductMatch(
  product: MockProduct,
  queryTokens: string[],
  expandedTokens: string[],
  originalQuery: string,
): number {
  const name = product.name.toLowerCase();
  const provider = product.provider.toLowerCase();
  const hype = (product.hype ?? "").toLowerCase();
  const hay = `${name} ${provider} ${hype}`;

  let score = 0;
  if (hay.includes(originalQuery)) score += 90;
  if (name.includes(originalQuery)) score += 40;

  let matchedCore = 0;
  for (const token of queryTokens) {
    if (name.includes(token)) {
      score += 30;
      matchedCore += 1;
      continue;
    }
    if (provider.includes(token)) {
      score += 16;
      matchedCore += 1;
      continue;
    }
    if (hype.includes(token)) {
      score += 8;
      matchedCore += 1;
    }
  }

  for (const token of expandedTokens) {
    if (queryTokens.includes(token)) continue;
    if (name.includes(token)) score += 8;
    else if (hay.includes(token)) score += 3;
  }

  if (matchedCore >= 2) score += 25;
  if (matchedCore === queryTokens.length && queryTokens.length > 0) score += 20;
  if (queryTokens.length > 0 && matchedCore === 0) score -= 30;

  return score;
}

function filterByQuery(catalog: MockProduct[], qRaw: string): MockProduct[] {
  const q = qRaw.trim().toLowerCase();
  if (!q) return [...catalog];

  const queryTokens = tokenizeForSearch(q);
  const expandedTokens = expandQueryTokens(queryTokens);
  const ranked = catalog
    .map((product) => ({
      product,
      score: scoreProductMatch(product, queryTokens, expandedTokens, q),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price || a.product.name.localeCompare(b.product.name))
    .map((row) => row.product);

  if (ranked.length > 0) return ranked;

  return catalog.filter((p) => {
    const hay = `${p.name} ${p.provider} ${p.hype ?? ""}`.toLowerCase();
    return expandedTokens.some((tok) => hay.includes(tok));
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

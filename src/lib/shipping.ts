// City-based shipping estimate (simulation, no paid courier API).
// Final ongkir = courier base fee + destination-zone surcharge. Workshop pickup
// is always free. Zones auto-detect from the typed city, with manual override.

export interface ShippingZone {
  id: string;
  label: string;
  surcharge: number;
}

export const shippingZones: ShippingZone[] = [
  { id: "jabodetabek", label: "Jabodetabek", surcharge: 0 },
  { id: "jawa", label: "Pulau Jawa (luar Jabodetabek)", surcharge: 15000 },
  { id: "sumatra-bali", label: "Sumatra & Bali", surcharge: 35000 },
  { id: "kalimantan-sulawesi", label: "Kalimantan & Sulawesi", surcharge: 55000 },
  { id: "indonesia-timur", label: "Bali Timur, NTT, Maluku & Papua", surcharge: 90000 },
];

// Common-city → zone lookup for auto-detecting from a typed city name.
// Keys are lowercase. Detection is whole-word, so "bali" never matches
// "balikpapan"; multi-word keys ("banda aceh") win over their short forms.
const CITY_ZONE: Record<string, string> = {
  // Jabodetabek
  jakarta: "jabodetabek",
  bogor: "jabodetabek",
  depok: "jabodetabek",
  tangerang: "jabodetabek",
  "tangerang selatan": "jabodetabek",
  tangsel: "jabodetabek",
  bekasi: "jabodetabek",
  cikarang: "jabodetabek",
  cibinong: "jabodetabek",
  cibubur: "jabodetabek",
  ciputat: "jabodetabek",
  serpong: "jabodetabek",
  bintaro: "jabodetabek",
  bsd: "jabodetabek",

  // Pulau Jawa — Jawa Barat
  bandung: "jawa",
  cimahi: "jawa",
  cirebon: "jawa",
  tasikmalaya: "jawa",
  garut: "jawa",
  sukabumi: "jawa",
  sumedang: "jawa",
  kuningan: "jawa",
  majalengka: "jawa",
  indramayu: "jawa",
  subang: "jawa",
  purwakarta: "jawa",
  karawang: "jawa",
  cianjur: "jawa",
  ciamis: "jawa",
  banjar: "jawa",
  pangandaran: "jawa",
  // Jawa Tengah
  semarang: "jawa",
  solo: "jawa",
  surakarta: "jawa",
  magelang: "jawa",
  salatiga: "jawa",
  pekalongan: "jawa",
  tegal: "jawa",
  brebes: "jawa",
  pemalang: "jawa",
  batang: "jawa",
  purwokerto: "jawa",
  banyumas: "jawa",
  purbalingga: "jawa",
  banjarnegara: "jawa",
  cilacap: "jawa",
  kebumen: "jawa",
  purworejo: "jawa",
  wonosobo: "jawa",
  temanggung: "jawa",
  kendal: "jawa",
  demak: "jawa",
  kudus: "jawa",
  jepara: "jawa",
  pati: "jawa",
  rembang: "jawa",
  blora: "jawa",
  grobogan: "jawa",
  klaten: "jawa",
  boyolali: "jawa",
  sukoharjo: "jawa",
  sragen: "jawa",
  wonogiri: "jawa",
  karanganyar: "jawa",
  // DI Yogyakarta
  yogyakarta: "jawa",
  jogja: "jawa",
  jogjakarta: "jawa",
  sleman: "jawa",
  bantul: "jawa",
  "kulon progo": "jawa",
  "gunung kidul": "jawa",
  wonosari: "jawa",
  // Jawa Timur
  surabaya: "jawa",
  malang: "jawa",
  batu: "jawa",
  sidoarjo: "jawa",
  gresik: "jawa",
  mojokerto: "jawa",
  jombang: "jawa",
  kediri: "jawa",
  blitar: "jawa",
  tulungagung: "jawa",
  trenggalek: "jawa",
  nganjuk: "jawa",
  madiun: "jawa",
  ngawi: "jawa",
  magetan: "jawa",
  ponorogo: "jawa",
  pacitan: "jawa",
  bojonegoro: "jawa",
  tuban: "jawa",
  lamongan: "jawa",
  jember: "jawa",
  banyuwangi: "jawa",
  probolinggo: "jawa",
  pasuruan: "jawa",
  lumajang: "jawa",
  bondowoso: "jawa",
  situbondo: "jawa",
  bangkalan: "jawa",
  sampang: "jawa",
  pamekasan: "jawa",
  sumenep: "jawa",
  // Banten
  serang: "jawa",
  cilegon: "jawa",
  pandeglang: "jawa",
  rangkasbitung: "jawa",
  lebak: "jawa",

  // Sumatra & Bali — Sumatra
  medan: "sumatra-bali",
  binjai: "sumatra-bali",
  pematangsiantar: "sumatra-bali",
  "tebing tinggi": "sumatra-bali",
  sibolga: "sumatra-bali",
  "padang sidempuan": "sumatra-bali",
  gunungsitoli: "sumatra-bali",
  padang: "sumatra-bali",
  bukittinggi: "sumatra-bali",
  payakumbuh: "sumatra-bali",
  solok: "sumatra-bali",
  pekanbaru: "sumatra-bali",
  dumai: "sumatra-bali",
  batam: "sumatra-bali",
  "tanjung pinang": "sumatra-bali",
  bintan: "sumatra-bali",
  jambi: "sumatra-bali",
  palembang: "sumatra-bali",
  prabumulih: "sumatra-bali",
  lubuklinggau: "sumatra-bali",
  bengkulu: "sumatra-bali",
  "bandar lampung": "sumatra-bali",
  lampung: "sumatra-bali",
  metro: "sumatra-bali",
  "banda aceh": "sumatra-bali",
  aceh: "sumatra-bali",
  lhokseumawe: "sumatra-bali",
  langsa: "sumatra-bali",
  sabang: "sumatra-bali",
  "pangkal pinang": "sumatra-bali",
  pangkalpinang: "sumatra-bali",
  "tanjung pandan": "sumatra-bali",
  belitung: "sumatra-bali",
  // Bali
  denpasar: "sumatra-bali",
  bali: "sumatra-bali",
  badung: "sumatra-bali",
  gianyar: "sumatra-bali",
  tabanan: "sumatra-bali",
  klungkung: "sumatra-bali",
  bangli: "sumatra-bali",
  karangasem: "sumatra-bali",
  buleleng: "sumatra-bali",
  singaraja: "sumatra-bali",
  kuta: "sumatra-bali",
  ubud: "sumatra-bali",
  "nusa dua": "sumatra-bali",
  jimbaran: "sumatra-bali",
  sanur: "sumatra-bali",

  // Kalimantan & Sulawesi — Kalimantan
  pontianak: "kalimantan-sulawesi",
  singkawang: "kalimantan-sulawesi",
  ketapang: "kalimantan-sulawesi",
  sintang: "kalimantan-sulawesi",
  palangkaraya: "kalimantan-sulawesi",
  "palangka raya": "kalimantan-sulawesi",
  sampit: "kalimantan-sulawesi",
  banjarmasin: "kalimantan-sulawesi",
  banjarbaru: "kalimantan-sulawesi",
  kotabaru: "kalimantan-sulawesi",
  balikpapan: "kalimantan-sulawesi",
  samarinda: "kalimantan-sulawesi",
  bontang: "kalimantan-sulawesi",
  tenggarong: "kalimantan-sulawesi",
  tarakan: "kalimantan-sulawesi",
  "tanjung selor": "kalimantan-sulawesi",
  nunukan: "kalimantan-sulawesi",
  // Sulawesi
  makassar: "kalimantan-sulawesi",
  gowa: "kalimantan-sulawesi",
  maros: "kalimantan-sulawesi",
  parepare: "kalimantan-sulawesi",
  palopo: "kalimantan-sulawesi",
  bone: "kalimantan-sulawesi",
  bulukumba: "kalimantan-sulawesi",
  manado: "kalimantan-sulawesi",
  bitung: "kalimantan-sulawesi",
  tomohon: "kalimantan-sulawesi",
  palu: "kalimantan-sulawesi",
  poso: "kalimantan-sulawesi",
  kendari: "kalimantan-sulawesi",
  baubau: "kalimantan-sulawesi",
  gorontalo: "kalimantan-sulawesi",
  mamuju: "kalimantan-sulawesi",
  majene: "kalimantan-sulawesi",

  // Bali Timur, NTT, Maluku & Papua — NTB
  mataram: "indonesia-timur",
  lombok: "indonesia-timur",
  praya: "indonesia-timur",
  sumbawa: "indonesia-timur",
  "sumbawa besar": "indonesia-timur",
  bima: "indonesia-timur",
  dompu: "indonesia-timur",
  // NTT
  kupang: "indonesia-timur",
  ende: "indonesia-timur",
  maumere: "indonesia-timur",
  ruteng: "indonesia-timur",
  "labuan bajo": "indonesia-timur",
  atambua: "indonesia-timur",
  waingapu: "indonesia-timur",
  // Maluku
  ambon: "indonesia-timur",
  tual: "indonesia-timur",
  masohi: "indonesia-timur",
  ternate: "indonesia-timur",
  tidore: "indonesia-timur",
  tobelo: "indonesia-timur",
  sofifi: "indonesia-timur",
  // Papua
  jayapura: "indonesia-timur",
  sentani: "indonesia-timur",
  sorong: "indonesia-timur",
  manokwari: "indonesia-timur",
  merauke: "indonesia-timur",
  biak: "indonesia-timur",
  nabire: "indonesia-timur",
  timika: "indonesia-timur",
  wamena: "indonesia-timur",
  fakfak: "indonesia-timur",
  serui: "indonesia-timur",
};

// Longest keys first so multi-word / specific names beat their substrings
// (e.g. "tangerang selatan" before "tangerang", "banda aceh" before "aceh").
const CITY_ENTRIES = Object.entries(CITY_ZONE).sort(
  (a, b) => b[0].length - a[0].length
);

function byId(id: string): ShippingZone | null {
  return shippingZones.find((z) => z.id === id) ?? null;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Detect the zone from a free-text city. Exact match first, then whole-word
// match (handles "Kota Bandung", "Bandung, Jawa Barat", "Jakarta Selatan").
// Whole-word matching prevents "bali" from matching "balikpapan".
export function detectZone(city: string): ShippingZone | null {
  const c = city.trim().toLowerCase().replace(/\s+/g, " ");
  if (!c) return null;
  if (CITY_ZONE[c]) return byId(CITY_ZONE[c]);
  for (const [name, zone] of CITY_ENTRIES) {
    if (new RegExp(`\\b${escapeRegExp(name)}\\b`).test(c)) return byId(zone);
  }
  return null;
}

export function shippingFee(
  method: { fee: number; pickup?: boolean },
  zone: ShippingZone | null
): number {
  if (method.pickup) return 0;
  return method.fee + (zone?.surcharge ?? 0);
}

import type { ShopCategory, ShopPhotoReport, ShopProduct } from "@/types/database";

export type MockShopProduct = Pick<
  ShopProduct,
  | "id"
  | "slug"
  | "section"
  | "title_ua"
  | "title_en"
  | "price_amount"
  | "price_currency"
  | "cover_image"
  | "description_ua"
  | "description_en"
  | "gallery_images"
> & { category_slug: string | null };

const DESC_UA =
  "Елегантний виріб ручної роботи з високоякісних матеріалів. Поєднує народні мотиви з сучасним стилем, тонка робота майстра та надійна фурнітура.";
const DESC_EN =
  "An elegant handmade piece crafted from high-quality materials. Combines folk motifs with a modern style — fine craftsmanship and reliable hardware.";

export type MockShopCategory = Pick<
  ShopCategory,
  "section" | "slug" | "name_ua" | "name_en"
>;

export type MockShopPhotoReport = Pick<
  ShopPhotoReport,
  "slug" | "title_ua" | "title_en" | "images"
>;

export const MOCK_SHOP_CATEGORIES: MockShopCategory[] = [
  { section: "handmade",     slug: "jewelry",    name_ua: "Прикраси",        name_en: "Jewelry" },
  { section: "handmade",     slug: "dolls",      name_ua: "Ляльки",          name_en: "Dolls" },
  { section: "handmade",     slug: "home",       name_ua: "Для дому",        name_en: "For home" },
  { section: "handmade",     slug: "gifts",      name_ua: "На подарунок",    name_en: "Gifts" },
  { section: "from_ukraine", slug: "souvenirs",  name_ua: "Сувеніри",        name_en: "Souvenirs" },
  { section: "from_ukraine", slug: "vyshyvanky", name_ua: "Вишиванки",       name_en: "Embroidered" },
  { section: "from_ukraine", slug: "gifts",      name_ua: "На подарунок",    name_en: "Gifts" },
  { section: "cuisine",      slug: "varenyky",   name_ua: "Вареники",        name_en: "Varenyky" },
  { section: "cuisine",      slug: "holubtsi",   name_ua: "Домашні голубці", name_en: "Holubtsi" },
  { section: "cuisine",      slug: "mlyntsi",    name_ua: "Млинці",          name_en: "Mlyntsi" },
];

type RawMockShopProduct = Omit<
  MockShopProduct,
  "description_ua" | "description_en" | "gallery_images"
> &
  Partial<Pick<MockShopProduct, "description_ua" | "description_en" | "gallery_images">>;

const RAW_MOCK_SHOP_PRODUCTS: RawMockShopProduct[] = [
  // Handmade
  { id: "h1",  slug: "beaded-flower-necklace", section: "handmade", title_ua: "Намисто з бісеру",   title_en: "Beaded necklace",  price_amount: 45, price_currency: "AUD", cover_image: null, category_slug: "jewelry" },
  { id: "h2",  slug: "pink-quartz-beads",      section: "handmade", title_ua: "Намисто з кварцу",   title_en: "Quartz beads",     price_amount: 60, price_currency: "AUD", cover_image: null, category_slug: "jewelry" },
  { id: "h3",  slug: "yellow-bead-earrings",   section: "handmade", title_ua: "Сережки з бісеру",   title_en: "Beaded earrings",  price_amount: 25, price_currency: "AUD", cover_image: null, category_slug: "jewelry" },
  { id: "h4",  slug: "purple-stone-necklace",  section: "handmade", title_ua: "Намисто з каменю",   title_en: "Stone necklace",   price_amount: 70, price_currency: "AUD", cover_image: null, category_slug: "gifts" },
  { id: "h5",  slug: "linen-doll-mariychka",   section: "handmade", title_ua: "Лялька-мотанка",     title_en: "Motanka doll",     price_amount: 38, price_currency: "AUD", cover_image: null, category_slug: "dolls" },
  { id: "h6",  slug: "wool-doll-oksana",       section: "handmade", title_ua: "Вовняна лялька",     title_en: "Wool doll",        price_amount: 42, price_currency: "AUD", cover_image: null, category_slug: "dolls" },
  { id: "h7",  slug: "embroidered-cushion",    section: "handmade", title_ua: "Вишита подушка",     title_en: "Embroidered cushion", price_amount: 55, price_currency: "AUD", cover_image: null, category_slug: "home" },
  { id: "h8",  slug: "ceramic-coasters-set",   section: "handmade", title_ua: "Керамічні підставки", title_en: "Ceramic coasters", price_amount: 30, price_currency: "AUD", cover_image: null, category_slug: "home" },
  { id: "h9",  slug: "beaded-bracelet-set",    section: "handmade", title_ua: "Браслети з бісеру",  title_en: "Beaded bracelets", price_amount: 28, price_currency: "AUD", cover_image: null, category_slug: "jewelry" },
  { id: "h10", slug: "ceramic-vase-poppy",     section: "handmade", title_ua: "Ваза 'Маки'",        title_en: "Poppy vase",       price_amount: 85, price_currency: "AUD", cover_image: null, category_slug: "home" },
  { id: "h11", slug: "wooden-toy-bird",        section: "handmade", title_ua: "Дерев'яна пташка",   title_en: "Wooden bird",      price_amount: 22, price_currency: "AUD", cover_image: null, category_slug: "gifts" },
  { id: "h12", slug: "amber-pendant",          section: "handmade", title_ua: "Підвіска з бурштину", title_en: "Amber pendant",   price_amount: 95, price_currency: "AUD", cover_image: null, category_slug: "jewelry" },

  // From Ukraine
  { id: "u1", slug: "embroidered-kerchief",   section: "from_ukraine", title_ua: "Вишита хустка",      title_en: "Embroidered kerchief", price_amount: 35, price_currency: "AUD", cover_image: null, category_slug: "vyshyvanky" },
  { id: "u2", slug: "ukrainian-souvenir-set", section: "from_ukraine", title_ua: "Сувенірний набір",   title_en: "Souvenir set",         price_amount: 50, price_currency: "AUD", cover_image: null, category_slug: "souvenirs" },
  { id: "u3", slug: "gift-box-ukraine",       section: "from_ukraine", title_ua: "Подарунковий набір", title_en: "Gift box",             price_amount: 80, price_currency: "AUD", cover_image: null, category_slug: "gifts" },
  { id: "u4", slug: "magnet-collection",      section: "from_ukraine", title_ua: "Колекція магнітів",  title_en: "Magnet collection",    price_amount: 20, price_currency: "AUD", cover_image: null, category_slug: "souvenirs" },

  // Cuisine
  { id: "c1", slug: "varenyky-cherry",  section: "cuisine", title_ua: "Вареники з вишнею",    title_en: "Cherry varenyky",  price_amount: 18, price_currency: "AUD", cover_image: "/images/shop/varenuky.webp", category_slug: "varenyky" },
  { id: "c2", slug: "varenyky-potato",  section: "cuisine", title_ua: "Вареники з картоплею", title_en: "Potato varenyky",  price_amount: 16, price_currency: "AUD", cover_image: "/images/shop/varenuky.webp", category_slug: "varenyky" },
  { id: "c3", slug: "holubtsi-classic", section: "cuisine", title_ua: "Голубці класичні",     title_en: "Classic holubtsi", price_amount: 22, price_currency: "AUD", cover_image: null, category_slug: "holubtsi" },
  { id: "c4", slug: "mlyntsi-cheese",   section: "cuisine", title_ua: "Млинці з сиром",       title_en: "Cheese mlyntsi",   price_amount: 14, price_currency: "AUD", cover_image: null, category_slug: "mlyntsi" },
];

export const MOCK_SHOP_PRODUCTS: MockShopProduct[] = RAW_MOCK_SHOP_PRODUCTS.map((p) => ({
  ...p,
  description_ua: p.description_ua ?? DESC_UA,
  description_en: p.description_en ?? DESC_EN,
  gallery_images: p.gallery_images ?? [],
}));

export const MOCK_SHOP_PHOTO_REPORTS: MockShopPhotoReport[] = [
  {
    slug: "ecoflow-delta-3-april-2026",
    title_ua: "EcoFlow Delta 3 1500",
    title_en: "EcoFlow Delta 3 1500",
    images: [
      { url: "/images/photoReport/product-01.webp", kind: "product", position: 1 },
      { url: "/images/photoReport/product-02.webp", kind: "product", position: 2 },
      { url: "/images/photoReport/product-03.webp", kind: "product", position: 3 },
      { url: "/images/photoReport/proof-01.webp",   kind: "proof",   position: 1 },
      { url: "/images/photoReport/proof-02.webp",   kind: "proof",   position: 2 },
      { url: "/images/photoReport/chat-01.webp",    kind: "chat",    position: 1 },
    ],
  },
];

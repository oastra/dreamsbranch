// Bilingual mock testimonials for the shop catalog reviews carousel.
// Picked per locale at render time. Move to a `shop_reviews` DB table when
// real content is ready.

export type MockShopReview = {
  id: string;
  name_ua: string;
  name_en: string;
  role_ua: string;
  role_en: string;
  quote_ua: string;
  quote_en: string;
  rating: number;
  avatar: string;
};

export const MOCK_SHOP_REVIEWS: MockShopReview[] = [
  {
    id: "r1",
    name_ua: "Катерина",
    name_en: "Kateryna",
    role_ua: "Дизайнер",
    role_en: "Designer",
    quote_ua:
      "Для мене ця прикраса — як частинка дому тут, в Австралії. Якість неймовірна, дизайн дуже автентичний. Дякую за можливість підтримати Україну навіть за тисячі кілометрів. Обов'язково замовлятиму ще на подарунки друзям!",
    quote_en:
      "For me this jewelry feels like a piece of home here in Australia. The quality is amazing, the design truly authentic. Thank you for the chance to support Ukraine from thousands of kilometres away — I'll definitely order again as gifts for friends!",
    rating: 5,
    avatar: "/images/shop/handmade/review-2.webp",
  },
  {
    id: "r2",
    name_ua: "Олена",
    name_en: "Olena",
    role_ua: "Викладачка",
    role_en: "Teacher",
    quote_ua:
      "Замовила вишиванку для доньки на свято. Робота просто бездоганна, кожна петелька на своєму місці. Приємно знати, що кошти йдуть на підтримку наших захисників.",
    quote_en:
      "I ordered an embroidered shirt for my daughter for a celebration. The work is flawless, every stitch in its place. It's wonderful to know the funds support our defenders.",
    rating: 5,
    avatar: "/images/shop/handmade/review-1.webp",
  },
  {
    id: "r3",
    name_ua: "Марія",
    name_en: "Maria",
    role_ua: "Лікарка",
    role_en: "Doctor",
    quote_ua:
      "Купила ляльку-мотанку як оберіг для родини. Майстриня вклала стільки душі — це відчувається з першого погляду. Дякую за теплу історію, яка приходить разом із кожним виробом.",
    quote_en:
      "I bought a motanka doll as a charm for our family. The artisan poured so much soul into it — you can feel it at first glance. Thank you for the warm story that comes with every piece.",
    rating: 5,
    avatar: "/images/shop/handmade/review-2.webp",
  },
];

-- ============================================================
-- Shop test data — run once in the Supabase SQL editor.
-- Adds the schema the new shop features need (idempotent, same as the
-- pending migrations) and seeds 14 active products with 5 in stock each
-- so the whole flow (catalog → cart → Stripe/PayPal → orders → stock
-- decrement) can be tested end to end. Safe to re-run.
-- ============================================================

-- ── Schema (idempotent) ──────────────────────────────────────────────
alter table shop_products add column if not exists stock integer;

create or replace function decrement_shop_stock(p_slug text, p_qty integer)
returns void language sql as $$
  update shop_products
  set stock = greatest(stock - p_qty, 0)
  where slug = p_slug and stock is not null;
$$;

create table if not exists shop_orders (
  id                    uuid primary key default gen_random_uuid(),
  provider              text not null default 'stripe',
  external_id           text unique not null,
  external_payment_id   text,
  status                text not null default 'paid',
  amount_total          numeric(12,2) not null default 0,
  currency              text not null default 'AUD',
  customer_email        text,
  customer_name         text,
  customer_phone        text,
  shipping_address      jsonb,
  line_items            jsonb not null default '[]'::jsonb,
  created_at            timestamptz not null default now()
);
create index if not exists shop_orders_created_at_idx on shop_orders(created_at desc);
alter table shop_orders enable row level security;

-- ── Seed products (status active, 5 in stock) ────────────────────────
insert into shop_products
  (title_ua, title_en, slug, slug_ua, slug_en, description_ua, description_en,
   price_amount, price_currency, section, gallery_images, status, sort_order, stock)
values
  -- Handmade
  ('Намисто з бісеру', 'Beaded necklace', 'beaded-necklace', 'beaded-necklace', 'beaded-necklace',
   'Ручне намисто з бісеру у синьо-жовтих кольорах. Кожен виріб унікальний — кошти йдуть на підтримку ЗСУ.',
   'Handmade beaded necklace in blue and yellow. Each piece is unique — proceeds support Ukraine.',
   39.00, 'AUD', 'handmade', '{}', 'active', 1, 5),
  ('Сережки «Квіти»', 'Flower earrings', 'flower-earrings', 'flower-earrings', 'flower-earrings',
   'Легкі сережки ручної роботи у формі квітів. Виготовлені волонтерами нашої спільноти.',
   'Light handmade flower earrings, crafted by our community volunteers.',
   24.00, 'AUD', 'handmade', '{}', 'active', 2, 5),
  ('Браслет етно', 'Ethno bracelet', 'ethno-bracelet', 'ethno-bracelet', 'ethno-bracelet',
   'Плетений браслет з традиційним українським орнаментом.',
   'Woven bracelet with a traditional Ukrainian pattern.',
   19.00, 'AUD', 'handmade', '{}', 'active', 3, 5),
  ('Брошка-вишиванка', 'Embroidered brooch', 'embroidered-brooch', 'embroidered-brooch', 'embroidered-brooch',
   'Вишита брошка ручної роботи — стильний патріотичний акцент.',
   'Hand-embroidered brooch — a stylish patriotic accent.',
   22.00, 'AUD', 'handmade', '{}', 'active', 4, 5),
  -- From Ukraine
  ('Прапор України', 'Ukraine flag', 'ukraine-flag', 'ukraine-flag', 'ukraine-flag',
   'Якісний прапор України 90х140 см. Привезений з України.',
   'Quality Ukraine flag, 90x140 cm. Brought from Ukraine.',
   29.00, 'AUD', 'from_ukraine', '{}', 'active', 5, 5),
  ('Магніт «Тризуб»', 'Trident magnet', 'trident-magnet', 'trident-magnet', 'trident-magnet',
   'Сувенірний магніт із гербом України. Чудовий маленький подарунок.',
   'Souvenir magnet with the Ukrainian coat of arms. A lovely small gift.',
   8.00, 'AUD', 'from_ukraine', '{}', 'active', 6, 5),
  ('Кружка з гербом', 'Crest mug', 'crest-mug', 'crest-mug', 'crest-mug',
   'Керамічна кружка з гербом України, 330 мл.',
   'Ceramic mug with the Ukrainian crest, 330 ml.',
   18.00, 'AUD', 'from_ukraine', '{}', 'active', 7, 5),
  ('Листівка патріотична', 'Patriotic card', 'patriotic-card', 'patriotic-card', 'patriotic-card',
   'Набір з 3 патріотичних листівок ручного друку.',
   'Set of 3 hand-printed patriotic greeting cards.',
   12.00, 'AUD', 'from_ukraine', '{}', 'active', 8, 5),
  -- Ukrainian cuisine
  ('Вареники з картоплею', 'Potato dumplings', 'potato-dumplings', 'potato-dumplings', 'potato-dumplings',
   'Домашні вареники з картоплею, 1 кг. Заморожені, готові до варіння.',
   'Homemade potato dumplings, 1 kg. Frozen, ready to cook.',
   16.00, 'AUD', 'cuisine', '{}', 'active', 9, 5),
  ('Борщ домашній', 'Homemade borscht', 'homemade-borscht', 'homemade-borscht', 'homemade-borscht',
   'Класичний український борщ, зварений за домашнім рецептом. Порція 1 л.',
   'Classic Ukrainian borscht made with love. 1 litre portion.',
   14.00, 'AUD', 'cuisine', '{}', 'active', 10, 5),
  ('Сирники', 'Cheese pancakes', 'cheese-pancakes', 'cheese-pancakes', 'cheese-pancakes',
   'Ніжні сирники зі сметаною. Упаковка 6 штук.',
   'Tender cottage-cheese pancakes with sour cream. Pack of 6.',
   13.00, 'AUD', 'cuisine', '{}', 'active', 11, 5),
  ('Торт «Київський»', 'Kyiv cake', 'kyiv-cake', 'kyiv-cake', 'kyiv-cake',
   'Легендарний Київський торт за класичним рецептом, 1 кг.',
   'The legendary Kyiv cake made to the classic recipe, 1 kg.',
   45.00, 'AUD', 'cuisine', '{}', 'active', 12, 5),
  -- Catering
  ('Святковий фуршет', 'Festive platter', 'festive-platter', 'festive-platter', 'festive-platter',
   'Набір святкових закусок на 10 осіб. Замовляйте заздалегідь.',
   'A festive snack platter for 10 people. Order in advance.',
   120.00, 'AUD', 'catering', '{}', 'active', 13, 5),
  ('Набір вареників', 'Dumpling set', 'dumpling-set', 'dumpling-set', 'dumpling-set',
   'Великий набір вареників різних видів для свята, 3 кг.',
   'A large mixed dumpling set for a celebration, 3 kg.',
   60.00, 'AUD', 'catering', '{}', 'active', 14, 5)
on conflict do nothing;

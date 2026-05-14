import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { resolveLocaleSlug } from '@/lib/slug';

import { db } from '@/lib/db';
import { NewsCard } from '@/components/news/NewsCard';
import { ContactSection } from '@/components/contact/ContactSection';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ImagePlaceholder } from '@/components/shared/ImagePlaceholder';
import { ShareSection } from '@/components/shared/ShareSection';
import type { NewsArticle } from '@/types/database';

// ─── Mock data ───────────────────────────────────────────────────────────────

type ArticleDetail = Pick<
  NewsArticle,
  | 'id'
  | 'slug'
  | 'title_ua'
  | 'title_en'
  | 'body_ua'
  | 'body_en'
  | 'cover_image'
  | 'category'
  | 'tags'
  | 'is_featured'
  | 'status'
  | 'published_at'
>;

const MOCK_ARTICLE: ArticleDetail = {
  id: 'mock-n2',
  slug: 'world-protests-ukraine',
  title_ua: 'Світ протестує проти примусу України до капітуляції',
  title_en: 'The world protests against forcing Ukraine to capitulate',
  body_ua: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Сьогодні, коли на міжнародній арені дедалі жостіше звучать заклики до «миру будь-якою ціною», українська громада Австралії та наші друзі по всьому світу виходять на вулиці, щоб нагадати: справедливий мир неможливий через капітуляцію жертви.',
          },
        ],
      },
      {
        type: 'image',
        attrs: { src: '/images/events/hands-with-heart.webp', alt: 'Protest' },
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'В останні тижні в найбільших містах світу — від Канберри та Сіднея до Вашингтона й Берліна — відбулися масові акції протесту. Тисячі людей виступили проти політичного тиску на Україну з метою змусити її до територіальних поступок або відмови від суверенітету.',
          },
        ],
      },
      {
        type: 'image',
        attrs: { src: '/images/events/events.webp', alt: 'Community gathering' },
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: 'Чому «компроміси» — це пастка?',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Ми, як благодійна спільнота в Австралії, що щодня працює для підтримки Збройних Сил України, чітко розуміємо: ціну цієї дискусії.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: 'Безпека, а не ілюзія: ',
          },
          {
            type: 'text',
            text: 'Тимчасове припинення вогню без звільнення територій дасть ворогу лише час на перегрупування.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: 'Голос народу: ',
          },
          {
            type: 'text',
            text: 'Соціологічні опитування в Україні та серед діаспори підтверджують — понад 80% українців відкидають можливість територіальних поступок.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: 'Відповідальність світу: ',
          },
          {
            type: 'text',
            text: 'Демократичний світ не має права торгувати українською землею в обмін на власну короткострокову стабільність.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Австралійський уряд та громадянське суспільство продовжують демонструвати непохитну підтримку. Нові пакети санкцій та військової допомоги, оголошені до четвертих роковин повномасштабного вторгнення, є найкращою відповіддю на заклики до капітуляції.',
          },
        ],
      },
    ],
  } as unknown as NewsArticle['body_ua'],
  body_en: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Today, as calls for "peace at any cost" grow louder on the international stage, the Ukrainian community of Australia and our friends around the world take to the streets to remind: a just peace is impossible through the capitulation of the victim.',
          },
        ],
      },
      {
        type: 'image',
        attrs: { src: '/images/events/hands-with-heart.webp', alt: 'Protest' },
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'In recent weeks, mass protests have taken place in major cities around the world — from Canberra and Sydney to Washington and Berlin. Thousands of people spoke out against political pressure on Ukraine to force it into territorial concessions or abandonment of sovereignty.',
          },
        ],
      },
      {
        type: 'image',
        attrs: { src: '/images/events/events.webp', alt: 'Community gathering' },
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: 'Why "compromises" are a trap?',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'As a charitable community in Australia that works every day to support the Armed Forces of Ukraine, we clearly understand the price of this discussion.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: 'Security, not illusion: ',
          },
          {
            type: 'text',
            text: 'A temporary ceasefire without liberating territories will only give the enemy time to regroup.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: "The people's voice: ",
          },
          {
            type: 'text',
            text: 'Sociological surveys in Ukraine and among the diaspora confirm — over 80% of Ukrainians reject the possibility of territorial concessions.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: "The world's responsibility: ",
          },
          {
            type: 'text',
            text: 'The democratic world has no right to trade Ukrainian land in exchange for its own short-term stability.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'The Australian government and civil society continue to demonstrate unwavering support. New packages of sanctions and military aid, announced ahead of the fourth anniversary of the full-scale invasion, are the best response to calls for capitulation.',
          },
        ],
      },
    ],
  } as unknown as NewsArticle['body_en'],
  cover_image: null,
  category: 'organiser',
  tags: [],
  is_featured: false,
  status: 'published',
  published_at: '2026-02-16T10:00:00Z',
};

const MOCK_RELATED: ArticleDetail[] = [
  {
    id: 'mock-r1',
    slug: 'world-protests-ukraine-2',
    title_ua: 'Світ протестує проти примусу України до капітуляції',
    title_en: 'The world protests against forcing Ukraine to capitulate',
    body_ua: 'У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.',
    body_en: 'In dozens of cities around the world, activists spoke out against coercion.',
    cover_image: null,
    category: 'organiser',
    tags: [],
    is_featured: false,
    status: 'published',
    published_at: '2026-03-08T10:00:00Z',
  },
  {
    id: 'mock-r2',
    slug: 'world-protests-ukraine-3',
    title_ua: 'Світ протестує проти примусу України до капітуляції',
    title_en: 'The world protests against forcing Ukraine to capitulate',
    body_ua: 'У десятках міст по всьому світу активісти виступили проти примусу.',
    body_en: 'In dozens of cities around the world, activists spoke out.',
    cover_image: null,
    category: 'organiser',
    tags: [],
    is_featured: false,
    status: 'published',
    published_at: '2026-03-05T10:00:00Z',
  },
  {
    id: 'mock-r3',
    slug: 'stay-online',
    title_ua: 'Залишайся Онлайн',
    title_en: 'Stay Online',
    body_ua: 'Перегляд кінострічки «Ти — космос» — це досвід.',
    body_en: 'Watching the film is an experience.',
    cover_image: null,
    category: 'organiser',
    tags: [],
    is_featured: true,
    status: 'published',
    published_at: '2026-03-15T10:00:00Z',
  },
];

// ─── Rich text renderer ─────────────────────────────────────────────────────

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string }[];
};

function renderRichText(doc: unknown): React.ReactNode[] {
  if (!doc) return [];

  // Plain string from the admin textarea — split on blank lines into paragraphs.
  // Single newlines within a paragraph are preserved as line breaks via
  // `whitespace-pre-line`. Tiptap JSON path below still works for rich content.
  if (typeof doc === 'string') {
    const trimmed = doc.trim();
    if (!trimmed) return [];
    return trimmed.split(/\n{2,}/).map((para, i) => (
      <p
        key={i}
        className="mb-5 whitespace-pre-line text-[16px] leading-relaxed text-text-primary sm:text-[18px]"
      >
        {para.trim()}
      </p>
    ));
  }

  if (typeof doc !== 'object') return [];

  const root = doc as { content?: TiptapNode[] };
  if (!root.content) return [];

  let imageCount = 0;
  return root.content.map((node, i) => {
    switch (node.type) {
      case 'heading': {
        const level = (node.attrs?.level as number) ?? 3;
        const text = renderInline(node.content);
        if (level === 2) return <h2 key={i} className="mt-8 mb-4 text-h2 font-bold text-text-strong">{text}</h2>;
        return <h3 key={i} className="my-4 text-[24px] font-medium leading-[120%] text-text-strong">{text}</h3>;
      }
      case 'paragraph':
        return <p key={i} className="mb-5 text-[16px] leading-relaxed text-text-primary sm:text-[18px]">{renderInline(node.content)}</p>;
      case 'bulletList':
        return (
          <ul key={i} className="mb-5 list-disc pl-6 text-[16px] leading-snug text-text-primary sm:text-[18px]">
            {(node.content ?? []).map((item, j) => (
              <li key={j}>{renderListItem(item)}</li>
            ))}
          </ul>
        );
      case 'orderedList':
        return (
          <ol key={i} className="mb-5 list-decimal pl-6 text-[16px] leading-snug text-text-primary sm:text-[18px]">
            {(node.content ?? []).map((item, j) => (
              <li key={j}>{renderListItem(item)}</li>
            ))}
          </ol>
        );
      case 'image': {
        imageCount += 1;
        // First image renders full-width hero. Subsequent images float
        // left so the surrounding paragraphs wrap around them on tablet+.
        const isHero = imageCount === 1;
        if (isHero) {
          return (
            <div key={i} className="relative my-8 aspect-[16/8] w-full overflow-hidden rounded-2xl bg-secondary-10 lg:my-10">
              {node.attrs?.src ? (
                <Image src={node.attrs.src as string} alt={(node.attrs?.alt as string) ?? ''} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 1200px" />
              ) : (
                <ImagePlaceholder size="md" />
              )}
            </div>
          );
        }
        return (
          <div key={i} className="relative mb-4 aspect-4/3 w-full overflow-hidden rounded-2xl bg-secondary-10 md:float-left md:mr-6 md:mb-4 md:w-[45%] lg:w-[42%]">
            {node.attrs?.src ? (
              <Image src={node.attrs.src as string} alt={(node.attrs?.alt as string) ?? ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 45vw" />
            ) : (
              <ImagePlaceholder size="md" />
            )}
          </div>
        );
      }
      default:
        return null;
    }
  });
}

// A Tiptap listItem usually wraps its content in a paragraph node. Walk
// through and pull out the inline text so the <li> doesn't end up with an
// extra <p> margin that breaks the list rhythm.
function renderListItem(node: TiptapNode): React.ReactNode {
  if (!node.content) return null;
  return node.content.map((child, i) => {
    if (child.type === 'paragraph') {
      return <span key={i}>{renderInline(child.content)}</span>;
    }
    if (child.type === 'bulletList') {
      return (
        <ul key={i} className="mt-1 list-disc space-y-1 pl-6">
          {(child.content ?? []).map((nested, j) => (
            <li key={j}>{renderListItem(nested)}</li>
          ))}
        </ul>
      );
    }
    if (child.type === 'orderedList') {
      return (
        <ol key={i} className="mt-1 list-decimal space-y-1 pl-6">
          {(child.content ?? []).map((nested, j) => (
            <li key={j}>{renderListItem(nested)}</li>
          ))}
        </ol>
      );
    }
    return null;
  });
}

function renderInline(nodes?: TiptapNode[]): React.ReactNode {
  if (!nodes) return null;
  return nodes.map((node, i) => {
    if (node.type === 'text') {
      const isBold = node.marks?.some((m) => m.type === 'bold');
      const isItalic = node.marks?.some((m) => m.type === 'italic');
      if (isBold && isItalic) return <strong key={i}><em>{node.text}</em></strong>;
      if (isBold) return <strong key={i}>{node.text}</strong>;
      if (isItalic) return <em key={i}>{node.text}</em>;
      return <span key={i}>{node.text}</span>;
    }
    return null;
  });
}

function extractPlainText(richText: unknown): string {
  if (typeof richText === 'string') return richText;
  if (!richText || typeof richText !== 'object') return '';
  const doc = richText as { content?: Array<{ content?: Array<{ text?: string }> }> };
  if (!doc.content) return '';
  return doc.content
    .flatMap((block) => block.content?.map((inline) => inline.text ?? '') ?? [])
    .join(' ')
    .slice(0, 300);
}

function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'ua' ? 'uk-UA' : 'en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getCategoryLabel(category: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    organiser: t('news.category_organiser'),
  };
  return map[category] ?? category;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  // Fetch article from DB, fallback to mock
  let article: ArticleDetail | null = null;
  let related: ArticleDetail[] = [];

  // resolveLocaleSlug must run OUTSIDE the try/catch — Next's redirect() and
  // notFound() throw a special framework error that any catch would swallow,
  // turning legitimate redirects into 404s.
  const { row, redirectTo } = await resolveLocaleSlug(
    db.newsArticle,
    slug,
    locale,
    `/${locale}/news`,
  );
  if (redirectTo) redirect(redirectTo);
  if (row) article = row as unknown as ArticleDetail;

  try {
    const fetchedRelated = await db.newsArticle.findMany({
      where: { status: 'PUBLISHED' },
      take: 3,
    });
    related = (fetchedRelated as unknown as ArticleDetail[]).filter(
      (a) => a.slug !== slug,
    );
  } catch {
    // Related is best-effort — fall back to mocks below if it fails.
  }

  // Fallback to mock
  if (!article) {
    if (slug === MOCK_ARTICLE.slug) {
      article = MOCK_ARTICLE;
    } else {
      // Try matching mock related
      const mockMatch = MOCK_RELATED.find((a) => a.slug === slug);
      if (mockMatch) article = mockMatch;
    }
  }

  if (!article) notFound();

  if (related.length === 0) {
    related = MOCK_RELATED.filter((a) => a.slug !== slug).slice(0, 3);
  }

  const titleKey = locale === 'ua' ? 'title_ua' : 'title_en';
  const bodyKey = locale === 'ua' ? 'body_ua' : 'body_en';
  const leadKey = locale === 'ua' ? 'lead_text_ua' : 'lead_text_en';
  const cardPreview = (a: ArticleDetail): string => {
    const lead = (a as unknown as Record<string, string | null | undefined>)[leadKey];
    if (lead && lead.trim()) return lead.trim();
    return extractPlainText(a[bodyKey]);
  };

  const title = article[titleKey];
  const body = article[bodyKey];
  const publishDate = formatDate(
    article.published_at ?? (article as unknown as { created_at?: string }).created_at ?? null,
    locale,
  );
  const coverImage = article.cover_image;
  const extra = article as unknown as {
    body_image?: string | null;
    gallery_images?: string[];
    lead_text_ua?: string | null;
    lead_text_en?: string | null;
    post_hero_text_ua?: string | null;
    post_hero_text_en?: string | null;
    outro_text_ua?: string | null;
    outro_text_en?: string | null;
  };
  const bodyImage = extra.body_image ?? null;
  const galleryImages = (extra.gallery_images ?? []).filter(Boolean);
  const leadText = (locale === 'ua' ? extra.lead_text_ua : extra.lead_text_en) ?? '';
  const postHeroText = (locale === 'ua' ? extra.post_hero_text_ua : extra.post_hero_text_en) ?? '';
  const outroText = (locale === 'ua' ? extra.outro_text_ua : extra.outro_text_en) ?? '';

  return (
    <>
      {/* ── Article header + body ────────────────────────────────── */}
      <article className="bg-white pt-6 pb-10 lg:pt-10 lg:pb-16">
        <div className="container-page">
          {/* Breadcrumb + date row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Breadcrumb
              crumbs={[
                { label: t('news.breadcrumb_home'), href: `/${locale}` },
                { label: t('news.breadcrumb_news'), href: `/${locale}/news` },
              ]}
              current={title}
            />
            <span className="text-body-sm text-text-secondary">{publishDate}</span>
          </div>

          {/* Title */}
          <h1 className="mt-6 mb-6 text-[24px] font-bold leading-[120%] text-text-strong md:text-[28px] lg:mt-8 lg:mb-6 lg:text-[40px] lg:leading-[110%]">
            {title}
          </h1>

          {/* 1. Lead text — sits between title and hero. 24px paragraph. */}
          {leadText && (
            <p className="mb-8 whitespace-pre-line text-[18px] leading-relaxed text-text-primary sm:text-[24px] lg:mb-10">
              {leadText}
            </p>
          )}

          {/* 2. Cover hero — fills the container width at fixed heights per
                breakpoint (280 / 400 / 480). Object-cover so the image fills
                the frame edge-to-edge; upload landscape at ~2.4:1 (e.g.
                1920×800) to avoid noticeable cropping on desktop. */}
          {coverImage && (
            <div className="relative mb-8 h-[280px] w-full overflow-hidden rounded-2xl bg-secondary-10 sm:h-[400px] lg:mb-10 lg:h-[480px]">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1280px"
                priority
              />
            </div>
          )}

          {/* 3. Post-hero text — between hero and the flex section. 24px. */}
          {postHeroText && (
            <p className="mb-8 whitespace-pre-line text-[18px] leading-relaxed text-text-primary sm:text-[24px] lg:mb-10">
              {postHeroText}
            </p>
          )}

          {/* 4. Side-by-side: in-text image left, main 18px body right.
                Stacks image-first on mobile. Falls back to a body-only
                section when the article has no in-text image. */}
          {(bodyImage || body) && (
            <div className={bodyImage ? 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10' : ''}>
              {bodyImage && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-secondary-10 md:order-1">
                  <Image
                    src={bodyImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              <div className="text-body text-text-primary md:order-2">
                {renderRichText(body)}
              </div>
            </div>
          )}

          {/* 5. Outro text — full width, sits below the flex section. 24px. */}
          {outroText && (
            <p className="mt-10 whitespace-pre-line text-[18px] leading-relaxed text-text-primary sm:text-[24px] lg:mt-12">
              {outroText}
            </p>
          )}

          {/* Gallery (below body, separate from rich text). Masonry-style
              CSS columns so portrait + landscape photos can mix without
              cropping — each image renders at its natural aspect ratio. */}
          {galleryImages.length > 0 && (
            <div className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
              {galleryImages.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="mb-6 overflow-hidden rounded-xl bg-secondary-10 break-inside-avoid"
                >
                  <Image
                    src={src}
                    alt=""
                    width={0}
                    height={0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="block h-auto w-full"
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── Share section ─────────────────────────────────── */}
          <ShareSection
            copyLinkLabel={t('news.copy_link')}
            copiedLabel={t('news.copy_link_copied')}
            shareLabel={t('news.share')}
            ariaLabel={t('news.share_aria')}
          />
        </div>
      </article>

      {/* ── More news ────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="section bg-bg">
          <div className="container-page">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-h2 text-text-strong">{t('news.more_news')}</h2>
              <div className="flex gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-secondary transition-colors hover:bg-grey-40">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-secondary transition-colors hover:bg-grey-40">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <NewsCard
                  key={a.id}
                  slug={a.slug}
                  locale={locale}
                  title={a[titleKey]}
                  description={cardPreview(a)}
                  coverImage={a.cover_image}
                  categoryLabel={getCategoryLabel(a.category, t)}
                  brandLabel="Dreams branch of UWAA"
                  publishedAt={a.published_at ?? (a as unknown as { created_at?: string }).created_at ?? null}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact form ─────────────────────────────────────────── */}
      <ContactSection
        title={t('news.contact_title')}
        description={t('news.contact_description')}
      />
    </>
  );
}

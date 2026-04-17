import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { db } from '@/lib/db';
import { NewsCard } from '@/components/news/NewsCard';
import { ContactSection } from '@/components/contact/ContactSection';
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
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'В останні тижні в найбільших містах світу — від Канберри та Сіднея до Вашингтона й Берліна — відбулися масові акції протесту. Тисячі людей виступили проти політичного тиску на Україну з метою змусити її до територіальних поступок або відмови від суверенітету.',
          },
        ],
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
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'In recent weeks, mass protests have taken place in major cities around the world — from Canberra and Sydney to Washington and Berlin. Thousands of people spoke out against political pressure on Ukraine to force it into territorial concessions or abandonment of sovereignty.',
          },
        ],
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
  published_at: '2026-02-18T10:00:00Z',
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
  if (!doc || typeof doc !== 'object') return [];

  const root = doc as { content?: TiptapNode[] };
  if (!root.content) return [];

  return root.content.map((node, i) => {
    switch (node.type) {
      case 'heading': {
        const level = (node.attrs?.level as number) ?? 3;
        const text = renderInline(node.content);
        if (level === 2) return <h2 key={i} className="text-h2 mt-8 mb-4 text-text-strong">{text}</h2>;
        return <h3 key={i} className="text-h3 mt-6 mb-3 text-text-strong">{text}</h3>;
      }
      case 'paragraph':
        return <p key={i} className="text-body mb-4 text-text-primary leading-relaxed">{renderInline(node.content)}</p>;
      case 'image':
        return (
          <div key={i} className="relative my-6 aspect-video overflow-hidden rounded-xl">
            <Image
              src={node.attrs?.src as string}
              alt={(node.attrs?.alt as string) ?? ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        );
      default:
        return null;
    }
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

  try {
    const fetched = await db.newsArticle.findUnique({ where: { slug } });
    if (fetched) article = fetched as unknown as ArticleDetail;

    const fetchedRelated = await db.newsArticle.findMany({
      where: { status: 'PUBLISHED' },
      take: 3,
    });
    related = (fetchedRelated as unknown as ArticleDetail[]).filter(
      (a) => a.slug !== slug,
    );
  } catch {
    // DB not reachable
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

  const title = article[titleKey];
  const body = article[bodyKey];
  const publishDate = formatDate(article.published_at, locale);

  return (
    <>
      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <section className="border-b border-border bg-white py-3">
        <div className="container-page flex flex-wrap items-center justify-between gap-2">
          <nav className="flex items-center gap-1 text-body-sm text-text-secondary">
            <Link href={`/${locale}`} className="hover:text-secondary">
              {t('news.breadcrumb_home')}
            </Link>
            <span className="text-text-secondary/50">&rarr;</span>
            <Link href={`/${locale}/news`} className="hover:text-secondary">
              {t('news.breadcrumb_news')}
            </Link>
            <span className="text-text-secondary/50">&rarr;</span>
            <span className="text-text-strong line-clamp-1 max-w-[300px]">{title}</span>
          </nav>
          <span className="text-body-sm text-text-secondary">{publishDate}</span>
        </div>
      </section>

      {/* ── Article content ──────────────────────────────────────── */}
      <article className="section bg-white pt-8">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            {/* Title */}
            <h1 className="text-h2 mb-6 text-text-strong lg:text-[40px] lg:leading-[120%]">
              {title}
            </h1>

            {/* Cover image */}
            {article.cover_image && (
              <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl">
                <Image
                  src={article.cover_image}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 720px"
                />
              </div>
            )}

            {/* Placeholder image if no cover */}
            {!article.cover_image && (
              <div className="mb-8 flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-secondary-10">
                <div className="h-20 w-20 rounded-full bg-secondary-40 opacity-60" />
              </div>
            )}

            {/* Body (rich text) */}
            <div className="prose-custom">
              {renderRichText(body)}
            </div>

            {/* ── Share section ─────────────────────────────────── */}
            <ShareSection
              copyLinkLabel={t('news.copy_link')}
              shareLabel={t('news.share')}
            />
          </div>
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
                  description={extractPlainText(a[bodyKey])}
                  coverImage={a.cover_image}
                  category={a.category}
                  categoryLabel={getCategoryLabel(a.category, t)}
                  publishedAt={a.published_at}
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

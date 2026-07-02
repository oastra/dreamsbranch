import { z } from 'zod';

// Two-tier validation: DRAFT rows are permissive (only title required)
// so editors can save work-in-progress; everything the public needs is
// enforced when status leaves DRAFT.

const SLUG_RE = /^[a-z0-9-]*$/;
const SLUG_MSG = 'Slug must be lowercase with hyphens';

export const faqItemSchema = z.object({
  q_ua: z.string().min(1, 'Question (UA) is required'),
  a_ua: z.string().min(1, 'Answer (UA) is required'),
  q_en: z.string().min(1, 'Question (EN) is required'),
  a_en: z.string().min(1, 'Answer (EN) is required'),
});

const draftFaqItemSchema = z.object({
  q_ua: z.string().default(''),
  a_ua: z.string().default(''),
  q_en: z.string().default(''),
  a_en: z.string().default(''),
});

export const campaignSchema = z
  .object({
    titleUa: z.string().min(1, 'Title (UA) is required'),
    titleEn: z.string().min(1, 'Title (EN) is required'),
    slugUa: z.string().regex(SLUG_RE, SLUG_MSG).default(''),
    slugEn: z.string().regex(SLUG_RE, SLUG_MSG).default(''),
    descriptionUa: z.string().default(''),
    descriptionEn: z.string().default(''),
    coverImage: z.string().default(''),
    galleryImages: z.array(z.string()).optional(),
    goalAmount: z.coerce.number().nonnegative().default(0),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
    order: z.coerce.number().int().default(0),
    faqItems: z.array(draftFaqItemSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'DRAFT') return;
    if (!data.descriptionUa.trim())
      ctx.addIssue({ code: 'custom', path: ['descriptionUa'], message: 'Description (UA) required to publish' });
    if (!data.descriptionEn.trim())
      ctx.addIssue({ code: 'custom', path: ['descriptionEn'], message: 'Description (EN) required to publish' });
    if (!data.coverImage)
      ctx.addIssue({ code: 'custom', path: ['coverImage'], message: 'Cover image required to publish' });
    if (data.goalAmount <= 0)
      ctx.addIssue({ code: 'custom', path: ['goalAmount'], message: 'Goal must be greater than 0 to publish' });
    if (!data.slugUa)
      ctx.addIssue({ code: 'custom', path: ['slugUa'], message: 'Slug (UA) required to publish — add a title first' });
    if (!data.slugEn)
      ctx.addIssue({ code: 'custom', path: ['slugEn'], message: 'Slug (EN) required to publish — add a title first' });
    data.faqItems.forEach((it, i) => {
      if (!it.q_ua.trim()) ctx.addIssue({ code: 'custom', path: ['faqItems', i, 'q_ua'], message: `FAQ #${i + 1}: question (UA) required to publish` });
      if (!it.a_ua.trim()) ctx.addIssue({ code: 'custom', path: ['faqItems', i, 'a_ua'], message: `FAQ #${i + 1}: answer (UA) required to publish` });
      if (!it.q_en.trim()) ctx.addIssue({ code: 'custom', path: ['faqItems', i, 'q_en'], message: `FAQ #${i + 1}: question (EN) required to publish` });
      if (!it.a_en.trim()) ctx.addIssue({ code: 'custom', path: ['faqItems', i, 'a_en'], message: `FAQ #${i + 1}: answer (EN) required to publish` });
    });
  });
export type CampaignInput = z.infer<typeof campaignSchema>;

export const eventSchema = z
  .object({
    titleUa: z.string().min(1, 'Title (UA) is required'),
    titleEn: z.string().min(1, 'Title (EN) is required'),
    slugUa: z.string().regex(SLUG_RE, SLUG_MSG).default(''),
    slugEn: z.string().regex(SLUG_RE, SLUG_MSG).default(''),
    descriptionUa: z.any().optional(),
    descriptionEn: z.any().optional(),
    coverImage: z.string().default(''),
    heroImage: z.string().default(''),
    galleryImages: z.array(z.string()).optional(),
    date: z.coerce.date().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().optional(),
    locationMapUrl: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
    volunteerCta: z.boolean().default(false),
    financialReport: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'DRAFT') return;
    if (!data.coverImage)
      ctx.addIssue({ code: 'custom', path: ['coverImage'], message: 'Cover image required to publish' });
    if (!data.heroImage)
      ctx.addIssue({ code: 'custom', path: ['heroImage'], message: 'Hero image required to publish' });
    if (!data.date)
      ctx.addIssue({ code: 'custom', path: ['date'], message: 'Date required to publish' });
    if (!data.slugUa)
      ctx.addIssue({ code: 'custom', path: ['slugUa'], message: 'Slug (UA) required to publish — add a title first' });
    if (!data.slugEn)
      ctx.addIssue({ code: 'custom', path: ['slugEn'], message: 'Slug (EN) required to publish — add a title first' });
  });
export type EventInput = z.infer<typeof eventSchema>;

export const articleSchema = z
  .object({
    titleUa: z.string().min(1, 'Title (UA) is required'),
    titleEn: z.string().min(1, 'Title (EN) is required'),
    slugUa: z.string().regex(SLUG_RE, SLUG_MSG).default(''),
    slugEn: z.string().regex(SLUG_RE, SLUG_MSG).default(''),
    bodyUa: z.any().optional(),
    bodyEn: z.any().optional(),
    leadTextUa: z.string().optional(),
    leadTextEn: z.string().optional(),
    postHeroTextUa: z.string().optional(),
    postHeroTextEn: z.string().optional(),
    outroTextUa: z.string().optional(),
    outroTextEn: z.string().optional(),
    coverImage: z.string().optional(),
    bodyImage: z.string().default(''),
    galleryImages: z.array(z.string()).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().default(false),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
    publishedAt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'DRAFT') return;
    if (!data.bodyImage)
      ctx.addIssue({ code: 'custom', path: ['bodyImage'], message: 'In-text image required to publish' });
    if (!data.slugUa)
      ctx.addIssue({ code: 'custom', path: ['slugUa'], message: 'Slug (UA) required to publish — add a title first' });
    if (!data.slugEn)
      ctx.addIssue({ code: 'custom', path: ['slugEn'], message: 'Slug (EN) required to publish — add a title first' });
  });
export type ArticleInput = z.infer<typeof articleSchema>;

export const shopPhotoReportImageSchema = z.object({
  url: z.string().min(1),
  kind: z.enum(['product', 'proof', 'chat']),
  position: z.coerce.number().int().min(0).default(0),
  captionUa: z.string().optional(),
  captionEn: z.string().optional(),
});

export const shopPhotoReportSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  titleUa: z.string().min(1, 'Title (UA) is required'),
  titleEn: z.string().min(1, 'Title (EN) is required'),
  reportDate: z.string().min(1, 'Report date is required'),
  images: z.array(shopPhotoReportImageSchema).default([]),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  sortOrder: z.coerce.number().int().default(0),
});
export type ShopPhotoReportInput = z.infer<typeof shopPhotoReportSchema>;

export const shopReviewSchema = z.object({
  nameUa: z.string().min(1, 'Name (UA) is required'),
  nameEn: z.string().min(1, 'Name (EN) is required'),
  roleUa: z.string().optional(),
  roleEn: z.string().optional(),
  quoteUa: z.string().min(1, 'Quote (UA) is required'),
  quoteEn: z.string().min(1, 'Quote (EN) is required'),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  avatar: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  sortOrder: z.coerce.number().int().default(0),
  section: z
    .enum(['handmade', 'from_ukraine', 'cuisine', 'catering'])
    .nullable()
    .optional(),
});
export type ShopReviewInput = z.infer<typeof shopReviewSchema>;

export const shopProductSchema = z.object({
  titleUa: z.string().min(1, 'Title (UA) is required'),
  titleEn: z.string().min(1, 'Title (EN) is required'),
  descriptionUa: z.string().default(''),
  descriptionEn: z.string().default(''),
  priceAmount: z.coerce.number().nonnegative().default(0),
  priceCurrency: z.string().min(1).default('AUD'),
  section: z.enum(['handmade', 'from_ukraine', 'cuisine', 'catering']),
  coverImage: z.string().default(''),
  galleryImages: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  order: z.coerce.number().int().default(0),
  // null/blank = untracked (unlimited); a number = tracked stock.
  stock: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().int().min(0).nullable(),
  ),
});
export type ShopProductInput = z.infer<typeof shopProductSchema>;

export const reportSchema = z
  .object({
    year: z.coerce.number().int().min(2020).max(2030),
    titleUa: z.string().min(1, 'Title (UA) is required'),
    titleEn: z.string().min(1, 'Title (EN) is required'),
    descriptionUa: z.string().optional(),
    descriptionEn: z.string().optional(),
    coverImage: z.string().optional().default(''),
    galleryImages: z.array(z.string()).optional(),
    pdfUrlUa: z.string().url().optional().or(z.literal('')),
    pdfUrlEn: z.string().url().optional().or(z.literal('')),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'DRAFT') return;
    if (!data.coverImage)
      ctx.addIssue({ code: 'custom', path: ['coverImage'], message: 'Cover image required to publish' });
    if (!data.pdfUrlUa && !data.pdfUrlEn)
      ctx.addIssue({ code: 'custom', path: ['pdfUrlUa'], message: 'At least one PDF (UA or EN) required to publish' });
  });
export type ReportInput = z.infer<typeof reportSchema>;

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Valid email required'),
  message: z.string().min(1, 'Message is required').max(2000),
  tag: z.enum(['GENERAL', 'CATERING', 'VOLUNTEER']).default('GENERAL'),
});
export type ContactInput = z.input<typeof contactSchema>;
export type ContactOutput = z.infer<typeof contactSchema>;

export const quickLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  phone: z.string().min(3, 'Phone is required').max(40),
  tag: z.enum(['GENERAL', 'CATERING', 'VOLUNTEER']).default('GENERAL'),
});
export type QuickLeadInput = z.input<typeof quickLeadSchema>;

export const manualDonationSchema = z.object({
  campaignId: z.string().min(1, 'Campaign is required'),
  donorName: z.string().min(1, 'Donor name is required'),
  donorEmail: z.string().email().optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be positive'),
  isAnonymous: z.boolean().default(false),
  note: z.string().optional(),
});
export type ManualDonationInput = z.infer<typeof manualDonationSchema>;

export const homeSettingsSchema = z.object({
  heroImages: z.array(z.string().url()),
  yearsValue: z.string(),
  membersValue: z.string(),
  raisedValue: z.string(),
  transparencyValue: z.string(),
});
export type HomeSettingsInput = z.infer<typeof homeSettingsSchema>;

export const deliveredItemSchema = z.object({
  count: z.coerce.number().int().min(0),
  image: z.string().url('Image URL is required'),
  label_ua: z.string().min(1, 'Label (UA) is required'),
  label_en: z.string().min(1, 'Label (EN) is required'),
});

export const campaignsSettingsSchema = z.object({
  heroImages: z.array(z.string().url()).min(1, 'At least 1 hero image is required'),
  deliveredItems: z.array(deliveredItemSchema).max(3, 'At most 3 delivered cards'),
});
export type CampaignsSettingsInput = z.infer<typeof campaignsSettingsSchema>;

export const cateringPageSettingsSchema = z.object({
  faqItems: z.array(faqItemSchema),
});
export type CateringPageSettingsInput = z.infer<typeof cateringPageSettingsSchema>;

export const CATERING_EVENT_LIMITS = {
  title: 30,
  description: 320,
  location: 80,
} as const;

export const cateringEventSchema = z.object({
  titleUa: z
    .string()
    .min(1, 'Title (UA) is required')
    .max(CATERING_EVENT_LIMITS.title, `Title must be ${CATERING_EVENT_LIMITS.title} characters or fewer`),
  titleEn: z
    .string()
    .min(1, 'Title (EN) is required')
    .max(CATERING_EVENT_LIMITS.title, `Title must be ${CATERING_EVENT_LIMITS.title} characters or fewer`),
  descriptionUa: z
    .string()
    .min(1, 'Description (UA) is required')
    .max(
      CATERING_EVENT_LIMITS.description,
      `Description must be ${CATERING_EVENT_LIMITS.description} characters or fewer`,
    ),
  descriptionEn: z
    .string()
    .min(1, 'Description (EN) is required')
    .max(
      CATERING_EVENT_LIMITS.description,
      `Description must be ${CATERING_EVENT_LIMITS.description} characters or fewer`,
    ),
  locationUa: z
    .string()
    .min(1, 'Location (UA) is required')
    .max(CATERING_EVENT_LIMITS.location, `Location must be ${CATERING_EVENT_LIMITS.location} characters or fewer`),
  locationEn: z
    .string()
    .min(1, 'Location (EN) is required')
    .max(CATERING_EVENT_LIMITS.location, `Location must be ${CATERING_EVENT_LIMITS.location} characters or fewer`),
  images: z
    .array(z.string().url())
    .length(5, 'Exactly 5 images are required'),
  sortOrder: z.coerce.number().int().default(0),
});
export type CateringEventInput = z.infer<typeof cateringEventSchema>;

export const aboutSettingsSchema = z.object({
  heroImages: z
    .array(z.string().url())
    .min(4, 'At least 4 hero images are required'),
  teamImages: z
    .array(z.string().url())
    .min(4, 'At least 4 team images are required'),
  faqItems: z.array(faqItemSchema),
});
export type AboutSettingsInput = z.infer<typeof aboutSettingsSchema>;

// Alt text is reviewed by a human before publish, so the schema is permissive:
// any field may be blank/edited. `status` gates visibility (see image_alt_text).
export const altTextSchema = z.object({
  url: z.string().url(),
  alt_ua: z.string().max(300).nullable().optional(),
  alt_en: z.string().max(300).nullable().optional(),
  caption_ua: z.string().max(1000).nullable().optional(),
  caption_en: z.string().max(1000).nullable().optional(),
  status: z.enum(['pending', 'approved']).optional(),
});
export type AltTextInput = z.infer<typeof altTextSchema>;

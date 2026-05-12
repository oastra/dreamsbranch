import { z } from 'zod';

export const faqItemSchema = z.object({
  q_ua: z.string().min(1, 'Question (UA) is required'),
  a_ua: z.string().min(1, 'Answer (UA) is required'),
  q_en: z.string().min(1, 'Question (EN) is required'),
  a_en: z.string().min(1, 'Answer (EN) is required'),
});

export const campaignSchema = z.object({
  titleUa: z.string().min(1, 'Title (UA) is required'),
  titleEn: z.string().min(1, 'Title (EN) is required'),
  slugUa: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  slugEn: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  descriptionUa: z.string().min(1, 'Description (UA) is required'),
  descriptionEn: z.string().min(1, 'Description (EN) is required'),
  coverImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  goalAmount: z.coerce.number().positive('Goal must be positive'),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  order: z.coerce.number().int().default(0),
  faqItems: z.array(faqItemSchema).default([]),
});
export type CampaignInput = z.infer<typeof campaignSchema>;

export const eventSchema = z.object({
  titleUa: z.string().min(1),
  titleEn: z.string().min(1),
  slugUa: z.string().min(1).regex(/^[a-z0-9-]+$/),
  slugEn: z.string().min(1).regex(/^[a-z0-9-]+$/),
  descriptionUa: z.any().optional(),
  descriptionEn: z.any().optional(),
  coverImage: z.string().optional(),
  secondaryImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  date: z.coerce.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  locationMapUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  volunteerCta: z.boolean().default(false),
  financialReport: z.any().optional(),
});
export type EventInput = z.infer<typeof eventSchema>;

export const articleSchema = z.object({
  titleUa: z.string().min(1),
  titleEn: z.string().min(1),
  slugUa: z.string().min(1).regex(/^[a-z0-9-]+$/),
  slugEn: z.string().min(1).regex(/^[a-z0-9-]+$/),
  bodyUa: z.any().optional(),
  bodyEn: z.any().optional(),
  coverImage: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
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
});
export type ShopReviewInput = z.infer<typeof shopReviewSchema>;

export const reportSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2030),
  titleUa: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionUa: z.string().optional(),
  descriptionEn: z.string().optional(),
  coverImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  pdfUrlUa: z.string().url().optional().or(z.literal('')),
  pdfUrlEn: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
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
  heroTitleUa: z.string(),
  heroTitleEn: z.string(),
  heroSubtitleUa: z.string(),
  heroSubtitleEn: z.string(),
  heroVideoUrl: z.string().url().optional().or(z.literal('')),
  statTotalRaised: z.coerce.number().default(0),
  statPeopleHelped: z.coerce.number().int().default(0),
  ctaTextUa: z.string(),
  ctaTextEn: z.string(),
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

export const aboutSettingsSchema = z.object({
  heroImages: z
    .array(z.string().url())
    .min(4, 'At least 4 hero images are required'),
  teamImages: z
    .array(z.string().url())
    .min(4, 'At least 4 team images are required'),
  yearsValue: z.string(),
  membersValue: z.string(),
  raisedValue: z.string(),
  transparencyValue: z.string(),
  faqItems: z.array(faqItemSchema),
});
export type AboutSettingsInput = z.infer<typeof aboutSettingsSchema>;

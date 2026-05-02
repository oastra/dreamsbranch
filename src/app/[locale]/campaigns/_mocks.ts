import type { Campaign } from "@/types/database";

// Listing-level preview shape — only the fields the campaign cards need.
export type CampaignPreview = Pick<
  Campaign,
  | "id"
  | "slug"
  | "title_ua"
  | "title_en"
  | "cover_image"
  | "goal_amount"
  | "current_amount"
  | "status"
>;

export const MOCK_ACTIVE: CampaignPreview[] = [
  {
    id: "mock-a1",
    slug: "recon-drone-93",
    title_ua: "Дрон-розвідник для 93-ї бригади",
    title_en: "Recon Drone for 93rd Brigade",
    cover_image: null,
    goal_amount: 4000,
    current_amount: 800,
    status: "active",
  },
  {
    id: "mock-a2",
    slug: "ecoflow-power-station",
    title_ua: "Збір на EcoFlow",
    title_en: "EcoFlow Power Station",
    cover_image: null,
    goal_amount: 4000,
    current_amount: 800,
    status: "active",
  },
  {
    id: "mock-a3",
    slug: "field-hospital-inverter",
    title_ua: "Інвертор для польового госпіталю",
    title_en: "Inverter for Field Hospital",
    cover_image: null,
    goal_amount: 4000,
    current_amount: 800,
    status: "active",
  },
];

export const MOCK_ARCHIVED: CampaignPreview[] = [
  {
    id: "mock-r1",
    slug: "evacuation-straps",
    title_ua: "Стропи для евакуаційної машини",
    title_en: "Recovery Straps for Evacuation Vehicle",
    cover_image: null,
    goal_amount: 3700,
    current_amount: 4070,
    status: "archived",
  },
  {
    id: "mock-r2",
    slug: "thermal-imager",
    title_ua: "Тепловізор для розвідки",
    title_en: "Thermal Imager for Reconnaissance",
    cover_image: null,
    goal_amount: 5000,
    current_amount: 5250,
    status: "archived",
  },
  {
    id: "mock-r3",
    slug: "medical-kits",
    title_ua: "Медичне спорядження для батальйону",
    title_en: "Medical Kits for Battalion",
    cover_image: null,
    goal_amount: 2500,
    current_amount: 2500,
    status: "archived",
  },
  {
    id: "mock-r4",
    slug: "winter-uniforms",
    title_ua: "Зимова форма для бійців",
    title_en: "Winter Uniforms for Soldiers",
    cover_image: null,
    goal_amount: 6000,
    current_amount: 6200,
    status: "archived",
  },
  {
    id: "mock-r5",
    slug: "drone-batteries",
    title_ua: "Акумулятори для дронів",
    title_en: "Batteries for Drones",
    cover_image: null,
    goal_amount: 1800,
    current_amount: 1800,
    status: "archived",
  },
  {
    id: "mock-r6",
    slug: "field-kitchen",
    title_ua: "Польова кухня",
    title_en: "Field Kitchen",
    cover_image: null,
    goal_amount: 4500,
    current_amount: 4500,
    status: "archived",
  },
];

export function findMockPreview(slug: string): CampaignPreview | null {
  return (
    MOCK_ACTIVE.find((c) => c.slug === slug) ??
    MOCK_ARCHIVED.find((c) => c.slug === slug) ??
    null
  );
}

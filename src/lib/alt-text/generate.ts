import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

// The "shared brain" for AI alt text. One function, one image URL in, bilingual
// alt + captions out. Used by the batch agent (Phase 3) and the inline upload
// suggestion (Phase 6) so the prompt rules live in exactly one place.
//
// Sonnet, not Haiku: on real images Haiku leaked foreign words into the
// Ukrainian ("eventos") and misspelled words ("бющем" for плющем). Sonnet writes
// correct native Ukrainian with the right cultural terms (вишиванка, мотанка,
// дідух). The backlog is a one-time run, so the few extra dollars buy the
// native-quality Ukrainian that's the whole point. Every caller picks up this
// constant — change it in one place to re-tune cost vs quality.
export const ALT_TEXT_MODEL = "claude-sonnet-4-6";

const AltTextSchema = z.object({
  alt_en: z
    .string()
    .describe(
      'Short English alt text for a screen reader. Lead with the main subject. Aim under ~125 characters. Factual description of what is visible. No "image of"/"photo of". No parentheticals.',
    ),
  alt_ua: z
    .string()
    .describe(
      'Short Ukrainian alt text — natural native Ukrainian, NOT a word-for-word translation of alt_en. Lead with the main subject. Aim under ~125 characters. No "зображення"/"фото". No transliterations or Latin words in parentheses.',
    ),
  caption_en: z
    .string()
    .describe(
      "Richer English description, 1–2 sentences. More context, setting, and detail than the alt text. Still strictly factual — do not invent names, dates, or text you cannot read in the image.",
    ),
  caption_ua: z
    .string()
    .describe(
      "Richer Ukrainian description, 1–2 sentences — natural native Ukrainian, NOT a translation of caption_en. Written the way a Ukrainian speaker would describe the scene.",
    ),
});

export type GeneratedAltText = z.infer<typeof AltTextSchema>;

const SYSTEM_PROMPT = `You write accessibility alt text and captions for images on Dreams Branch of UWAA — a bilingual (Ukrainian primary, English secondary) Ukrainian charity website. Screen-reader users and search engines rely on this text, so it must be accurate and natural in BOTH languages.

Rules:
- Describe only what is actually visible. Never invent names, numbers, dates, logos, or written text you cannot clearly read.
- Alt text is short and functional: front-load the main subject, keep it under ~125 characters, and skip lead-ins like "image of" / "photo of" / "зображення" / "фото".
- Captions are 1–2 richer sentences with more context (setting, activity, mood) — still factual.
- Ukrainian is a first-class language here, not a translation. Write alt_ua and caption_ua as a native Ukrainian speaker would phrase them — do not translate the English word for word. No transliterations or Latin-script words in parentheses inside Ukrainian alt text.
- Do NOT keyword-stuff or write "for SEO". Accurate description is the SEO.`;

/**
 * Generate bilingual alt text + captions for a single public image URL.
 * Throws on failure — callers (server actions) must wrap this in try/catch.
 */
export async function generateAltText(
  imageUrl: string,
): Promise<GeneratedAltText> {
  const { object } = await generateObject({
    model: anthropic(ALT_TEXT_MODEL),
    schema: AltTextSchema,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Write alt text and captions for this image, following all the rules.",
          },
          { type: "image", image: new URL(imageUrl) },
        ],
      },
    ],
  });

  return object;
}

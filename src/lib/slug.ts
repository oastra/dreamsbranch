// Ukrainian → Latin transliteration based on the official Ukrainian
// passport romanization (KMU 2010), with a couple of pragmatic tweaks
// for digraphs at the start of a word.
const UA_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie',
  ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l',
  м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '',
  ю: 'iu', я: 'ia', "'": '', "’": '',
};

// Word-initial digraphs use "ye/yi/y/yu/ya"; mid-word forms use the map above.
const UA_INITIAL: Record<string, string> = {
  є: 'ye', ї: 'yi', й: 'y', ю: 'yu', я: 'ya',
};

function transliterate(input: string): string {
  let out = '';
  let atWordStart = true;
  for (const raw of input) {
    const ch = raw.toLowerCase();
    if (/\s/.test(ch)) {
      out += ' ';
      atWordStart = true;
      continue;
    }
    const mapped =
      atWordStart && UA_INITIAL[ch] !== undefined ? UA_INITIAL[ch]
      : UA_MAP[ch] !== undefined ? UA_MAP[ch]
      : ch;
    out += mapped;
    atWordStart = false;
  }
  return out;
}

export function slugify(input: string): string {
  return transliterate(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Resolve a public-route slug to its row, locale-aware. Falls back to the
// legacy `slug` column for old inbound links and reports the canonical URL
// the caller should redirect to in that case.
type SlugColumn = 'slug' | 'slug_ua' | 'slug_en';
type Row = Record<string, unknown>;
type Model = {
  findUnique: (args: { where: { slug?: string; slugUa?: string; slugEn?: string } }) => Promise<Row | null>;
};

export async function resolveLocaleSlug(
  model: Model,
  slug: string,
  locale: string,
  pathPrefix: string,
): Promise<{ row: Row | null; redirectTo: string | null }> {
  const localeKey = locale === 'ua' ? 'slugUa' : 'slugEn';
  const otherKey = locale === 'ua' ? 'slugEn' : 'slugUa';
  const localeColumn: SlugColumn = locale === 'ua' ? 'slug_ua' : 'slug_en';

  // 1. Direct hit on the current locale's slug column.
  const direct = await model.findUnique({ where: { [localeKey]: slug } });
  if (direct) return { row: direct, redirectTo: null };

  // 2. Legacy single-`slug` column (pre per-locale-slugs migration). On match
  //    we redirect to the canonical per-locale URL if we have one, otherwise
  //    render the row as-is.
  const legacy = await model.findUnique({ where: { slug } });
  if (legacy) {
    const canonical = legacy[localeColumn] as string | undefined;
    if (canonical && canonical !== slug) {
      return { row: null, redirectTo: `${pathPrefix}/${canonical}` };
    }
    return { row: legacy, redirectTo: null };
  }

  // 3. Cross-locale hit — visitor pasted /ua/news/<english-slug> or vice-versa.
  //    Redirect to the equivalent slug in the requested locale; if that column
  //    is empty, just render the row at the existing URL.
  const cross = await model.findUnique({ where: { [otherKey]: slug } });
  if (cross) {
    const canonical = cross[localeColumn] as string | undefined;
    if (canonical && canonical !== slug) {
      return { row: null, redirectTo: `${pathPrefix}/${canonical}` };
    }
    return { row: cross, redirectTo: null };
  }

  return { row: null, redirectTo: null };
}

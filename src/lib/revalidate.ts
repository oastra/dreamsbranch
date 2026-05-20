import { revalidatePath } from 'next/cache';
import { routing } from '@/i18n/routing';

/**
 * Revalidate the same path under every supported locale.
 *
 * Next.js's `revalidatePath('/[locale]/about', 'page')` form with a dynamic
 * segment has been unreliable on Vercel — pages stayed stale after admin
 * saves even though localhost was fresh. Expanding the call into concrete
 * locale paths (one revalidatePath per locale) is what actually propagates
 * to the ISR cache.
 *
 * Pass the path WITHOUT the leading locale segment, e.g. "/about" or
 * "/shop/catering". Use an empty string for the home page.
 */
export function revalidateLocalizedPath(pathAfterLocale: string): void {
  const suffix = pathAfterLocale.startsWith('/')
    ? pathAfterLocale
    : `/${pathAfterLocale}`;
  for (const locale of routing.locales) {
    const path = pathAfterLocale === '' || suffix === '/' ? `/${locale}` : `/${locale}${suffix}`;
    revalidatePath(path);
  }
}

// Global 404 fallback — middleware should normally redirect to /[locale],
// so this only fires for truly unmatched root-level paths.
import { redirect } from 'next/navigation';

export default function GlobalNotFound() {
  redirect('/ua');
}

import { notFound } from 'next/navigation';

// Catch-all: any unmatched path inside /[locale]/... renders the locale not-found.tsx
export default function CatchAll() {
  notFound();
}

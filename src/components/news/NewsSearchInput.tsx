'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import SearchIcon from '@/components/icons/SearchIcon';

interface Props {
  placeholder: string;
}

export function NewsSearchInput({ placeholder }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [value, setValue] = useState(sp.get('q') ?? '');

  // Push the typed value into the `?q=` URL param, but wait until the user
  // pauses typing (300ms) so we don't refresh the list on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      const trimmed = value.trim();

      if (trimmed) next.set('q', trimmed);
      else next.delete('q');

      // A new search resets the "show more" pagination.
      next.delete('visible');

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }, 300);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative flex-1">
      <SearchIcon
        size={20}
        className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-text-secondary"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-13 w-full rounded-full border border-border bg-white pr-5 pl-12 text-body text-text-strong outline-none transition-colors focus:border-secondary lg:h-13.5"
      />
    </div>
  );
}

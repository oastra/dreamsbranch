'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

/**
 * Wires an admin form's Cancel button so it:
 *   1. Pops a native confirm when the form is `dirty`, before navigating
 *      back to the list.
 *   2. Also blocks browser-level navigation (back button, tab close,
 *      page reload, locale switcher) while the form is dirty, via
 *      `beforeunload`.
 *
 * Why `window.confirm` over a styled modal: the cancel sits inside the
 * form, the confirm needs no loading state, and matching the native
 * `beforeunload` prompt's voice avoids a UX split between the in-app
 * and out-of-app paths.
 */
export function useCancelWithConfirm(href: string, dirty: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      // Most browsers ignore the custom message and show their own,
      // but setting returnValue is what triggers the prompt.
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return useCallback(() => {
    if (
      dirty &&
      !window.confirm('You have unsaved changes. Cancel without saving?')
    ) {
      return;
    }
    router.push(href);
  }, [dirty, href, router]);
}

/**
 * Helpers for treating past events as "archived" on the public site
 * without needing a cron job or DB trigger.
 *
 * The admin can still set the persisted `status` to ACTIVE, ARCHIVED,
 * or DRAFT — but once the event's end time (or start time, when no
 * end set) has passed, the public pages display it as archived.
 */

export type EventWhenInputs = {
  event_date: string;
  start_time: string;
  end_time: string | null;
};

/**
 * Returns true when the event's window has ended.
 *
 * - If `end_time` is set, compare against it directly.
 * - Otherwise fall back to `start_time`. Without a stated duration we
 *   can't tell when an event "really" ends, so the boundary lands on
 *   start. Anything reasonably long-running should set `end_time`.
 * - As a final fallback (defensive — start_time is required in the
 *   schema), compare the `event_date` to the end of that calendar day.
 */
export function isEventPast(
  ev: EventWhenInputs,
  now: Date = new Date(),
): boolean {
  if (ev.end_time) return new Date(ev.end_time).getTime() < now.getTime();
  if (ev.start_time) return new Date(ev.start_time).getTime() < now.getTime();
  // Treat date-only as ending at 23:59:59 local time on that day.
  const endOfDay = new Date(`${ev.event_date}T23:59:59`);
  return endOfDay.getTime() < now.getTime();
}

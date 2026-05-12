type Props = {
  /** Admin who last touched this row. May be null for legacy data. */
  adminId?: string | null;
  /** ISO timestamp of the last update. */
  updatedAt?: string | null;
  /** Map of admin id → display name, built once per page. */
  admins: Record<string, string>;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return '';
  const mins = Math.max(1, Math.floor(diff / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function EditedByCell({ adminId, updatedAt, admins }: Props) {
  const name = adminId ? admins[adminId] : null;
  if (!name && !updatedAt) {
    return <span className="text-text-tertiary">—</span>;
  }
  return (
    <div className="text-body-sm leading-tight">
      <div className="font-medium text-text-strong">{name ?? 'Unknown'}</div>
      {updatedAt && (
        <div className="text-text-tertiary">{timeAgo(updatedAt)}</div>
      )}
    </div>
  );
}

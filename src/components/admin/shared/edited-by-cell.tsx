type Props = {
  /** Admin who created the row. May be null for legacy data. */
  createdBy?: string | null;
  /** ISO timestamp of when the row was created. */
  createdAt?: string | null;
  /** Admin who last touched the row. May be null for legacy data. */
  updatedBy?: string | null;
  /** ISO timestamp of the last update. */
  updatedAt?: string | null;
  /** Map of admin id → display name, built once per page. */
  admins: Record<string, string>;
  /**
   * Which slice of activity to render. `created` and `edited` are used
   * when the parent table has its own column for each. `both` (default)
   * stacks them in one cell.
   */
  kind?: 'both' | 'created' | 'edited';
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

function resolveName(adminId: string | null | undefined, admins: Record<string, string>): string | null {
  if (!adminId) return null;
  return admins[adminId] ?? 'Unknown';
}

/**
 * Two-line admin activity cell:
 *   Created: <name> · <relative time>
 *   Edited:  <name> · <relative time>
 *
 * The "Edited" line is omitted when the row hasn't been updated since
 * creation (same admin + timestamps within a few seconds) so the cell
 * stays compact for fresh content.
 */
function Line({ name, iso }: { name: string | null; iso: string | null | undefined }) {
  if (!name && !iso) return <span className="text-text-tertiary">—</span>;
  return (
    <div className="text-body-sm leading-tight">
      <div className="font-medium text-text-strong">{name ?? 'Unknown'}</div>
      {iso && <div className="text-text-tertiary">{timeAgo(iso)}</div>}
    </div>
  );
}

export function EditedByCell({
  createdBy,
  createdAt,
  updatedBy,
  updatedAt,
  admins,
  kind = 'both',
}: Props) {
  const createdName = resolveName(createdBy, admins);
  const updatedName = resolveName(updatedBy, admins);

  if (kind === 'created') {
    return <Line name={createdName} iso={createdAt} />;
  }

  // Treat "edited" as redundant when it matches the create event closely
  // (within 5s) — keeps a freshly-created row's "Edited" cell from
  // duplicating its own creation info.
  const editedDuplicatesCreate =
    createdBy === updatedBy &&
    createdAt &&
    updatedAt &&
    Math.abs(new Date(updatedAt).getTime() - new Date(createdAt).getTime()) <
      5000;

  if (kind === 'edited') {
    if (editedDuplicatesCreate) {
      return <span className="text-text-tertiary">—</span>;
    }
    return <Line name={updatedName} iso={updatedAt} />;
  }

  // 'both' — stacked cell (kept for the single-column layout).
  if (!createdName && !createdAt && !updatedName && !updatedAt) {
    return <span className="text-text-tertiary">—</span>;
  }
  return (
    <div className="text-body-sm leading-tight space-y-1">
      {(createdName || createdAt) && (
        <div>
          <span className="text-text-tertiary">Created: </span>
          <span className="font-medium text-text-strong">
            {createdName ?? 'Unknown'}
          </span>
          {createdAt && (
            <span className="text-text-tertiary"> · {timeAgo(createdAt)}</span>
          )}
        </div>
      )}
      {!editedDuplicatesCreate && (updatedName || updatedAt) && (
        <div>
          <span className="text-text-tertiary">Edited: </span>
          <span className="font-medium text-text-strong">
            {updatedName ?? 'Unknown'}
          </span>
          {updatedAt && (
            <span className="text-text-tertiary"> · {timeAgo(updatedAt)}</span>
          )}
        </div>
      )}
    </div>
  );
}

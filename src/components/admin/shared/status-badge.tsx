import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    'bg-green-100 text-green-700 border-green-200',
  PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
  DRAFT:     'bg-amber-100 text-amber-700 border-amber-200',
  ARCHIVED:  'bg-gray-100 text-gray-600 border-gray-200',
  PENDING:   'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-purple-100 text-purple-700 border-purple-200',
  FAILED:    'bg-red-100 text-red-700 border-red-200',
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <Badge className={cn('border text-xs font-medium', STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600')}>
      {label}
    </Badge>
  );
}

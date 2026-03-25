import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
}

export function PageHeader({ title, description, createHref, createLabel }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-h2">{title}</h1>
        {description && <p className="text-body text-text-secondary mt-1">{description}</p>}
      </div>
      {createHref && (
        <Link href={createHref}>
          <Button variant="secondary" size="default" className="rounded-full">
            <Plus className="w-4 h-4" />
            {createLabel ?? 'New'}
          </Button>
        </Link>
      )}
    </div>
  );
}

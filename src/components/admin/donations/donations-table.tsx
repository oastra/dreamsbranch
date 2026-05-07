'use client';
import { useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { formatCurrency } from '@/lib/utils';

interface Donation {
  id: string;
  donor_name: string | null;
  is_anonymous: boolean;
  amount: number;
  source: string;
  status: string;
  created_at: string;
}

const SOURCES = ['STRIPE', 'PAYPAL', 'MANUAL'];

interface Props {
  donations: Donation[];
  page: number;
  perPage: number;
  total: number;
  totalAll: number;
  statusFilter: string;
  sourceFilter: string;
}

export function DonationsTable({
  donations,
  page,
  perPage,
  total,
  totalAll,
  statusFilter,
  sourceFilter,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState('');

  function pushParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === 'ALL' || v === '') next.delete(k);
      else next.set(k, v);
    }
    startTransition(() => {
      router.push(`?${next.toString()}`);
    });
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return donations;
    return donations.filter((d) => {
      const name = d.is_anonymous ? 'anonymous' : d.donor_name ?? '';
      return name.toLowerCase().includes(q);
    });
  }, [donations, search]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor on this page"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => pushParams({ status: v, page: null })}
          >
            <TabsList>
              <TabsTrigger value="ALL">All ({totalAll})</TabsTrigger>
              <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="FAILED">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select
            value={sourceFilter}
            onValueChange={(v) => pushParams({ source: v ?? 'ALL', page: null })}
          >
            <SelectTrigger className="h-8 min-w-[10rem]"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All sources</SelectItem>
              {SOURCES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-secondary py-8">
                  {total === 0 ? 'No donations match your filters' : 'No donations on this page match your search'}
                </TableCell>
              </TableRow>
            )}
            {visible.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="text-text-secondary text-body-sm">{new Date(d.created_at).toLocaleDateString('en-AU')}</TableCell>
                <TableCell>{d.is_anonymous ? 'Anonymous' : d.donor_name || '—'}</TableCell>
                <TableCell className="font-medium">{formatCurrency(Number(d.amount))}</TableCell>
                <TableCell className="text-text-secondary">{d.source}</TableCell>
                <TableCell><StatusBadge status={d.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-text-secondary">
          {total === 0
            ? 'No results'
            : `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => pushParams({ page: String(page - 1) })}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </Button>
          <span className="text-xs text-text-secondary">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => pushParams({ page: String(page + 1) })}
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

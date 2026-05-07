'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

type StatusFilter = 'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';

export function DonationsTable({ donations }: { donations: Donation[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const d of donations) if (d.source) set.add(d.source);
    return Array.from(set).sort();
  }, [donations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return donations.filter((d) => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (sourceFilter !== 'ALL' && d.source !== sourceFilter) return false;
      if (!q) return true;
      const name = d.is_anonymous ? 'anonymous' : (d.donor_name ?? '');
      return name.toLowerCase().includes(q);
    });
  }, [donations, search, statusFilter, sourceFilter]);

  const counts = useMemo(() => {
    const c = { ALL: donations.length, COMPLETED: 0, PENDING: 0, FAILED: 0, REFUNDED: 0 } as Record<StatusFilter, number>;
    for (const d of donations) {
      if (d.status === 'COMPLETED' || d.status === 'PENDING' || d.status === 'FAILED' || d.status === 'REFUNDED') c[d.status]++;
    }
    return c;
  }, [donations]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by donor name"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <TabsList>
              <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
              <TabsTrigger value="COMPLETED">Completed ({counts.COMPLETED})</TabsTrigger>
              <TabsTrigger value="PENDING">Pending ({counts.PENDING})</TabsTrigger>
              <TabsTrigger value="FAILED">Failed ({counts.FAILED})</TabsTrigger>
            </TabsList>
          </Tabs>
          {sourceOptions.length > 0 && (
            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v ?? 'ALL')}>
              <SelectTrigger className="h-8 min-w-[10rem]"><SelectValue placeholder="Source" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All sources</SelectItem>
                {sourceOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-secondary py-8">
                  {donations.length === 0 ? 'No donations yet' : 'No donations match your filters'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((d) => (
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

      {donations.length > 0 && (
        <p className="text-xs text-text-secondary mt-3">
          Showing {filtered.length} of {donations.length}
        </p>
      )}
    </>
  );
}

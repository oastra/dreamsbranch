'use client';
import { useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { markContactRead } from '@/lib/actions/contacts';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  email: string;
  tag: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const TAGS = ['GENERAL', 'CATERING', 'VOLUNTEER'];

interface Props {
  contacts: Contact[];
  page: number;
  perPage: number;
  total: number;
  totalAll: number;
  totalUnread: number;
  statusFilter: string;
  tagFilter: string;
}

export function ContactsTable({
  contacts,
  page,
  perPage,
  total,
  totalAll,
  totalUnread,
  statusFilter,
  tagFilter,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [marking, setMarking] = useState<string | null>(null);
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
    if (!q) return contacts;
    return contacts.filter((c) =>
      `${c.name} ${c.email} ${c.message}`.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const totalRead = totalAll - totalUnread;

  async function handleMarkRead(id: string) {
    setMarking(id);
    await markContactRead(id);
    setMarking(null);
    toast.success('Marked as read');
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search this page"
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
              <TabsTrigger value="UNREAD">Unread ({totalUnread})</TabsTrigger>
              <TabsTrigger value="READ">Read ({totalRead})</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select
            value={tagFilter}
            onValueChange={(v) => pushParams({ tag: v ?? 'ALL', page: null })}
          >
            <SelectTrigger className="h-8 min-w-[10rem]"><SelectValue placeholder="Tag" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All tags</SelectItem>
              {TAGS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-text-secondary py-8">
                  {total === 0 ? 'No messages match your filters' : 'No messages on this page match your search'}
                </TableCell>
              </TableRow>
            )}
            {visible.map((c) => (
              <TableRow key={c.id} className={cn(!c.is_read && 'bg-brand-blue-light/30')}>
                <TableCell className="text-text-secondary text-body-sm">{new Date(c.created_at).toLocaleDateString('en-AU')}</TableCell>
                <TableCell className="font-medium">
                  {c.name}
                  {!c.is_read && <span className="ml-2 w-2 h-2 rounded-full bg-brand-blue inline-block" />}
                </TableCell>
                <TableCell>
                  <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{c.tag}</Badge></TableCell>
                <TableCell className="max-w-xs truncate text-text-secondary">{c.message}</TableCell>
                <TableCell>
                  {!c.is_read && (
                    <Button size="sm" variant="outline" disabled={marking === c.id} onClick={() => handleMarkRead(c.id)}>
                      {marking === c.id ? '...' : 'Mark read'}
                    </Button>
                  )}
                </TableCell>
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

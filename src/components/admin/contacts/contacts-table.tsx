'use client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
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

type ReadFilter = 'ALL' | 'UNREAD' | 'READ';

export function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const [marking, setMarking] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState<ReadFilter>('ALL');
  const [tagFilter, setTagFilter] = useState<string>('ALL');

  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of contacts) if (c.tag) set.add(c.tag);
    return Array.from(set).sort();
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (readFilter === 'UNREAD' && c.is_read) return false;
      if (readFilter === 'READ' && !c.is_read) return false;
      if (tagFilter !== 'ALL' && c.tag !== tagFilter) return false;
      if (!q) return true;
      const hay = `${c.name} ${c.email} ${c.message}`.toLowerCase();
      return hay.includes(q);
    });
  }, [contacts, search, readFilter, tagFilter]);

  const counts = useMemo(() => {
    let unread = 0;
    for (const c of contacts) if (!c.is_read) unread++;
    return { all: contacts.length, unread, read: contacts.length - unread };
  }, [contacts]);

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
            placeholder="Search name, email or message"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={readFilter} onValueChange={(v) => setReadFilter(v as ReadFilter)}>
            <TabsList>
              <TabsTrigger value="ALL">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="UNREAD">Unread ({counts.unread})</TabsTrigger>
              <TabsTrigger value="READ">Read ({counts.read})</TabsTrigger>
            </TabsList>
          </Tabs>
          {tagOptions.length > 0 && (
            <Select value={tagFilter} onValueChange={(v) => setTagFilter(v ?? 'ALL')}>
              <SelectTrigger className="h-8 min-w-[10rem]"><SelectValue placeholder="Tag" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All tags</SelectItem>
                {tagOptions.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-text-secondary py-8">
                  {contacts.length === 0 ? 'No messages yet' : 'No messages match your filters'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((c) => (
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

      {contacts.length > 0 && (
        <p className="text-xs text-text-secondary mt-3">
          Showing {filtered.length} of {contacts.length}
        </p>
      )}
    </>
  );
}

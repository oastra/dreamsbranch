'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { markContactRead } from '@/lib/actions/contacts';
import { cn } from '@/lib/utils';

interface Contact { id: string; name: string; email: string; tag: string; message: string; is_read: boolean; created_at: string; }

export function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const [marking, setMarking] = useState<string | null>(null);

  async function handleMarkRead(id: string) {
    setMarking(id);
    await markContactRead(id);
    setMarking(null);
    toast.success('Marked as read');
  }

  return (
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
          {contacts.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-text-secondary py-8">No messages yet</TableCell></TableRow>
          )}
          {contacts.map((c) => (
            <TableRow key={c.id} className={cn(!c.is_read && 'bg-brand-blue-light/30')}>
              <TableCell className="text-text-secondary text-body-sm">{new Date(c.created_at).toLocaleDateString('en-AU')}</TableCell>
              <TableCell className="font-medium">
                {c.name}
                {!c.is_read && <span className="ml-2 w-2 h-2 rounded-full bg-brand-blue inline-block" />}
              </TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell><Badge variant="outline" className="text-xs">{c.tag}</Badge></TableCell>
              <TableCell className="max-w-xs truncate text-text-secondary">{c.message}</TableCell>
              <TableCell>
                {!c.is_read && (
                  <Button size="xs" variant="outline" disabled={marking === c.id} onClick={() => handleMarkRead(c.id)}>
                    {marking === c.id ? '...' : 'Mark read'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

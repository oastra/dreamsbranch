'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { DeleteConfirmDialog } from '@/components/admin/shared/delete-confirm-dialog';
import { deleteArticle } from '@/lib/actions/news';

interface Article { id: string; title_en: string; category: string; is_featured: boolean; status: string; created_at: string; }

export function NewsTable({ articles, userRole }: { articles: Article[]; userRole: string }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canDelete = userRole === 'SUPER_ADMIN';

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteArticle(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result.success) toast.success('Article deleted');
    else toast.error('Failed to delete');
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-text-secondary py-8">No articles yet</TableCell></TableRow>
            )}
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.title_en}</TableCell>
                <TableCell className="text-text-secondary">{article.category || '—'}</TableCell>
                <TableCell>{article.is_featured ? '⭐' : '—'}</TableCell>
                <TableCell><StatusBadge status={article.status} /></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/news/${article.id}`}><Pencil className="w-4 h-4 mr-2" />Edit</Link>
                      </DropdownMenuItem>
                      {canDelete && (
                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(article.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} itemName="article" />
    </>
  );
}

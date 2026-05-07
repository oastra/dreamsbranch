'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { DeleteConfirmDialog } from '@/components/admin/shared/delete-confirm-dialog';
import { deleteArticle } from '@/lib/actions/news';

interface Article {
  id: string;
  title_en: string;
  title_ua?: string;
  category: string;
  is_featured: boolean;
  status: string;
  created_at: string;
}

type StatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export function NewsTable({ articles, userRole }: { articles: Article[]; userRole: string }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const canDelete = userRole === 'SUPER_ADMIN';

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const a of articles) if (a.category) set.add(a.category);
    return Array.from(set).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
      if (!q) return true;
      const hay = `${a.title_en ?? ''} ${a.title_ua ?? ''} ${a.category ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [articles, search, statusFilter, categoryFilter]);

  const counts = useMemo(() => {
    const c = { ALL: articles.length, DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0 } as Record<StatusFilter, number>;
    for (const x of articles) {
      if (x.status === 'DRAFT' || x.status === 'PUBLISHED' || x.status === 'ARCHIVED') c[x.status]++;
    }
    return c;
  }, [articles]);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <TabsList>
              <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
              <TabsTrigger value="DRAFT">Draft ({counts.DRAFT})</TabsTrigger>
              <TabsTrigger value="PUBLISHED">Published ({counts.PUBLISHED})</TabsTrigger>
              <TabsTrigger value="ARCHIVED">Archived ({counts.ARCHIVED})</TabsTrigger>
            </TabsList>
          </Tabs>
          {categoryOptions.length > 0 && (
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? 'ALL')}>
              <SelectTrigger className="h-8 min-w-[10rem]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All categories</SelectItem>
                {categoryOptions.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
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
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-secondary py-8">
                  {articles.length === 0 ? 'No articles yet' : 'No articles match your filters'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((article) => {
              const title = article.title_en || article.title_ua || '(untitled)';
              return (
                <TableRow key={article.id} className="hover:bg-surface-tertiary/40">
                  <TableCell className="font-medium">
                    <Link href={`/admin/news/${article.id}`} className="hover:underline">
                      {title}
                    </Link>
                  </TableCell>
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      {articles.length > 0 && (
        <p className="text-xs text-text-secondary mt-3">
          Showing {filtered.length} of {articles.length}
        </p>
      )}

      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} itemName="article" />
    </>
  );
}

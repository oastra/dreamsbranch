'use client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  itemName?: string;
}

export function DeleteConfirmDialog({ open, onOpenChange, onConfirm, loading, itemName }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {itemName ?? 'item'}?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button size="lg" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button size="lg" variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" aria-hidden />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

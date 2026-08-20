// src/components/ui/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, total, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-xs text-text-muted">{total} résultat{total > 1 ? 's' : ''}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-medium text-text-secondary">
          {page} / {pages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
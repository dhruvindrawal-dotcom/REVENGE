import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from './primitives';

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[--radius-lg] border border-dashed border-[--color-line] px-6 py-16 text-center">
      <div className="mb-4 text-[--color-ink]/30">{icon ?? <Inbox className="h-10 w-10" />}</div>
      <h3 className="font-display text-lg text-[--color-ink]">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-[--color-ink-soft]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[--radius-lg] border border-[--color-madder]/25 bg-[--color-madder]/5 px-6 py-14 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-[--color-madder]" />
      <h3 className="font-display text-lg text-[--color-ink]">Something went wrong</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[--color-ink-soft]">{message ?? 'Please try again in a moment.'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-[--color-ink-soft]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[--color-ink]/15 border-t-[--color-indigo]" />
      {label}
    </div>
  );
}

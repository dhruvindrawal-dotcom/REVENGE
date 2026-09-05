import { Star, ShieldCheck } from 'lucide-react';

export function Rating({ value, count, size = 'sm' }: { value: number; count?: number; size?: 'sm' | 'md' }) {
  const px = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <span className="inline-flex items-center gap-1 text-[--color-ink]">
      <Star className={`${px} fill-[--color-marigold] text-[--color-marigold]`} />
      <span className="text-sm font-medium">{value.toFixed(1)}</span>
      {count != null && <span className="text-xs text-[--color-ink-soft]">({count})</span>}
    </span>
  );
}

export function VerificationBadge({ verified }: { verified: boolean }) {
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[--color-paisley]/12 px-2 py-0.5 text-xs font-medium text-[--color-paisley]">
      <ShieldCheck className="h-3.5 w-3.5" /> Verified
    </span>
  );
}

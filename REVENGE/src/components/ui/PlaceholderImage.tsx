import { ImageIcon } from 'lucide-react';

const GRADIENTS = [
  ['#223A54', '#34506F'],
  ['#B14430', '#D98E1B'],
  ['#3F6B4F', '#6A9179'],
  ['#D98E1B', '#F0B24E'],
  ['#4A4237', '#221B14'],
];

function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Renders a stylized gradient tile in place of a real photo. This project
 * scaffold has no image hosting configured — swap this for real provider
 * photos (Supabase Storage `provider-portfolio` bucket) once available.
 */
export function PlaceholderImage({ seed, className, label }: { seed: string; className?: string; label?: string }) {
  const idx = hashSeed(seed) % GRADIENTS.length;
  const [from, to] = GRADIENTS[idx];
  return (
    <div
      className={className}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      role="img"
      aria-label={label ?? seed}
    >
      <div className="flex h-full w-full items-center justify-center">
        <ImageIcon className="h-6 w-6 text-white/40" />
      </div>
    </div>
  );
}

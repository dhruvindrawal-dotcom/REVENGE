import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/primitives';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <Compass className="mb-4 h-10 w-10 text-[--color-ink]/30" />
      <h1 className="font-display text-2xl text-[--color-ink]">Page not found</h1>
      <p className="mt-2 text-sm text-[--color-ink-soft]">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-6"><Button>Back home</Button></Link>
    </div>
  );
}

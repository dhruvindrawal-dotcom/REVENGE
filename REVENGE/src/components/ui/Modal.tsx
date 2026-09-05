import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-[--color-ink]/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[--radius-lg] bg-[--color-paper] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="font-display text-xl text-[--color-ink]">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-[--color-ink]/60 hover:bg-[--color-ink]/8">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

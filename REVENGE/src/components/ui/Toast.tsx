import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info';
interface ToastItem { id: string; message: string; tone: ToastTone; }

const ToastContext = createContext<{ show: (message: string, tone?: ToastTone) => void } | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const icons: Record<ToastTone, ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-[--color-paisley]" />,
    error: <XCircle className="h-5 w-5 text-[--color-madder]" />,
    info: <Info className="h-5 w-5 text-[--color-indigo]" />,
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-start gap-2.5 rounded-[--radius-md] border border-[--color-line] bg-white px-4 py-3 shadow-lg animate-rise-in">
            {icons[t.tone]}
            <p className="flex-1 text-sm text-[--color-ink]">{t.message}</p>
            <button onClick={() => setToasts((cur) => cur.filter((x) => x.id !== t.id))} className="text-[--color-ink]/40 hover:text-[--color-ink]">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

import { useState, type ReactNode } from 'react';

export function Tabs({ tabs, defaultTab }: { tabs: { id: string; label: string; content: ReactNode }[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  return (
    <div>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-[--color-line]">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active === t.id ? 'border-[--color-indigo] text-[--color-indigo]' : 'border-transparent text-[--color-ink-soft] hover:text-[--color-ink]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-5">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}

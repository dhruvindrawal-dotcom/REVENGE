import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Mic } from 'lucide-react';
import { isGeminiConfigured } from '../../services/ai';

const SUGGESTIONS = [
  'I need a reliable electrician near me',
  'Find a wedding photographer',
  'Traditional handicrafts near Delhi',
  'Find a local food experience',
  'I need a carpenter for custom furniture',
];

export function AISearchBox({ size = 'lg' }: { size?: 'lg' | 'md' }) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const submit = (q?: string) => {
    const query = (q ?? value).trim();
    if (!query) return;
    navigate(`/discover?q=${encodeURIComponent(query)}`);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className={`flex items-center gap-2 rounded-[--radius-lg] border border-[--color-line] bg-white p-2 shadow-sm ${size === 'lg' ? 'sm:p-2.5' : ''}`}>
        <Sparkles className="ml-2 h-5 w-5 shrink-0 text-[--color-marigold]" aria-hidden />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tell us what you need…"
          aria-label="Describe what you need"
          className={`w-full bg-transparent text-[--color-ink] placeholder:text-[--color-ink]/40 focus:outline-none ${size === 'lg' ? 'py-2.5 text-base' : 'py-1.5 text-sm'}`}
        />
        <button type="button" aria-label="Voice search (coming soon)" className="hidden shrink-0 rounded-full p-2 text-[--color-ink]/40 hover:bg-[--color-ink]/5 sm:block" title="Voice search — coming soon">
          <Mic className="h-4 w-4" />
        </button>
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1.5 rounded-[--radius-sm] bg-[--color-indigo] px-4 py-2.5 text-sm font-medium text-[--color-paper] hover:bg-[--color-indigo-dim]"
        >
          <Search className="h-4 w-4" /> <span className="hidden sm:inline">Search</span>
        </button>
      </form>
      <div className="mt-1.5 flex items-center gap-1.5 pl-1 text-xs text-[--color-ink]/40">
        <Sparkles className="h-3 w-3" />
        {isGeminiConfigured ? 'AI-powered search' : 'AI-powered search (demo fallback mode — add a Gemini key for live parsing)'}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            className="rounded-full border border-[--color-line] bg-white/60 px-3 py-1.5 text-xs text-[--color-ink-soft] transition-colors hover:border-[--color-indigo]/40 hover:text-[--color-ink]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

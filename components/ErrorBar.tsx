'use client';

import { useStore } from '@/lib/store';

export default function ErrorBar() {
  const error = useStore((s) => s.error);
  const setError = useStore((s) => s.setError);

  if (!error) return null;

  return (
    <div className="flex items-start gap-3 bg-red-900/80 border border-red-700 text-red-100 px-4 py-2 text-sm">
      <span className="font-semibold shrink-0">Error:</span>
      <span className="flex-1 font-mono text-xs whitespace-pre-wrap break-all">
        {error}
      </span>
      <button
        onClick={() => setError(null)}
        className="shrink-0 text-red-300 hover:text-white transition-colors ml-2"
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  );
}

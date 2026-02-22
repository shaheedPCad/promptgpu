'use client';

import { useStore } from '@/lib/store';

export default function ModelSwitcher() {
  const model = useStore((s) => s.model);
  const setModel = useStore((s) => s.setModel);

  return (
    <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
      <button
        onClick={() => setModel('claude')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          model === 'claude'
            ? 'bg-zinc-600 text-white'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        Claude
      </button>
      <button
        onClick={() => setModel('gpt4o')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          model === 'gpt4o'
            ? 'bg-zinc-600 text-white'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        GPT-4o
      </button>
    </div>
  );
}

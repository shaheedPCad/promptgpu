'use client';

import { useStore } from '@/lib/store';

export default function SceneControls() {
  const isPlaying = useStore((s) => s.isPlaying);
  const togglePlay = useStore((s) => s.togglePlay);
  const reset = useStore((s) => s.reset);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={togglePlay}
        className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <>
            <span>⏸</span>
            <span>Pause</span>
          </>
        ) : (
          <>
            <span>▶</span>
            <span>Play</span>
          </>
        )}
      </button>
      <button
        onClick={reset}
        className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        title="Reset"
      >
        <span>↺</span>
        <span>Reset</span>
      </button>
    </div>
  );
}

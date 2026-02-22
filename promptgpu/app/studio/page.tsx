import Link from 'next/link';
import CanvasWrapper from '@/components/CanvasWrapper';
import ModelSwitcher from '@/components/ModelSwitcher';
import SceneControls from '@/components/SceneControls';
import ErrorBar from '@/components/ErrorBar';
import Chat from '@/components/Chat';

export default function StudioPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            Prompt<span className="text-blue-400">GPU</span>
          </Link>
          <SceneControls />
        </div>
        <ModelSwitcher />
      </header>

      {/* Error bar */}
      <ErrorBar />

      {/* Main split layout */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas — left 60% */}
        <div className="flex-[3] min-w-0 bg-black">
          <CanvasWrapper />
        </div>

        {/* Divider */}
        <div className="w-px bg-zinc-800 shrink-0" />

        {/* Chat — right 40% */}
        <div className="flex-[2] min-w-0 flex flex-col">
          <Chat />
        </div>
      </div>
    </div>
  );
}

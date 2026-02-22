import Link from 'next/link';

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-900">
      <Link href="/" className="font-display font-bold text-lg tracking-tight text-white">
        Prompt<span className="text-blue-400">GPU</span>
      </Link>
      <Link
        href="/studio"
        className="px-4 py-2 text-sm font-display font-semibold border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
      >
        Launch Studio
      </Link>
    </nav>
  );
}

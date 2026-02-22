'use client';

import { useState } from 'react';
import Link from 'next/link';
import HeroCanvasWrapper from './HeroCanvasWrapper';

export default function HeroSection() {
  const [gpuUnsupported, setGpuUnsupported] = useState(false);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Layer 1: CSS fallback gradient — always present, canvas renders on top */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 30% 50%, #0d2847 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 70% 40%, #0a1628 0%, transparent 60%),
            #09090b
          `,
        }}
      />

      {/* Layer 2: Live WebGPU shader */}
      {!gpuUnsupported && (
        <HeroCanvasWrapper
          className="absolute inset-0 w-full h-full"
          onUnsupported={() => setGpuUnsupported(true)}
        />
      )}

      {/* Layer 3: Gradient scrim — fades hero into page background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950" />

      {/* Layer 4: Content */}
      <div className="relative z-10 flex flex-col items-start justify-center h-full px-6 md:px-16 lg:px-24">
        <h1
          className="font-display font-bold text-white leading-none mb-6"
          style={{ fontSize: 'clamp(1.75rem, 7vw, 5.5rem)' }}
        >
          <span className="block">TYPE YOUR PROMPT.</span>
          <span className="block">YOUR GPU RENDERS.</span>
          <span className="block bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
            INSTANTLY.
          </span>
        </h1>

        <p
          className="font-body text-zinc-400 mb-10 max-w-md"
          style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}
        >
          Natural language to WGSL shader. Real-time. On your GPU.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/studio"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-display font-semibold text-sm transition-colors"
          >
            Launch Studio →
          </Link>
          <a
            href="https://github.com"
            className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-display font-semibold text-sm transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Scroll indicator — 3 staggered scan lines */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
        {[0, 200, 400].map((delay) => (
          <div
            key={delay}
            className="w-6 h-px bg-zinc-600"
            style={{ animation: `scan-fade 1.5s ease-in-out infinite ${delay}ms` }}
          />
        ))}
      </div>
    </section>
  );
}

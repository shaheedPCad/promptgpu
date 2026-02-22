'use client';

import dynamic from 'next/dynamic';

// Canvas uses WebGPU (browser-only) — must not SSR
const Canvas = dynamic(() => import('./Canvas'), { ssr: false });

export default function CanvasWrapper() {
  return <Canvas />;
}

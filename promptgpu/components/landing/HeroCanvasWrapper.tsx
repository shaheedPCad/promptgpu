'use client';

import dynamic from 'next/dynamic';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), {
  ssr: false,
  loading: () => null,
});

interface HeroCanvasWrapperProps {
  className?: string;
  onUnsupported?: () => void;
}

export default function HeroCanvasWrapper({ className, onUnsupported }: HeroCanvasWrapperProps) {
  return <HeroCanvas className={className} onUnsupported={onUnsupported} />;
}

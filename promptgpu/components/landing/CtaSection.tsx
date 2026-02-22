import Link from 'next/link';

export default function CtaSection() {
  return (
    <section
      className="relative py-32 px-6 md:px-16 text-center overflow-hidden bg-zinc-950"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }}
    >
      <h2
        className="font-display font-bold text-white inline-flex items-baseline gap-2"
        style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', lineHeight: 1 }}
      >
        OPEN THE STUDIO
        <span
          className="text-blue-400"
          style={{ animation: 'blink 1s step-end infinite' }}
        >
          _
        </span>
      </h2>

      <div className="mt-10 flex items-center justify-center">
        <Link
          href="/studio"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-display font-semibold text-sm transition-colors"
        >
          Launch Studio
        </Link>
      </div>

      <p className="mt-6 font-body text-zinc-500 text-xs">
        Chrome 113+ or Edge 113+ required for WebGPU.
      </p>
    </section>
  );
}

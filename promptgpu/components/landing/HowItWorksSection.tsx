export default function HowItWorksSection() {
  return (
    <section className="bg-zinc-950 py-24 px-6 md:px-16">
      <p className="font-display text-xs text-zinc-500 uppercase tracking-widest mb-16">
        // HOW IT WORKS
      </p>
      <div className="flex flex-col md:flex-row border-t border-zinc-800">
        <div className="flex-1 pt-8 pr-0 md:pr-8 pb-8">
          <p className="font-display font-bold text-4xl text-amber-600 mb-4">01</p>
          <h3 className="font-display font-semibold text-white mb-3">Type a prompt</h3>
          <p className="font-body text-zinc-400 text-sm">
            Describe the visual effect you want in plain English. Be specific or be
            vague — the AI adapts to your intent.
          </p>
        </div>

        <div className="hidden md:flex items-center justify-center px-4 text-zinc-700 font-display text-2xl shrink-0 pt-8">
          →
        </div>

        <div className="flex-1 pt-8 pr-0 md:pr-8 pb-8">
          <p className="font-display font-bold text-4xl text-amber-600 mb-4">02</p>
          <h3 className="font-display font-semibold text-white mb-3">AI writes WGSL</h3>
          <p className="font-body text-zinc-400 text-sm">
            Claude or GPT-4o generates a complete WebGPU shader fragment from your
            description in seconds.
          </p>
        </div>

        <div className="hidden md:flex items-center justify-center px-4 text-zinc-700 font-display text-2xl shrink-0 pt-8">
          →
        </div>

        <div className="flex-1 pt-8 pb-8">
          <p className="font-display font-bold text-4xl text-amber-600 mb-4">03</p>
          <h3 className="font-display font-semibold text-white mb-3">GPU renders live</h3>
          <p className="font-body text-zinc-400 text-sm">
            Your GPU compiles and executes the shader at 60fps. Real-time visual
            feedback, every frame.
          </p>
        </div>
      </div>
    </section>
  );
}

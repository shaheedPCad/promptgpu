const features = [
  {
    index: '01',
    name: 'WebGPU Native',
    description: 'Direct GPU pipeline. No WebGL fallback, no abstraction layers between you and the silicon.',
    snippet: 'var<uniform> params: Params;',
  },
  {
    index: '02',
    name: 'Real-time compilation',
    description: 'WGSL compiles in milliseconds. Every prompt, every iteration — instant visual feedback.',
    snippet: 'device.createShaderModule({ code });',
  },
  {
    index: '03',
    name: 'Iterative prompting',
    description: 'Conversation-aware context. Refine your shader through natural dialogue without losing state.',
    snippet: 'messages.push({ role, content });',
  },
  {
    index: '04',
    name: 'Dual AI models',
    description: 'Claude and GPT-4o switchable mid-session. Pick the model that thinks in your visual language.',
    snippet: 'model === "claude" ? anthropic : openai',
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-zinc-950 py-24 px-6 md:px-16">
      <p className="font-display text-xs text-zinc-500 uppercase tracking-widest mb-16">
        // CAPABILITIES
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.index} className="border-t border-zinc-800 pt-8 pr-8 pb-8">
            <p className="font-display text-xs text-zinc-700 mb-3">{f.index}</p>
            <h3 className="font-display font-semibold text-white mb-3">{f.name}</h3>
            <p className="font-body text-zinc-400 text-sm mb-4">{f.description}</p>
            <p className="font-display text-xs text-zinc-600">{f.snippet}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

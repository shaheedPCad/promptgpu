'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore, Message } from '@/lib/store';

function parseShaderResponse(data: {
  fragment: string;
  compute?: string | null;
  description: string;
}): { fragment: string; compute?: string } {
  return {
    fragment: data.fragment,
    compute: data.compute ?? undefined,
  };
}

async function callGenerate(body: {
  prompt: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
}) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? 'Generation failed');
  return json.data;
}

export default function Chat() {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useStore((s) => s.messages);
  const isGenerating = useStore((s) => s.isGenerating);
  const model = useStore((s) => s.model);
  const pendingFix = useStore((s) => s.pendingFix);
  const addMessage = useStore((s) => s.addMessage);
  const setIsGenerating = useStore((s) => s.setIsGenerating);
  const setCurrentShader = useStore((s) => s.setCurrentShader);
  const setError = useStore((s) => s.setError);
  const setPendingFix = useStore((s) => s.setPendingFix);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  // Self-healing: when Canvas reports a WGSL compilation failure, auto-retry once
  useEffect(() => {
    if (!pendingFix || isGenerating) return;
    setPendingFix(null);

    const fixPrompt =
      `The WGSL shader you generated has a compilation error. Please fix it.\n\n` +
      `Error: ${pendingFix.errorMsg}\n\n` +
      `Broken shader:\n${pendingFix.fragment}\n\n` +
      `Remember: in WGSL, \`let\` is immutable — use \`var\` for variables you write to after declaration.`;

    addMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `WGSL error detected — auto-fixing: ${pendingFix.errorMsg}`,
    });

    setIsGenerating(true);
    callGenerate({ prompt: fixPrompt, model, messages: [] })
      .then((data) => {
        setCurrentShader(parseShaderResponse(data));
        addMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Fixed: ${data.description ?? 'Shader corrected.'}`,
        });
      })
      .catch((err) => {
        addMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Auto-fix failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      })
      .finally(() => setIsGenerating(false));
  }, [pendingFix]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || isGenerating) return;

    setInput('');
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
    };
    addMessage(userMessage);
    setIsGenerating(true);

    try {
      const data = await callGenerate({
        prompt,
        model,
        messages: messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      setCurrentShader(parseShaderResponse(data));

      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.description ?? 'Shader generated successfully.',
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${errorMsg}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
      >
        {messages.length === 0 && (
          <p className="text-zinc-500 text-sm text-center mt-8">
            Describe a shader to generate it on your GPU.
            <br />
            <span className="text-zinc-600">
              Try: &ldquo;swirling plasma&rdquo; or &ldquo;ocean waves&rdquo;
            </span>
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 text-zinc-400 rounded-lg px-3 py-2 text-sm animate-pulse">
              Generating shader...
            </div>
          </div>
        )}
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-zinc-800 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe a shader..."
          disabled={isGenerating}
          className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isGenerating || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

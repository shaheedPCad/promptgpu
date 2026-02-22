'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { createShaderRunner, ShaderRunner } from '@/engine/shaderRunner';
import { WebGPUNotSupportedError } from '@/engine/device';

const INITIAL_SHADER = /* wgsl */ `
@fragment
fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv = pos.xy / params.resolution;
  let r = 0.5 + 0.5 * sin(params.time + uv.x * 6.28318);
  let g = 0.5 + 0.5 * sin(params.time * 0.7 + uv.y * 6.28318);
  let b = 0.5 + 0.5 * sin(params.time * 1.3);
  return vec4f(r, g, b, 1.0);
}
`;

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runnerRef = useRef<ShaderRunner | null>(null);
  // Tracks the fragment currently being compiled (for self-healing on error)
  const pendingFragmentRef = useRef<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  const currentShader = useStore((s) => s.currentShader);
  const isPlaying = useStore((s) => s.isPlaying);
  const setError = useStore((s) => s.setError);
  const setPendingFix = useStore((s) => s.setPendingFix);

  // Initialize WebGPU once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;

    createShaderRunner(canvas, (err) => {
      setError(err);
      // If the error came from an LLM-generated shader, queue a self-heal
      if (pendingFragmentRef.current) {
        setPendingFix({ fragment: pendingFragmentRef.current, errorMsg: err });
        pendingFragmentRef.current = null;
      }
    })
      .then(async (runner) => {
        if (destroyed) {
          runner.destroy();
          return;
        }
        runnerRef.current = runner;
        await runner.updateShader({
          fragment: INITIAL_SHADER,
          description: 'Animated RGB gradient',
        });
      })
      .catch((err) => {
        if (err instanceof WebGPUNotSupportedError) {
          setUnsupported(true);
        } else {
          setError(err instanceof Error ? err.message : String(err));
        }
      });

    return () => {
      destroyed = true;
      runnerRef.current?.destroy();
      runnerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Hot-swap shader when currentShader changes
  useEffect(() => {
    if (!currentShader || !runnerRef.current) return;
    setError(null);
    // Track which fragment we're trying so onError can trigger self-healing
    pendingFragmentRef.current = currentShader.fragment;
    runnerRef.current
      .updateShader({
        fragment: currentShader.fragment,
        compute: currentShader.compute,
        description: '',
      })
      .then(() => {
        // Compilation succeeded — clear the pending ref
        pendingFragmentRef.current = null;
      });
  }, [currentShader, setError]);

  // Play/pause
  useEffect(() => {
    runnerRef.current?.setPlaying(isPlaying);
  }, [isPlaying]);

  if (unsupported) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-zinc-900 text-white p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">WebGPU Not Supported</h2>
        <p className="text-zinc-400 max-w-sm">
          PromptGPU requires WebGPU, which is available in Chrome 113+ and Edge
          113+. Please update your browser or switch to Chrome.
        </p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ touchAction: 'none' }}
    />
  );
}

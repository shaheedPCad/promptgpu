'use client';

import { useEffect, useRef } from 'react';
import { createShaderRunner, ShaderRunner } from '@/engine/shaderRunner';
import { WebGPUNotSupportedError } from '@/engine/device';

const HERO_SHADER = /* wgsl */ `
fn hash(n: f32) -> f32 {
  return fract(sin(n) * 43758.5453);
}

fn noise(x: vec2f) -> f32 {
  let p = floor(x);
  let f = fract(x);
  let u = f * f * (3.0 - 2.0 * f);
  let n = p.x + p.y * 57.0;
  return mix(
    mix(hash(n + 0.0), hash(n + 1.0), u.x),
    mix(hash(n + 57.0), hash(n + 58.0), u.x),
    u.y
  );
}

fn fbm(p: vec2f) -> f32 {
  var q = p;
  var v = 0.0;
  v = v + 0.500 * noise(q); q = q * 2.0 + vec2f(1.72, 9.23);
  v = v + 0.250 * noise(q); q = q * 2.0 + vec2f(1.72, 9.23);
  v = v + 0.125 * noise(q); q = q * 2.0 + vec2f(1.72, 9.23);
  v = v + 0.063 * noise(q); q = q * 2.0 + vec2f(1.72, 9.23);
  v = v + 0.031 * noise(q);
  return v;
}

@fragment
fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv = pos.xy / params.resolution;
  let t = params.time * 0.15;

  let q = vec2f(
    fbm(uv * 2.5 + vec2f(0.0, 0.0) + t),
    fbm(uv * 2.5 + vec2f(5.2, 1.3) + t * 1.1)
  );

  let r = vec2f(
    fbm(uv * 2.0 + 4.0 * q + vec2f(1.7, 9.2) + t * 0.8),
    fbm(uv * 2.0 + 4.0 * q + vec2f(8.3, 2.8) + t * 0.9)
  );

  let f = fbm(uv + 4.0 * r + t * 0.5);

  let col0 = vec3f(0.0, 0.01, 0.05);
  let col1 = vec3f(0.02, 0.15, 0.70);
  let col2 = vec3f(0.0, 0.60, 0.85);

  let blend = smoothstep(0.2, 0.7, f);
  let highlight = smoothstep(0.6, 0.9, f);
  let color = mix(col0, mix(col1, col2, highlight), blend);

  let uvc = uv - 0.5;
  let vignette = clamp(1.0 - dot(uvc, uvc) * 1.2, 0.0, 1.0);

  return vec4f(color * vignette, 1.0);
}
`;

interface HeroCanvasProps {
  className?: string;
  onUnsupported?: () => void;
}

export default function HeroCanvas({ className, onUnsupported }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runnerRef = useRef<ShaderRunner | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;

    createShaderRunner(canvas, () => {
      // Hero shader is static and pre-validated — ignore runtime errors
    })
      .then(async (runner) => {
        if (destroyed) {
          runner.destroy();
          return;
        }
        runnerRef.current = runner;
        await runner.updateShader({
          fragment: HERO_SHADER,
          description: 'Domain-warped noise field',
        });
      })
      .catch((err) => {
        if (err instanceof WebGPUNotSupportedError) {
          onUnsupported?.();
        }
      });

    return () => {
      destroyed = true;
      runnerRef.current?.destroy();
      runnerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ touchAction: 'none' }}
    />
  );
}

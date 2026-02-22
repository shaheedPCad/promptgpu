import { Renderer, ShaderErrorCallback } from './renderer';
import { ShaderPayload, EngineHandle } from './types';

const PARAMS_PREAMBLE = /* wgsl */ `
struct Params {
  time: f32,
  _pad0: f32,
  resolution: vec2f,
  mouse: vec2f,
  deltaTime: f32,
  _pad1: f32,
}
@group(0) @binding(0) var<uniform> params: Params;
`;

function injectParamsPreamble(wgsl: string): string {
  if (wgsl.includes('struct Params')) return wgsl;
  return PARAMS_PREAMBLE + '\n' + wgsl;
}

export class ShaderRunner implements EngineHandle {
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  private mouseHandler: ((e: MouseEvent) => void) | null = null;

  constructor(renderer: Renderer, canvas: HTMLCanvasElement) {
    this.renderer = renderer;
    this.canvas = canvas;

    this.mouseHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Convert to canvas pixel coordinates (accounting for HiDPI)
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.renderer.params[4] = (e.clientX - rect.left) * scaleX;
      this.renderer.params[5] = (e.clientY - rect.top) * scaleY;
    };

    canvas.addEventListener('mousemove', this.mouseHandler);
  }

  async updateShader(payload: ShaderPayload): Promise<void> {
    const withPreamble = injectParamsPreamble(payload.fragment);
    await this.renderer.loadShader(withPreamble);
  }

  setPlaying(playing: boolean) {
    this.renderer.setPlaying(playing);
  }

  destroy() {
    if (this.mouseHandler) {
      this.canvas.removeEventListener('mousemove', this.mouseHandler);
      this.mouseHandler = null;
    }
    this.renderer.destroy();
  }
}

export async function createShaderRunner(
  canvas: HTMLCanvasElement,
  onError: ShaderErrorCallback
): Promise<ShaderRunner> {
  const renderer = new Renderer();
  await renderer.init(canvas, onError);
  return new ShaderRunner(renderer, canvas);
}

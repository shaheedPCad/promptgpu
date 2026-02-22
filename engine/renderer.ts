import { PARAMS_BUFFER_SIZE } from './types';
import { initDevice, getPreferredCanvasFormat } from './device';

const VERTEX_SHADER = /* wgsl */ `
@vertex
fn vs_main(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  var pos = array<vec2f, 6>(
    vec2f(-1.0, -1.0),
    vec2f( 1.0, -1.0),
    vec2f(-1.0,  1.0),
    vec2f(-1.0,  1.0),
    vec2f( 1.0, -1.0),
    vec2f( 1.0,  1.0),
  );
  return vec4f(pos[vi], 0.0, 1.0);
}
`;

export type ShaderErrorCallback = (message: string) => void;

export class Renderer {
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private format!: GPUTextureFormat;
  private uniformBuffer!: GPUBuffer;
  private bindGroupLayout!: GPUBindGroupLayout;
  private bindGroup!: GPUBindGroup;
  private pipeline: GPURenderPipeline | null = null;

  private rafId: number | null = null;
  private playing = true;
  private startTime = performance.now();
  private lastTime = performance.now();
  private resizeObserver: ResizeObserver | null = null;

  // Exposed so ShaderRunner can write mouse coords
  readonly params = new Float32Array(PARAMS_BUFFER_SIZE / 4);

  private onError: ShaderErrorCallback = () => {};

  async init(canvas: HTMLCanvasElement, onError: ShaderErrorCallback) {
    this.onError = onError;

    const { device } = await initDevice();
    this.device = device;
    this.format = getPreferredCanvasFormat();

    const ctx = canvas.getContext('webgpu');
    if (!ctx) throw new Error('Failed to get WebGPU context from canvas');
    this.context = ctx;

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'premultiplied',
    });

    this.uniformBuffer = this.device.createBuffer({
      size: PARAMS_BUFFER_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
          buffer: { type: 'uniform' },
        },
      ],
    });

    this.bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });

    // HiDPI-aware resize
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = Math.round(width * devicePixelRatio);
        canvas.height = Math.round(height * devicePixelRatio);
      }
    });
    this.resizeObserver.observe(canvas);

    device.lost.then((info) => {
      if (info.reason !== 'destroyed') {
        console.error('WebGPU device lost:', info.message);
      }
    });
  }

  async loadShader(fragmentWGSL: string): Promise<boolean> {
    const fullFragment = `${VERTEX_SHADER}\n${fragmentWGSL}`;

    const module = this.device.createShaderModule({ code: fullFragment });

    const info = await module.getCompilationInfo();
    const errors = info.messages.filter((m) => m.type === 'error');
    if (errors.length > 0) {
      const errorText = errors
        .map((m) => `Line ${m.lineNum}: ${m.message}`)
        .join('\n');
      this.onError(errorText);
      return false;
    }

    const pipeline = this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout],
      }),
      vertex: {
        module,
        entryPoint: 'vs_main',
      },
      fragment: {
        module,
        entryPoint: 'fs_main',
        targets: [{ format: this.format }],
      },
      primitive: { topology: 'triangle-list' },
    });

    this.pipeline = pipeline;

    if (this.rafId === null) {
      this.startLoop();
    }

    return true;
  }

  private startLoop() {
    const frame = (now: number) => {
      this.rafId = requestAnimationFrame(frame);
      if (!this.playing || !this.pipeline) return;

      const elapsed = (now - this.startTime) / 1000;
      const delta = (now - this.lastTime) / 1000;
      this.lastTime = now;

      const canvas = this.context.canvas as HTMLCanvasElement;

      // Update params buffer:
      // index 0: time, 1: 0 (padding), 2: res.x, 3: res.y,
      // 4: mouse.x, 5: mouse.y, 6: deltaTime, 7: 0 (padding)
      this.params[0] = elapsed;
      this.params[1] = 0;
      this.params[2] = canvas.width;
      this.params[3] = canvas.height;
      // params[4] and params[5] are set externally (mouse coords)
      this.params[6] = delta;
      this.params[7] = 0;

      this.device.queue.writeBuffer(this.uniformBuffer, 0, this.params);

      const commandEncoder = this.device.createCommandEncoder();
      const textureView = this.context.getCurrentTexture().createView();

      const pass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      });

      pass.setPipeline(this.pipeline);
      pass.setBindGroup(0, this.bindGroup);
      pass.draw(6);
      pass.end();

      this.device.queue.submit([commandEncoder.finish()]);
    };

    this.rafId = requestAnimationFrame(frame);
  }

  setPlaying(playing: boolean) {
    this.playing = playing;
    if (playing) {
      this.lastTime = performance.now();
    }
  }

  destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.resizeObserver?.disconnect();
    this.uniformBuffer?.destroy();
    this.context?.unconfigure();
  }
}

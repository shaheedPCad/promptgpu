export class WebGPUNotSupportedError extends Error {
  constructor(reason?: string) {
    super(reason ?? 'WebGPU is not supported in this browser');
    this.name = 'WebGPUNotSupportedError';
  }
}

export async function initDevice(): Promise<{
  device: GPUDevice;
  adapter: GPUAdapter;
}> {
  if (!navigator.gpu) {
    throw new WebGPUNotSupportedError();
  }

  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: 'high-performance',
  });

  if (!adapter) {
    throw new WebGPUNotSupportedError('No suitable GPU adapter found');
  }

  const device = await adapter.requestDevice();

  return { device, adapter };
}

export function getPreferredCanvasFormat(): GPUTextureFormat {
  return navigator.gpu.getPreferredCanvasFormat();
}

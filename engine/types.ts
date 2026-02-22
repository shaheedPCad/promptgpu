// Uniform buffer size: 8 f32s × 4 bytes = 32 bytes
// Layout (Float32Array indices):
//   0: time        (offset  0)
//   1: 0           (padding, offset  4) — needed for vec2f 8-byte alignment
//   2: resolution.x (offset  8)
//   3: resolution.y (offset 12)
//   4: mouse.x     (offset 16)
//   5: mouse.y     (offset 20)
//   6: deltaTime   (offset 24)
//   7: 0           (padding, offset 28)
export const PARAMS_BUFFER_SIZE = 32;

export interface ShaderPayload {
  fragment: string;
  compute?: string;
  description: string;
}

export interface EngineHandle {
  destroy(): void;
  updateShader(payload: ShaderPayload): Promise<void>;
  setPlaying(playing: boolean): void;
}

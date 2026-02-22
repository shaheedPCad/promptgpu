# PromptGPU — Project Plan

## Overview
PromptGPU is a prompt-driven graphics and simulation engine that runs entirely in the browser. Users describe what they want to see in natural language, and an LLM generates either WGSL shader code or a structured scene description that gets rendered in real-time on the user's GPU via WebGPU.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| LLM Integration | Vercel AI SDK (`ai` package) |
| LLM Providers | Anthropic Claude + OpenAI GPT-4o (user-switchable) |
| WebGPU Engine | Raw WebGPU API (custom, no abstraction library) |
| State Management | Zustand |
| Backend / Auth / DB | Supabase |
| Deployment | Vercel |

---

## Project Structure

```
promptgpu/
├── app/
│   ├── page.tsx                  # Main app page
│   ├── layout.tsx
│   └── api/
│       └── generate/
│           └── route.ts          # LLM API route (server-side, keeps keys safe)
├── components/
│   ├── Canvas.tsx                # WebGPU canvas component
│   ├── Chat.tsx                  # Chat input + message history
│   ├── ModelSwitcher.tsx         # Claude / GPT-4o toggle
│   └── SceneControls.tsx         # Play/pause, reset, export
├── engine/
│   ├── index.ts                  # Engine entry point
│   ├── device.ts                 # WebGPU device initialization
│   ├── renderer.ts               # Render loop, pipeline management
│   ├── shaderRunner.ts           # Compile + run raw WGSL shaders
│   ├── sceneRunner.ts            # Interpret scene JSON → WebGPU draw calls
│   ├── primitives/
│   │   ├── sphere.ts             # Sphere geometry + shaders
│   │   ├── plane.ts
│   │   ├── cube.ts
│   │   └── particles.ts          # Particle system compute shader
│   ├── textures/
│   │   └── textureLoader.ts      # Load built-in textures (earth, moon, etc.)
│   └── types.ts                  # Shared types for scene objects, shaders
├── lib/
│   ├── llm.ts                    # LLM provider abstraction
│   ├── prompts.ts                # System prompts for shader and scene generation
│   ├── parseResponse.ts          # Extract shader code / scene JSON from LLM response
│   └── store.ts                  # Zustand store
├── public/
│   └── textures/                 # earth.jpg, moon.jpg, mars.jpg etc.
└── .env.local
    # ANTHROPIC_API_KEY=
    # OPENAI_API_KEY=
    # NEXT_PUBLIC_SUPABASE_URL=
    # NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Core Architecture

### Two Rendering Modes

The engine operates in two modes, selected automatically based on the prompt:

#### 1. Shader Mode
For generative art, fractals, and abstract visuals.
- LLM generates raw WGSL fragment (and optionally compute) shader code
- Engine compiles it via `device.createShaderModule()`
- Runs a fullscreen quad with the shader applied
- Uniforms passed: `time`, `resolution`, `mouse`

**Example prompts:** "swirling fractal vortex", "plasma waves", "psychedelic color field"

#### 2. Scene Mode
For 3D objects, physics simulations, and named models.
- LLM generates a structured JSON scene description
- Engine interprets the JSON and renders using built-in primitives
- Supports orbits, lighting, textures, particle systems

**Example prompts:** "earth revolving around the sun", "10,000 particles with gravity", "bouncing balls in a box"

### Mode Detection
The LLM decides which mode to use. The system prompt instructs it to return one of two JSON shapes:

```json
// Shader mode
{ "mode": "shader", "compute": "...wgsl...", "fragment": "...wgsl..." }

// Scene mode  
{ "mode": "scene", "objects": [...], "camera": {...}, "lighting": {...} }
```

---

## Engine Details

### Device Initialization (`engine/device.ts`)
```typescript
// Check WebGPU support
if (!navigator.gpu) throw new Error("WebGPU not supported")
const adapter = await navigator.gpu.requestAdapter()
const device = await adapter.requestDevice()
```

### Shader Runner (`engine/shaderRunner.ts`)
Responsibilities:
- Accept WGSL strings from LLM
- Create shader module, render pipeline
- Set up fullscreen quad geometry
- Create uniform buffer (time, resolution, mouse)
- Run render loop, update uniforms each frame

### Scene Runner (`engine/sceneRunner.ts`)
Responsibilities:
- Parse scene JSON
- Instantiate primitive objects (sphere, cube, plane, particles)
- Set up per-object transform buffers
- Handle orbit/animation math
- Set up lighting uniforms
- Render each object in the scene

### Primitives
Each primitive exports:
- Vertex buffer data (geometry)
- WGSL vertex + fragment shaders
- A `update(dt: number)` method for animation

### Uniforms Available to All Shaders
```wgsl
struct Params {
  time: f32,
  resolution: vec2f,
  mouse: vec2f,
  deltaTime: f32,
}
```

---

## LLM Integration

### API Route (`app/api/generate/route.ts`)
- Receives: `{ prompt, model, conversationHistory }`
- Selects provider (Anthropic or OpenAI) based on `model` param
- Uses Vercel AI SDK `generateObject` with Zod schema
- Returns structured JSON (shader code or scene description)
- Streams response for fast feedback

### System Prompt Strategy (`lib/prompts.ts`)
The system prompt tells the LLM:
1. What the engine can do (primitives, uniforms available)
2. The exact JSON schema to return
3. WGSL conventions and constraints (no infinite loops, performance guidelines)
4. Examples of good shader mode and scene mode outputs

### Providers
```typescript
// lib/llm.ts
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'

export function getModel(provider: 'claude' | 'gpt4o') {
  if (provider === 'claude') return anthropic('claude-sonnet-4-6')
  return openai('gpt-4o')
}
```

---

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  PromptGPU                    [Claude ▾]  [⚙]        │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   WebGPU Canvas      │   Chat History               │
│   (fullscreen left)  │                              │
│                      │   > earth revolving sun      │
│                      │   < Generated solar system   │
│                      │                              │
│                      │   > add a moon               │
│                      │   < Added moon orbit         │
│                      │                              │
│  [▶ Play] [⟳ Reset]  ├──────────────────────────────┤
│  [↗ Export GIF]      │  Type a prompt...    [Send]  │
└──────────────────────┴──────────────────────────────┘
```

---

## Built-in Textures
Include these in `/public/textures/`:
- `earth.jpg`
- `moon.jpg`  
- `mars.jpg`
- `sun.jpg`
- `stars.jpg` (skybox/background)

Source from NASA public domain images.

---

## Zustand Store (`lib/store.ts`)

```typescript
interface Store {
  // LLM
  model: 'claude' | 'gpt4o'
  setModel: (m: 'claude' | 'gpt4o') => void
  
  // Chat
  messages: Message[]
  addMessage: (m: Message) => void
  isGenerating: boolean
  
  // Engine
  currentScene: SceneJSON | null
  currentShader: ShaderJSON | null
  isPlaying: boolean
  togglePlay: () => void
  reset: () => void
}
```

---

## Build Order

Build in this exact order so each piece is testable before the next:

### Phase 1 — WebGPU Foundation
1. Next.js project setup with TypeScript + Tailwind
2. WebGPU device initialization with graceful fallback UI if unsupported
3. Basic render loop with a fullscreen quad
4. Hardcode a simple WGSL shader (e.g. animated color gradient) to confirm WebGPU works

### Phase 2 — Shader Mode
5. Shader runner that accepts WGSL strings and compiles them
6. Uniform buffer setup (time, resolution, mouse)
7. Error handling for invalid WGSL (show error in UI, don't crash)

### Phase 3 — LLM Integration
8. API route with Vercel AI SDK, both Claude and GPT-4o
9. System prompt for shader generation
10. Chat UI that sends prompt → gets WGSL → runs it
11. Model switcher UI

### Phase 4 — Scene Mode
12. Sphere primitive (geometry + shaders)
13. Scene runner that interprets JSON → renders spheres
14. Orbit/animation math
15. Lighting uniform
16. Additional primitives (cube, plane)
17. Particle system compute shader
18. Texture loading

### Phase 5 — Polish
19. Conversation history (iterative prompting — "add a moon", "make it faster")
20. Supabase auth + save/load scenes
21. Export as GIF/screenshot
22. Error recovery (LLM generates bad WGSL → ask it to fix itself)

---

## Key Constraints & Gotchas

- **WebGPU is Chrome/Edge only** for now (Firefox behind flag, Safari partial). Show a clear message for unsupported browsers.
- **WGSL compilation errors** are async and surface via the device's `uncapturederror` event — set this up early
- **Next.js SSR** — WebGPU only works client-side. The Canvas component must be `'use client'` and WebGPU init must happen inside `useEffect`
- **API keys** must never go to the client — always route LLM calls through the Next.js API route
- **Shader performance** — LLM sometimes generates expensive shaders. Add a timeout/frame budget and warn the user
- **Conversation context** — pass previous messages to the LLM so "add a moon" knows what scene currently exists

---

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Getting Started Commands

```bash
npx create-next-app@latest promptgpu --typescript --tailwind --app
cd promptgpu
npm install ai @ai-sdk/anthropic @ai-sdk/openai zustand zod @supabase/supabase-js
```

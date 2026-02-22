# PromptGPU

Type a natural language prompt. An AI writes a WGSL shader. Your GPU renders it live.

PromptGPU is a browser-based WebGPU shader playground that turns conversational prompts into real-time GPU-executed fragment shaders. No shader knowledge required — describe what you want to see, iterate through dialogue, and watch your GPU render it at 60fps.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| GPU | WebGPU API + WGSL shading language |
| AI — Claude | Vercel AI SDK + `@ai-sdk/anthropic` |
| AI — GPT-4o | Vercel AI SDK + `@ai-sdk/openai` |
| State | Zustand 5 |
| Styling | Tailwind CSS 4 |
| Fonts | IBM Plex Mono (display) · Instrument Sans (body) via `next/font` |
| Schema validation | Zod 4 |
| Runtime | Node.js (server) · Chrome/Edge 113+ (client) |

---

## Architecture

### Routes

```
/          Landing page — hero WebGPU canvas, feature overview, CTA
/studio    Full shader studio — canvas (60%) + chat panel (40%)
/api/generate  Server action — prompt → structured WGSL via AI SDK
```

### Engine (`engine/`)

The GPU engine is a thin, zero-dependency WebGPU pipeline.

```
engine/
  device.ts       initDevice() — requests adapter/device, throws WebGPUNotSupportedError
  renderer.ts     Renderer class — fullscreen quad (6 verts, no VBO), uniform buffer,
                  RAF loop, getCompilationInfo() for shader error extraction
  shaderRunner.ts ShaderRunner class — mouse tracking, injectParamsPreamble(),
                  createShaderRunner() factory
  types.ts        ShaderPayload, EngineHandle, PARAMS_BUFFER_SIZE=32
```

**Uniform buffer layout** (`Params` struct, 32 bytes):

```
offset  0  — time        f32
offset  4  — _pad0       f32   (8-byte alignment for vec2f)
offset  8  — resolution  vec2f
offset 16  — mouse       vec2f
offset 24  — deltaTime   f32
offset 28  — _pad1       f32
```

`injectParamsPreamble()` auto-prepends the `Params` struct declaration if the LLM omits it, so prompts can focus on visual logic rather than boilerplate.

### AI Integration (`lib/`, `app/api/`)

```
lib/
  llm.ts       getModel('claude' | 'gpt4o') — server-only provider factory
  prompts.ts   SHADER_SYSTEM_PROMPT — instructs the LLM to emit valid WGSL
  store.ts     Zustand store: model, messages[], currentShader, isPlaying, error

app/api/generate/route.ts
  POST handler — receives { prompt, messages[], model }
  Uses generateObject() + Zod schema to extract { fragment, description }
  Returns structured ShaderPayload
```

AI responses are validated through a Zod schema before reaching the engine, ensuring the `fragment` field always contains a WGSL `@fragment` function.

### Components

```
components/
  Canvas.tsx          WebGPU canvas — init in useEffect([], []), hot-swap shader
                      on currentShader change, play/pause via isPlaying
  CanvasWrapper.tsx   'use client' wrapper for dynamic(Canvas, { ssr: false })
  Chat.tsx            Message list + input, auto-scroll, POST /api/generate
  ErrorBar.tsx        Shader compilation error display
  ModelSwitcher.tsx   Claude ↔ GPT-4o toggle
  SceneControls.tsx   Play/pause control

  landing/
    LandingNav.tsx         Fixed sticky nav
    HeroSection.tsx        Full-viewport hero with WebGPU canvas + CSS fallback
    HeroCanvas.tsx         Store-free WebGPU canvas running domain-warped fbm shader
    HeroCanvasWrapper.tsx  dynamic(HeroCanvas, { ssr: false })
    FeaturesSection.tsx    4-feature capability grid
    HowItWorksSection.tsx  3-step process
    CtaSection.tsx         Terminal-style call-to-action
```

### Studio Layout

The studio at `/studio` uses a nested layout that enforces `h-screen overflow-hidden`, giving the canvas + chat panel a fixed full-viewport container. The root layout does **not** set `height: 100%` on `html/body`, which lets the landing page scroll naturally.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Chrome 113+ or Edge 113+ (WebGPU is not available in Firefox or Safari stable)
- API keys for Anthropic and/or OpenAI

### Setup

```bash
git clone https://github.com/shaheedPCad/promptgpu.git
cd promptgpu
npm install
```

Create `.env.local` at the repo root:

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — landing page.
Open [http://localhost:3000/studio](http://localhost:3000/studio) — shader studio.

---

## Project Structure

```
/                       (repo root = Next.js app root)
├── README.md
├── PLAN.md
├── package.json
├── app/
│   ├── layout.tsx        Root layout — font variables, metadata
│   ├── page.tsx          Landing page (server component)
│   ├── globals.css       Tailwind v4, @theme font tokens, keyframes
│   ├── studio/
│   │   ├── layout.tsx    h-screen overflow-hidden wrapper
│   │   └── page.tsx      Shader studio
│   └── api/
│       └── generate/
│           └── route.ts  AI → WGSL endpoint
├── components/
│   ├── Canvas.tsx
│   ├── CanvasWrapper.tsx
│   ├── Chat.tsx
│   ├── ErrorBar.tsx
│   ├── ModelSwitcher.tsx
│   ├── SceneControls.tsx
│   └── landing/
│       ├── LandingNav.tsx
│       ├── HeroSection.tsx
│       ├── HeroCanvas.tsx
│       ├── HeroCanvasWrapper.tsx
│       ├── FeaturesSection.tsx
│       ├── HowItWorksSection.tsx
│       └── CtaSection.tsx
├── engine/
│   ├── device.ts
│   ├── renderer.ts
│   ├── shaderRunner.ts
│   └── types.ts
└── lib/
    ├── llm.ts
    ├── prompts.ts
    └── store.ts
```

---

## Browser Support

WebGPU is required for the shader canvas. The landing page falls back to a CSS gradient animation on unsupported browsers; the studio shows an unsupported message.

| Browser | Support |
|---|---|
| Chrome 113+ | Full |
| Edge 113+ | Full |
| Firefox | No WebGPU (CSS fallback on landing) |
| Safari | No WebGPU (CSS fallback on landing) |

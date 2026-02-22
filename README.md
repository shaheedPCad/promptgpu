# PromptGPU

Type a natural language prompt. An AI writes a WGSL shader. Your GPU renders it live.

**[promptgpu.netlify.app](https://promptgpu.netlify.app)**

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
/              Landing page — hero WebGPU canvas, feature overview, CTA
/studio        Full shader studio — canvas (60%) + chat panel (40%)
/api/generate  Server action — prompt → structured WGSL via AI SDK
```

### Engine (`engine/`)

The GPU engine is a thin, zero-dependency WebGPU pipeline. `Renderer` runs a fullscreen quad with a uniform buffer fed each frame. `ShaderRunner` wraps it with mouse tracking and auto-injects the `Params` struct if the LLM omits it, so prompts can focus on visual logic rather than boilerplate.

Uniform buffer layout (`Params` struct, 32 bytes):

```
offset  0  — time        f32
offset  4  — _pad0       f32   (8-byte alignment for vec2f)
offset  8  — resolution  vec2f
offset 16  — mouse       vec2f
offset 24  — deltaTime   f32
offset 28  — _pad1       f32
```

### AI Integration

Prompts hit `/api/generate` as a POST with the conversation history and selected model. The handler calls `generateObject()` from the Vercel AI SDK with a Zod schema, which forces the response into a typed `{ fragment, description }` shape before it ever reaches the engine.

### Studio Layout

`/studio` uses a nested layout that enforces `h-screen overflow-hidden` so the canvas and chat panel fill the viewport without scrolling. The root layout intentionally omits `height: 100%` on `html/body` so the landing page scrolls naturally.

---

## Getting Started

```bash
git clone https://github.com/shaheedPCad/promptgpu.git
cd promptgpu
npm install
```

Create `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

```bash
npm run dev
```

Requires Chrome 113+ or Edge 113+ for WebGPU.

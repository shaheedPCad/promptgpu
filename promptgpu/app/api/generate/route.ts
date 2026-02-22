import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getModel } from '@/lib/llm';
import { SHADER_SYSTEM_PROMPT } from '@/lib/prompts';

const ShaderSchema = z.object({
  mode: z.literal('shader'),
  fragment: z.string(),
  compute: z.string().nullable(),
  description: z.string(),
});

type RequestBody = {
  prompt: string;
  model: 'claude' | 'gpt4o';
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
};

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { prompt, model, messages = [] } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid prompt' },
        { status: 400 }
      );
    }

    const aiModel = getModel(model ?? 'claude');

    // Build message history (last 10 messages for context)
    const history = messages.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const { object } = await generateObject({
      model: aiModel,
      schema: ShaderSchema,
      system: SHADER_SYSTEM_PROMPT,
      messages: [
        ...history,
        { role: 'user', content: prompt },
      ],
    });

    return NextResponse.json({ success: true, data: object });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[generate] Error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

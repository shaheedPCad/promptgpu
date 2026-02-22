import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export function getModel(provider: 'claude' | 'gpt4o') {
  if (provider === 'claude') {
    return anthropic('claude-sonnet-4-6');
  }
  return openai('gpt-4o');
}

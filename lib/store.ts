'use client';

import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Store {
  model: 'gpt4o';
  setModel(m: 'gpt4o'): void;

  messages: Message[];
  addMessage(m: Message): void;

  isGenerating: boolean;
  setIsGenerating(b: boolean): void;

  currentShader: { fragment: string; compute?: string } | null;
  setCurrentShader(s: { fragment: string; compute?: string } | null): void;

  isPlaying: boolean;
  togglePlay(): void;

  error: string | null;
  setError(e: string | null): void;

  // Self-healing: set when WGSL compilation fails on an LLM-generated shader
  pendingFix: { fragment: string; errorMsg: string } | null;
  setPendingFix(f: { fragment: string; errorMsg: string } | null): void;

  reset(): void;
}

export const useStore = create<Store>((set) => ({
  model: 'gpt4o',
  setModel: (m) => set({ model: m }),

  messages: [],
  addMessage: (m) => set((state) => ({ messages: [...state.messages, m] })),

  isGenerating: false,
  setIsGenerating: (b) => set({ isGenerating: b }),

  currentShader: null,
  setCurrentShader: (s) => set({ currentShader: s }),

  isPlaying: true,
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  error: null,
  setError: (e) => set({ error: e }),

  pendingFix: null,
  setPendingFix: (f) => set({ pendingFix: f }),

  reset: () =>
    set({
      messages: [],
      currentShader: null,
      error: null,
      isGenerating: false,
      pendingFix: null,
    }),
}));

import type { Metadata } from 'next';
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import CtaSection from '@/components/landing/CtaSection';

export const metadata: Metadata = {
  title: 'PromptGPU — Type a prompt. Your GPU renders the shader.',
  description:
    'Natural language to WGSL shader. Real-time. On your GPU. WebGPU-native shader playground powered by Claude and GPT-4o.',
};

export default function LandingPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </main>
  );
}

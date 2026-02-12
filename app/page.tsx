import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { FeaturesSection } from '@/components/features-section'
import { HowItWorksSection } from '@/components/how-it-works-section'
import { VerdictsShowcase } from '@/components/verdicts-showcase'
import { DemoSection } from '@/components/demo-section'
import { CtaSection } from '@/components/cta-section'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <Header />
      <HeroSection />
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      <FeaturesSection />
      <HowItWorksSection />
      <VerdictsShowcase />
      <DemoSection />
      <CtaSection />
      <Footer />
    </main>
  )
}

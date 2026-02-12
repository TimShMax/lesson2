import { Zap, Brain, Clock, Shield } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Instant Analysis',
    description: 'Paste a link and get results in under 5 seconds. No signup required.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Summaries',
    description: 'Our model extracts key points, themes, and the core message of any video.',
  },
  {
    icon: Clock,
    title: 'Save Hours',
    description: 'Stop watching 45-minute videos to find out they were clickbait. Get the verdict first.',
  },
  {
    icon: Shield,
    title: 'Streaming UI',
    description: 'Watch the summary appear in real-time, word by word. No loading spinners.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Features
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to decide
          </h2>
        </div>

        <div className="grid gap-px rounded-lg border border-border bg-border sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative flex flex-col gap-3 bg-background p-8 transition-colors hover:bg-accent/50"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg opacity-0 transition-opacity group-hover:opacity-100" style={{
                  background: 'conic-gradient(from 180deg at 50% 50%, hsla(0,0%,100%,0.06) 0deg, transparent 120deg, hsla(0,0%,100%,0.06) 240deg, transparent 360deg)',
                }} />
                <feature.icon className="relative h-5 w-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              {/* Glass highlight on top */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { GridBackground } from './grid-background'

export function CtaSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <GridBackground />
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Stop wasting time on bad videos
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Join thousands of people who get AI-powered verdicts before committing
          to long-form content. It takes 5 seconds.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <a
            href="#demo"
            className="group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-md px-8 text-sm font-medium text-background transition-all"
          >
            <span className="absolute inset-0 bg-foreground" />
            <span
              className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background: 'conic-gradient(from 180deg at 50% 50%, #ffffff 0deg, #a0a0a0 120deg, #ffffff 240deg, #d0d0d0 360deg)',
              }}
            />
            <span className="relative">Get Started</span>
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-3 gap-px rounded-lg border border-border bg-border">
          <div className="flex flex-col items-center gap-1 bg-background py-5">
            <span className="font-mono text-xl font-bold sm:text-2xl">12K+</span>
            <span className="text-[10px] text-muted-foreground sm:text-xs">Videos Analyzed</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-background py-5">
            <span className="font-mono text-xl font-bold sm:text-2xl">4.2s</span>
            <span className="text-[10px] text-muted-foreground sm:text-xs">Avg. Response</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-background py-5">
            <span className="font-mono text-xl font-bold sm:text-2xl">89%</span>
            <span className="text-[10px] text-muted-foreground sm:text-xs">Accuracy Rate</span>
          </div>
        </div>
      </div>
    </section>
  )
}

import { GridBackground } from './grid-background'
import { VerdictBadge } from './verdict-badge'

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-14">
      <GridBackground />

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6 text-center">
        <VerdictBadge verdict="must_watch" />

        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Is It Worth Watching?
        </h1>

        <p className="max-w-lg text-pretty text-base text-muted-foreground sm:text-lg leading-relaxed">
          Paste a YouTube link. Get an AI-powered summary and verdict in seconds.
          No more wasting time on bad content.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#demo"
            className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-md px-6 text-sm font-medium text-background transition-all"
          >
            <span className="absolute inset-0 bg-foreground" />
            <span className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{
              background: 'conic-gradient(from 180deg at 50% 50%, #ffffff 0deg, #a0a0a0 120deg, #ffffff 240deg, #d0d0d0 360deg)',
            }} />
            <span className="relative">Try It Free</span>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            See How It Works
          </a>
        </div>

        <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(142,76%,46%)]" />
            Powered by AI
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(142,76%,46%)]" />
            Results in ~5 sec
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(142,76%,46%)]" />
            Free to try
          </span>
        </div>
      </div>
    </section>
  )
}

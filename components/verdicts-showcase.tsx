import { VerdictBadge } from './verdict-badge'

const examples = [
  {
    verdict: 'must_watch' as const,
    title: 'Building a SaaS in 48 hours',
    channel: '@BuilderChannel',
    duration: '42:15',
    summary: 'Step-by-step SaaS development with real deployment. Covers auth, payments, and database setup with practical code examples.',
  },
  {
    verdict: 'skip' as const,
    title: '10 AI Tools That Will BLOW Your Mind',
    channel: '@TechHype',
    duration: '28:33',
    summary: 'Clickbait title. Most tools mentioned are outdated or have been discontinued. No practical demonstrations provided.',
  },
  {
    verdict: 'meh' as const,
    title: 'React vs Vue in 2025',
    channel: '@DevCompare',
    duration: '18:45',
    summary: 'Decent comparison but covers surface-level differences only. Nothing new for experienced developers.',
  },
]

export function VerdictsShowcase() {
  return (
    <section className="relative py-24 px-6 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Examples
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Real verdicts, real time saved
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {examples.map((example) => (
            <div
              key={example.title}
              className="group relative flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-muted-foreground/30"
            >
              {/* Glass top highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-lg bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent" />

              <div className="flex items-center justify-between">
                <VerdictBadge verdict={example.verdict} size="sm" />
                <span className="font-mono text-[10px] text-muted-foreground">
                  {example.duration}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold leading-snug">{example.title}</h3>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">{example.channel}</p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {example.summary}
              </p>

              {/* Bottom fade accent */}
              <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

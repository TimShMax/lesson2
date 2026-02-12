const steps = [
  {
    number: '01',
    title: 'Paste a YouTube Link',
    description: 'Drop any YouTube URL into the input field. We support videos of any length.',
  },
  {
    number: '02',
    title: 'AI Processes the Content',
    description: 'Our model analyzes the transcript, extracts key points, and generates a concise summary.',
  },
  {
    number: '03',
    title: 'Get Your Verdict',
    description: 'Receive a streaming summary with a clear verdict badge: Must Watch, Meh, or Skip.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            How It Works
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps. Zero effort.
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="group relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-10 hidden h-px w-8 translate-x-full bg-border sm:block" />
              )}
              <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-muted-foreground/30">
                {/* Glass top highlight */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-lg bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent" />
                <span className="font-mono text-3xl font-bold text-muted-foreground/30">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded border border-border bg-foreground">
            <span className="font-mono text-[8px] font-bold text-background">V</span>
          </div>
          <span className="text-xs text-muted-foreground">VerdictAI</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Terms</a>
          <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
          <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">GitHub</a>
        </div>

        <p className="text-xs text-muted-foreground">
          Deployed on{' '}
          <span className="text-foreground font-medium">Vercel</span>
        </p>
      </div>
    </footer>
  )
}

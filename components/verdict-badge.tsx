import { cn } from '@/lib/utils'

interface VerdictBadgeProps {
  verdict: 'must_watch' | 'skip' | 'meh'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const verdictConfig = {
  must_watch: {
    label: 'MUST WATCH',
    dotColor: 'bg-[hsl(142,76%,46%)]',
    borderColor: 'border-[hsl(142,76%,46%)]/30',
    textColor: 'text-[hsl(142,76%,46%)]',
  },
  skip: {
    label: 'SKIP',
    dotColor: 'bg-[hsl(0,80%,55%)]',
    borderColor: 'border-[hsl(0,80%,55%)]/30',
    textColor: 'text-[hsl(0,80%,55%)]',
  },
  meh: {
    label: 'MEH',
    dotColor: 'bg-[hsl(38,92%,50%)]',
    borderColor: 'border-[hsl(38,92%,50%)]/30',
    textColor: 'text-[hsl(38,92%,50%)]',
  },
}

export function VerdictBadge({ verdict, className, size = 'md' }: VerdictBadgeProps) {
  const config = verdictConfig[verdict]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border bg-background/50 backdrop-blur-sm font-mono',
        config.borderColor,
        size === 'sm' && 'px-2.5 py-1 text-[10px]',
        size === 'md' && 'px-3 py-1.5 text-xs',
        size === 'lg' && 'px-4 py-2 text-sm',
        className
      )}
    >
      <span className={cn('inline-block rounded-full animate-pulse-dot', config.dotColor,
        size === 'sm' && 'h-1.5 w-1.5',
        size === 'md' && 'h-2 w-2',
        size === 'lg' && 'h-2.5 w-2.5',
      )} />
      <span className={cn('font-semibold tracking-wider', config.textColor)}>
        {config.label}
      </span>
    </div>
  )
}

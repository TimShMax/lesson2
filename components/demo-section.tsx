'use client'

import React, { useState, useCallback } from 'react'
import { VerdictBadge } from './verdict-badge'
import { ArrowRight, Link2, AlertCircle, RefreshCw } from 'lucide-react'

type DemoState = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

interface ApiResponse {
  videoId: string
  title: string
  channelName: string
  thumbnailUrl: string
  verdict: 'MUST_WATCH' | 'SKIP' | 'RECAP_ONLY'
  verdictLabel: string
  verdictDescription: string
  summary: Array<{ emoji: string; text: string }>
}

export function DemoSection() {
  const [url, setUrl] = useState('')
  const [state, setState] = useState<DemoState>('idle')
  const [displayedText, setDisplayedText] = useState('')
  const [showVerdict, setShowVerdict] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)
  const [analysisTime, setAnalysisTime] = useState<number | null>(null)

  const startAnalysis = useCallback(async () => {
    if (!url.trim()) return

    setState('loading')
    setDisplayedText('')
    setShowVerdict(false)
    setErrorMessage('')
    setApiResponse(null)
    setAnalysisTime(null)

    try {
      const startTime = Date.now()

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      const endTime = Date.now()

      setApiResponse(data)
      setAnalysisTime((endTime - startTime) / 1000)

      // Стриминг результата
      setState('streaming')
      streamSummary(data.summary)

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      setErrorMessage(message)
      setState('error')
    }
  }, [url])

  const streamSummary = useCallback((summary: ApiResponse['summary']) => {
    let currentIndex = 0
    let textIndex = 0
    const fullText = summary.map(item => `${item.emoji} ${item.text}`).join('\n\n')

    const interval = setInterval(() => {
      if (textIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, textIndex + 1))
        textIndex++
      } else {
        clearInterval(interval)
        setState('done')
        setTimeout(() => setShowVerdict(true), 300)
      }
    }, 15)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startAnalysis()
  }

  const resetDemo = useCallback(() => {
    setState('idle')
    setUrl('')
    setDisplayedText('')
    setShowVerdict(false)
    setErrorMessage('')
    setApiResponse(null)
    setAnalysisTime(null)
  }, [])

  const getUiVerdict = () => {
    if (!apiResponse) return 'must_watch'
    switch (apiResponse.verdict) {
      case 'MUST_WATCH':
        return 'must_watch'
      case 'SKIP':
        return 'skip'
      case 'RECAP_ONLY':
        return 'meh'
      default:
        return 'meh'
    }
  }

  return (
    <section id="demo" className="relative py-24 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Live Demo
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Try it yourself
          </h2>
        </div>

        {/* Input Card */}
        <div className="rounded-lg border border-border bg-card">
          {/* Glass top highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent" />

          <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4">
            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono"
              disabled={state === 'loading' || state === 'streaming'}
            />
            <button
              type="submit"
              disabled={!url.trim() || state === 'loading' || state === 'streaming'}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background transition-opacity disabled:opacity-40"
            >
              {state === 'loading' ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  Analyze
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {state === 'error' && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 animate-fade-up">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <span className="font-mono text-sm">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Result Card */}
        {(state === 'loading' || state === 'streaming' || state === 'done') && (
          <div className="mt-4 rounded-lg border border-border bg-card overflow-hidden animate-fade-up">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(0,80%,55%)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(38,92%,50%)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(142,76%,46%)]" />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  verdict-ai / analysis
                </span>
              </div>
              {showVerdict && apiResponse && (
                <VerdictBadge verdict={getUiVerdict()} size="sm" />
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Loading skeleton */}
              {state === 'loading' && (
                <div className="space-y-3">
                  <div className="h-4 w-3/4 rounded bg-accent animate-shimmer" style={{ backgroundImage: 'linear-gradient(90deg, hsl(0 0% 12%) 0%, hsl(0 0% 18%) 50%, hsl(0 0% 12%) 100%)', backgroundSize: '200% 100%' }} />
                  <div className="h-4 w-full rounded bg-accent animate-shimmer" style={{ backgroundImage: 'linear-gradient(90deg, hsl(0 0% 12%) 0%, hsl(0 0% 18%) 50%, hsl(0 0% 12%) 100%)', backgroundSize: '200% 100%', animationDelay: '0.1s' }} />
                  <div className="h-4 w-2/3 rounded bg-accent animate-shimmer" style={{ backgroundImage: 'linear-gradient(90deg, hsl(0 0% 12%) 0%, hsl(0 0% 18%) 50%, hsl(0 0% 12%) 100%)', backgroundSize: '200% 100%', animationDelay: '0.2s' }} />
                </div>
              )}

              {/* Streaming/Done content */}
              {(state === 'streaming' || state === 'done') && (
                <div className="font-mono text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {displayedText}
                  {state === 'streaming' && (
                    <span className="inline-block w-[2px] h-4 bg-foreground ml-0.5 align-text-bottom animate-blink" />
                  )}
                </div>
              )}

              {/* Verdict section */}
              {state === 'done' && showVerdict && apiResponse && (
                <div className="mt-6 flex items-start gap-3 rounded-md border border-[hsl(142,76%,46%)]/20 bg-[hsl(142,76%,46%)]/5 p-4 animate-fade-up">
                  <span className="h-2 w-2 rounded-full bg-[hsl(142,76%,46%)] animate-pulse-dot mt-1" />
                  <div>
                    <p className="font-mono text-xs font-semibold text-[hsl(142,76%,46%)]">
                      VERDICT: {apiResponse.verdictLabel.toUpperCase()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {apiResponse.verdictDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {state === 'done' && (
              <div className="border-t border-border px-4 py-3 flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {analysisTime !== null && `Analyzed in ${analysisTime.toFixed(1)}s`}
                </span>
                <button
                  type="button"
                  onClick={resetDemo}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

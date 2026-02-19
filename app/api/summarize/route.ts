/**
 * API Endpoint: POST /api/summarize
 * 
 * Принимает YouTube URL, получает транскрипт и анализирует его с помощью AI.
 * Требует аутентификации и наличия кредитов.
 */

import { NextResponse } from 'next/server'
import { extractVideoId } from '@/lib/validators'
import { validateSummarizeRequest } from '@/lib/schemas'
import { getVideoData } from '@/lib/supadata'
import { analyzeTranscript } from '@/lib/gemini'
import { checkRateLimit, getClientIp, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

// Максимальный размер JSON тела запроса (1KB)
const MAX_BODY_SIZE = 1024

// Стоимость анализа в кредитах
const ANALYSIS_COST = 1

/**
 * Типы ошибок для маппинга в понятные сообщения
 */
const ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  INVALID_URL: { status: 400, message: 'Invalid YouTube URL' },
  VIDEO_NOT_FOUND: { status: 404, message: 'Video not found or unavailable' },
  TRANSCRIPT_NOT_FOUND: { status: 422, message: 'Transcript not available for this video' },
  API_KEY_INVALID: { status: 401, message: 'API configuration error' },
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Too many requests. Please try again later' },
  AI_RESPONSE_PARSE_ERROR: { status: 500, message: 'AI analysis failed. Please try again' },
  VIDEO_TOO_LONG: { status: 400, message: 'Video is too long for analysis' },
  REQUEST_TIMEOUT: { status: 504, message: 'Request timed out. Please try again' },
  UNAUTHORIZED: { status: 401, message: 'Authentication required' },
  INSUFFICIENT_CREDITS: { status: 402, message: 'Insufficient credits. Please purchase more credits to continue.' },
}

/**
 * POST /api/summarize
 * 
 * Body:
 * {
 *   url: "https://youtube.com/watch?v=..."
 * }
 * 
 * Response:
 * {
 *   videoId: string,
 *   title: string,
 *   channelName: string,
 *   thumbnailUrl: string,
 *   verdict: "MUST_WATCH" | "SKIP" | "RECAP_ONLY",
 *   verdictLabel: string,
 *   verdictDescription: string,
 *   summary: [{ emoji: string, text: string }],
 *   creditsRemaining: number
 * }
 */
export async function POST(req: Request) {
  try {
    // 0. Проверка аутентификации
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to analyze videos.' },
        { status: 401 }
      )
    }

    // 0.1 Проверка кредитов
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found. Please try signing out and back in.' },
        { status: 404 }
      )
    }

    if (profile.credits < ANALYSIS_COST) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits. You need at least 1 credit to analyze a video.',
          creditsRemaining: profile.credits 
        },
        { status: 402 }
      )
    }

    // 0.2 Rate limiting (по IP для дополнительной защиты)
    const clientIp = getClientIp(req)
    const rateLimitResult = checkRateLimit(clientIp, RATE_LIMIT_CONFIGS.summarize)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetTime),
          }
        }
      )
    }

    // 1. Парсим и валидируем тело запроса с ограничением размера
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      )
    }

    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    const validation = validateSummarizeRequest(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { url } = validation.data

    // 2. Извлекаем videoId
    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    // 3. Получаем транскрипт и метаданные от Supadata
    let videoData
    try {
      videoData = await getVideoData(url)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (ERROR_MESSAGES[errorMessage]) {
        const { status, message } = ERROR_MESSAGES[errorMessage]
        return NextResponse.json({ error: message }, { status })
      }

      // Логируем неизвестную ошибку (без чувствительных данных)
      console.error('Supadata error for video:', videoId)
      return NextResponse.json(
        { error: 'Failed to fetch video data' },
        { status: 500 }
      )
    }

    // Проверяем, есть ли транскрипт
    if (!videoData.transcript || videoData.transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript not available for this video' },
        { status: 422 }
      )
    }

    // 4. Анализируем транскрипт с помощью Gemini
    let analysis
    try {
      analysis = await analyzeTranscript(videoData.transcript)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      console.error('Gemini analysis error for video:', videoId)

      if (ERROR_MESSAGES[errorMessage]) {
        const { status, message } = ERROR_MESSAGES[errorMessage]
        return NextResponse.json({ error: message }, { status })
      }

      return NextResponse.json(
        { error: 'Failed to analyze video' },
        { status: 500 }
      )
    }

    // 5. Списываем кредиты и сохраняем историю анализа
    const { error: deductError } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: ANALYSIS_COST,
      p_description: `Analysis of video: ${videoId}`,
    })

    if (deductError) {
      console.error('Failed to deduct credits:', deductError)
      // Не возвращаем ошибку пользователю, так как анализ уже выполнен
      // Но логируем для мониторинга
    }

    // 6. Сохраняем историю анализа
    const { error: historyError } = await supabase
      .from('analysis_history')
      .insert({
        user_id: user.id,
        video_url: url,
        video_id: videoId,
        verdict: analysis.verdict,
        summary: analysis.summary.map(s => s.text).join('\n'),
      })

    if (historyError) {
      console.error('Failed to save analysis history:', historyError)
      // Не возвращаем ошибку пользователю
    }

    // 7. Получаем обновленное количество кредитов
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    // 8. Возвращаем успешный ответ
    return NextResponse.json({
      videoId: videoData.videoId,
      title: videoData.title,
      channelName: videoData.channelName,
      thumbnailUrl: videoData.thumbnailUrl,
      verdict: analysis.verdict,
      verdictLabel: analysis.verdictLabel,
      verdictDescription: analysis.verdictDescription,
      summary: analysis.summary,
      creditsRemaining: updatedProfile?.credits ?? profile.credits - ANALYSIS_COST,
    })

  } catch (error) {
    // Непредвиденная ошибка
    console.error('Unexpected error in /api/summarize:', error instanceof Error ? error.message : 'Unknown')
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/summarize
 * 
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Verdict AI API is running',
    version: '2.0.0',
    features: ['authentication', 'credits'],
  })
}

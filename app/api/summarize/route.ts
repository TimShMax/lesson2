/**
 * API Endpoint: POST /api/summarize
 * 
 * Принимает YouTube URL, получает транскрипт и анализирует его с помощью AI.
 */

import { NextResponse } from 'next/server'
import { extractVideoId } from '@/lib/validators'
import { validateSummarizeRequest, validateAiResponse } from '@/lib/schemas'
import { getVideoData } from '@/lib/supadata'
import { analyzeTranscript } from '@/lib/gemini'

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
 *   summary: [{ emoji: string, text: string }]
 * }
 */
export async function POST(req: Request) {
  try {
    // 1. Парсим и валидируем тело запроса
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

      // Логируем неизвестную ошибку
      console.error('Supadata error:', errorMessage)
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

      console.error('Gemini analysis error:', errorMessage)

      if (ERROR_MESSAGES[errorMessage]) {
        const { status, message } = ERROR_MESSAGES[errorMessage]
        return NextResponse.json({ error: message }, { status })
      }

      return NextResponse.json(
        { error: 'Failed to analyze video' },
        { status: 500 }
      )
    }

    // 5. Возвращаем успешный ответ
    return NextResponse.json({
      videoId: videoData.videoId,
      title: videoData.title,
      channelName: videoData.channelName,
      thumbnailUrl: videoData.thumbnailUrl,
      verdict: analysis.verdict,
      verdictLabel: analysis.verdictLabel,
      verdictDescription: analysis.verdictDescription,
      summary: analysis.summary,
    })

  } catch (error) {
    // Непредвиденная ошибка
    console.error('Unexpected error in /api/summarize:', error)
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
    version: '1.0.0',
  })
}

/**
 * Клиент для работы с Supadata API
 * Получает транскрипт и метаданные YouTube видео
 */

const SUPADATA_API_BASE = 'https://api.supadata.ai/v1/youtube'

// Таймаут для внешних API запросов (30 секунд)
const API_TIMEOUT_MS = 30000

/**
 * Создаёт AbortController с таймаутом
 */
function createTimeoutController(timeoutMs: number = API_TIMEOUT_MS): AbortController {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller
}

/**
 * Ответ от Supadata API (реальная структура)
 */
interface SupadataResponse {
  lang?: string
  availableLangs?: string[]
  content?: Array<{
    lang?: string
    text?: string
    offset?: number
    duration?: number
  }>
}

/**
 * Данные видео, полученные от Supadata
 */
export interface VideoData {
  videoId: string
  title: string
  channelName: string
  thumbnailUrl: string
  transcript: string
}

/**
 * Извлекает videoId из URL
 */
function extractVideoIdFromUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Получает транскрипт и метаданные видео от Supadata
 * @param url - YouTube URL видео
 * @returns VideoData с транскриптом и метаданными
 * @throws Error если не удалось получить данные
 */
export async function getVideoData(url: string): Promise<VideoData> {
  const apiKey = process.env.SUPADATA_API_KEY

  if (!apiKey) {
    throw new Error('SUPADATA_API_KEY is not configured')
  }

  // Логирование только в development режиме
  if (process.env.NODE_ENV === 'development') {
    console.log('[Supadata] Fetching transcript for:', url)
  }

  const controller = createTimeoutController()

  let response: Response
  try {
    response = await fetch(`${SUPADATA_API_BASE}/transcript?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('REQUEST_TIMEOUT')
    }
    throw error
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Supadata] Response status:', response.status)
  }

  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Supadata] Error status:', response.status)
    }

    if (response.status === 404) {
      throw new Error('VIDEO_NOT_FOUND')
    }

    if (response.status === 403) {
      throw new Error('API_KEY_INVALID')
    }

    if (response.status === 429) {
      throw new Error('RATE_LIMIT_EXCEEDED')
    }

    throw new Error(`Supadata API error: ${response.status}`)
  }

  const data: SupadataResponse = await response.json()

  if (process.env.NODE_ENV === 'development') {
    console.log('[Supadata] Has content:', Array.isArray(data.content), 'Length:', data.content?.length)
  }

  // Проверяем наличие контента
  if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
    console.warn('[Supadata] No transcript content available for video')
    throw new Error('TRANSCRIPT_NOT_FOUND')
  }

  // Склеиваем транскрипт из массива
  const transcriptText = data.content
    .map((item) => item.text || '')
    .join(' ')

  if (process.env.NODE_ENV === 'development') {
    console.log('[Supadata] Transcript length:', transcriptText.length, 'chars')
  }

  // Извлекаем videoId из URL
  const videoId = extractVideoIdFromUrl(url) || 'unknown'

  // Формируем thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  return {
    videoId,
    title: '', // Supadata не возвращает title в этом эндпоинте
    channelName: '', // Supadata не возвращает channelName в этом эндпоинте
    thumbnailUrl,
    transcript: transcriptText,
  }
}

/**
 * Проверяет доступность API Supadata
 * @returns true если API доступен
 */
export async function checkSupadataHealth(): Promise<boolean> {
  const apiKey = process.env.SUPADATA_API_KEY

  if (!apiKey) {
    return false
  }

  const controller = createTimeoutController(10000) // 10 секунд для health check

  try {
    const response = await fetch(`${SUPADATA_API_BASE}/status`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
      signal: controller.signal,
    })

    return response.ok
  } catch {
    return false
  }
}

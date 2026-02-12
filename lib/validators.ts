/**
 * Утилиты для валидации и парсинга YouTube URL
 */

const YOUTUBE_REGEX_PATTERNS = [
  // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  // Shorts: https://www.youtube.com/shorts/VIDEO_ID
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  // Live: https://www.youtube.com/live/VIDEO_ID
  /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
]

/**
 * Извлекает videoId из YouTube URL
 * @param url - YouTube URL для парсинга
 * @returns videoId или null, если URL невалиден
 */
export function extractVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  for (const pattern of YOUTUBE_REGEX_PATTERNS) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Проверяет, является ли строка валидным YouTube URL
 * @param url - URL для проверки
 * @returns true, если URL валиден
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null
}

/**
 * Проверяет, является ли videoId валидным (11 символов, буквы, цифры, дефис, подчёркивание)
 * @param videoId - videoId для проверки
 * @returns true, если videoId валиден
 */
export function isValidVideoId(videoId: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId)
}

/**
 * Формирует полный YouTube URL из videoId
 * @param videoId - YouTube videoId
 * @returns Полный YouTube URL
 */
export function buildYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/**
 * Парсит URL и возвращает объект с извлечёнными данными
 * @param url - YouTube URL для парсинга
 * @returns Объект с videoId и оригинальным URL
 */
export function parseYouTubeUrl(url: string): {
  videoId: string | null
  originalUrl: string
  isValid: boolean
} {
  const videoId = extractVideoId(url)
  return {
    videoId,
    originalUrl: url,
    isValid: videoId !== null,
  }
}

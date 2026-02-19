/**
 * Простое in-memory rate limiting решение
 * Для production рекомендуется использовать Redis (Upstash, etc.)
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Хранилище для rate limit записей
const rateLimitStore = new Map<string, RateLimitEntry>()

// Очистка устаревших записей каждые 60 секунд
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 60000)
}

export interface RateLimitConfig {
  // Максимальное количество запросов
  limit: number
  // Окно времени в миллисекундах
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

/**
 * Проверяет rate limit для данного идентификатора
 * @param id - Уникальный идентификатор (обычно IP адрес)
 * @param config - Конфигурация rate limit
 * @returns Результат проверки
 */
export function checkRateLimit(id: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(id)

  // Если записи нет или окно истекло, создаём новую
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(id, newEntry)

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: newEntry.resetTime,
    }
  }

  // Если лимит превышен
  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Увеличиваем счётчик
  entry.count++
  rateLimitStore.set(id, entry)

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Извлекает IP адрес из запроса
 * Поддерживает различные заголовки прокси
 */
export function getClientIp(request: Request): string {
  // Проверяем заголовки прокси
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Берём первый IP из списка
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  // Fallback для development
  return 'unknown'
}

/**
 * Конфигурация rate limit для API endpoints
 */
export const RATE_LIMIT_CONFIGS = {
  // Для /api/summarize - 10 запросов в минуту
  summarize: {
    limit: 10,
    windowMs: 60000, // 1 минута
  },
  // Для health checks - 60 запросов в минуту
  health: {
    limit: 60,
    windowMs: 60000,
  },
} as const

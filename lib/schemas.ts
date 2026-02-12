/**
 * Zod схемы для валидации входящих и исходящих данных API
 */

import { z } from 'zod'
import { isValidYouTubeUrl } from './validators'

// ============================================================================
// Входящие данные
// ============================================================================

/**
 * Схема для валидации входящего запроса к /api/summarize
 */
export const summarizeRequestSchema = z.object({
  url: z
    .string()
    .min(1, { message: 'URL is required' })
    .url({ message: 'Invalid URL format' })
    .refine((url) => isValidYouTubeUrl(url), {
      message: 'URL must be a valid YouTube link',
    }),
})

export type SummarizeRequest = z.infer<typeof summarizeRequestSchema>

// ============================================================================
// Исходящие данные
// ============================================================================

/**
 * Вердикт анализа видео
 */
export const verdictEnum = z.enum(['MUST_WATCH', 'SKIP', 'RECAP_ONLY'])

export type Verdict = z.infer<typeof verdictEnum>

/**
 * Элемент summary (буллит)
 */
export const summaryItemSchema = z.object({
  emoji: z.string().min(1),
  text: z.string().min(1),
})

export type SummaryItem = z.infer<typeof summaryItemSchema>

/**
 * Полная схема ответа API
 */
export const summaryResponseSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1),
  channelName: z.string().min(1),
  thumbnailUrl: z.string().url(),
  verdict: verdictEnum,
  verdictLabel: z.string().min(1),
  verdictDescription: z.string().min(1),
  summary: z.array(summaryItemSchema).min(1).max(10),
})

export type SummaryResponse = z.infer<typeof summaryResponseSchema>

// ============================================================================
// Ошибки
// ============================================================================

/**
 * Схема для ошибок API
 */
export const apiErrorSchema = z.object({
  error: z.string().min(1),
  message: z.string().optional(),
})

export type ApiError = z.infer<typeof apiErrorSchema>

// ============================================================================
// Утилиты валидации
// ============================================================================

/**
 * Валидирует входящий запрос и возвращает результат
 * @param data - Данные для валидации
 * @returns Результат валидации
 */
export function validateSummarizeRequest(data: unknown):
  | { success: true; data: SummarizeRequest }
  | { success: false; error: string } {
  const result = summarizeRequestSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errorMessage = result.error.errors
    .map((e) => e.message)
    .join('; ')

  return { success: false, error: errorMessage }
}

/**
 * Валидирует ответ AI и возвращает результат
 * @param data - Данные для валидации
 * @returns Результат валидации
 */
export function validateAiResponse(data: unknown):
  | { success: true; data: Omit<SummaryResponse, 'videoId' | 'title' | 'channelName' | 'thumbnailUrl'> }
  | { success: false; error: string } {
  const partialSchema = z.object({
    verdict: verdictEnum,
    verdictLabel: z.string().min(1),
    verdictDescription: z.string().min(1),
    summary: z.array(summaryItemSchema).min(1).max(10),
  })

  const result = partialSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errorMessage = result.error.errors
    .map((e) => e.message)
    .join('; ')

  return { success: false, error: errorMessage }
}

// ============================================================================
// Маппинг вердиктов для UI
// ============================================================================

/**
 * Конфигурация вердиктов для отображения в UI
 */
export const verdictConfig = {
  MUST_WATCH: {
    label: 'MUST WATCH',
    uiVerdict: 'must_watch' as const,
    color: 'hsl(142, 76%, 46%)',
  },
  SKIP: {
    label: 'SKIP',
    uiVerdict: 'skip' as const,
    color: 'hsl(0, 80%, 55%)',
  },
  RECAP_ONLY: {
    label: 'MEH',
    uiVerdict: 'meh' as const,
    color: 'hsl(38, 92%, 50%)',
  },
}

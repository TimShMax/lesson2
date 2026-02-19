/**
 * Клиент для работы с Google Gemini API
 * Анализирует транскрипт видео и возвращает структурированный результат
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

// Инициализация Gemini клиента
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')

/**
 * Результат анализа от Gemini
 */
export interface GeminiAnalysisResult {
  verdict: 'MUST_WATCH' | 'SKIP' | 'RECAP_ONLY'
  verdictLabel: string
  verdictDescription: string
  summary: Array<{
    emoji: string
    text: string
  }>
}

/**
 * Санитизирует транскрипт для защиты от prompt injection
 * Удаляет потенциально опасные паттерны
 */
function sanitizeTranscript(transcript: string): string {
  let sanitized = transcript

  // Удаляем потенциально опасные паттерны prompt injection
  const dangerousPatterns = [
    // Попытки переопределить системный промпт
    /ignore (all )?(previous|above|earlier) (instructions|prompts|rules)/gi,
    /disregard (all )?(previous|above|earlier)/gi,
    /forget (all )?(previous|above|earlier)/gi,
    /you are now?/gi,
    /new instructions?:/gi,
    /system:?/gi,
    /assistant:?/gi,
    /\[system\]/gi,
    /\[assistant\]/gi,
    /\[user\]/gi,
    // Попытки экранирования
    /```/g,
    /~~~\s*json/gi,
    /<\|.*?\|>/g,  // Специальные токены
  ]

  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  }

  // Ограничиваем максимальную длину
  const maxLength = 60000
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...'
  }

  return sanitized
}

/**
 * Системный промпт для анализа видео
 */
const SYSTEM_PROMPT = `Ты — ассистент, который экономит время. Твоя задача — проанализировать текст видео и вернуть JSON.

Правила анализа:
1. Определи вердикт:
   - "MUST_WATCH" — если контент уникальный, плотный, с практическими примерами
   - "SKIP" — если кликбейт, вода, или информация общеизвестна
   - "RECAP_ONLY" — если суть можно понять из заголовка/описания

2. verdictLabel — короткая фраза на русском:
   - MUST_WATCH: "Смотреть обязательно", "Топ контент", "Очень полезно"
   - SKIP: "Лучше пропустить", "Кликбейт", "Не стоит времени"
   - RECAP_ONLY: "Мех", "Поверхностно", "Только для ознакомления"

3. verdictDescription — краткое пояснение (1 предложение, на русском)

4. summary — массив из 5-7 ОБЪЕКТОВ с полями emoji и text:
   [{ "emoji": "💰", "text": "описание" }, ...]
   Эмодзи и текст должны быть РАЗДЕЛЕНЫ
   Текст на русском, краткий (10-20 слов)

ВАЖНО: summary должен быть МАССИВОМ ОБЪЕКТОВ, не массивом строк!
Пример:
[
  { "emoji": "💰", "text": "История заработка первых денег" },
  { "emoji": "👨‍💻", "text": "Начало карьеры iOS разработчика" }
]

Отвечай ТОЛЬКО валидным JSON без markdown форматирования, без кодблоков.`

/**
 * Анализирует транскрипт видео с помощью Gemini
 * @param transcript - Текст транскрипта видео
 * @returns Результат анализа
 * @throws Error если не удалось проанализировать
 */
export async function analyzeTranscript(transcript: string): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured')
  }

  // Санитизируем транскрипт для защиты от prompt injection
  const sanitizedTranscript = sanitizeTranscript(transcript)

  // Логирование только в development режиме
  if (process.env.NODE_ENV === 'development') {
    console.log('[Gemini] Sending request, transcript length:', sanitizedTranscript.length)
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-lite-latest',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  })

  const fullPrompt = `${SYSTEM_PROMPT}

Транскрипт видео:
${sanitizedTranscript}`

  try {
    const result = await model.generateContent(fullPrompt)
    const responseText = result.response.text()

    // Логирование только в development режиме
    if (process.env.NODE_ENV === 'development') {
      console.log('[Gemini] Response length:', responseText.length)
    }

    // Попытка очистить response от markdown кодблоков
    let cleanResponse = responseText.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.slice(7, -3).trim()
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.slice(3, -3).trim()
    }

    // Парсим JSON ответ
    const parsedResult = JSON.parse(cleanResponse) as GeminiAnalysisResult

    // Валидируем результат
    if (!isValidAnalysisResult(parsedResult)) {
      console.error('[Gemini] Invalid result structure')
      throw new Error('Invalid AI response structure')
    }

    return parsedResult
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('[Gemini] JSON parse error')
      throw new Error('AI_RESPONSE_PARSE_ERROR')
    }
    console.error('[Gemini] Analysis error')
    throw error
  }
}

/**
 * Проверяет валидность структуры результата анализа
 */
function isValidAnalysisResult(data: unknown): data is GeminiAnalysisResult {
  if (!data || typeof data !== 'object') {
    return false
  }

  const result = data as Record<string, unknown>

  // Проверяем verdict
  if (typeof result.verdict !== 'string' || !['MUST_WATCH', 'SKIP', 'RECAP_ONLY'].includes(result.verdict)) {
    return false
  }

  // Проверяем verdictLabel
  if (typeof result.verdictLabel !== 'string') {
    return false
  }

  // Проверяем verdictDescription
  if (typeof result.verdictDescription !== 'string') {
    return false
  }

  // Проверяем summary
  if (!Array.isArray(result.summary)) {
    return false
  }

  for (let i = 0; i < result.summary.length; i++) {
    const item = result.summary[i]
    if (!item || typeof item !== 'object') {
      return false
    }
    const summaryItem = item as Record<string, unknown>
    if (typeof summaryItem.emoji !== 'string' || typeof summaryItem.text !== 'string') {
      return false
    }
  }

  return true
}

/**
 * Проверяет доступность Gemini API
 * @returns true если API доступен
 */
export async function checkGeminiHealth(): Promise<boolean> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    return false
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-lite-latest',
    })

    await model.generateContent('test')
    return true
  } catch {
    return false
  }
}

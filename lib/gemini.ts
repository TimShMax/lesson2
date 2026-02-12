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

  // Ограничиваем длину транскрипта для оптимизации
  const maxLength = 60000
  const truncatedTranscript = transcript.length > maxLength
    ? transcript.substring(0, maxLength) + '...'
    : transcript

  console.log('[Gemini] Sending request, transcript length:', truncatedTranscript.length)

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
${truncatedTranscript}`

  try {
    const result = await model.generateContent(fullPrompt)
    const responseText = result.response.text()

    console.log('[Gemini] Response length:', responseText.length)
    console.log('[Gemini] Response preview:', responseText.substring(0, 500))

    // Попытка очистить response от markdown кодблоков
    let cleanResponse = responseText.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.slice(7, -3).trim()
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.slice(3, -3).trim()
    }

    // Парсим JSON ответ
    const parsedResult = JSON.parse(cleanResponse) as GeminiAnalysisResult
    console.log('[Gemini] Parsed result:', JSON.stringify(parsedResult, null, 2))

    // Валидируем результат
    if (!isValidAnalysisResult(parsedResult)) {
      console.error('[Gemini] Invalid result structure:', parsedResult)
      throw new Error('Invalid AI response structure')
    }

    return parsedResult
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('[Geminey] JSON parse error:', error)
      throw new Error('AI_RESPONSE_PARSE_ERROR')
    }
    console.error('[Gemini] Analysis error:', error)
    throw error
  }
}

/**
 * Проверяет валидность структуры результата анализа
 */
function isValidAnalysisResult(data: unknown): data is GeminiAnalysisResult {
  if (!data || typeof data !== 'object') {
    console.log('[Gemini] Invalid data type:', typeof data)
    return false
  }

  const result = data as Record<string, unknown>

  console.log('[Gemini] Validating keys:', Object.keys(result))

  // Проверяем verdict
  if (typeof result.verdict !== 'string' || !['MUST_WATCH', 'SKIP', 'RECAP_ONLY'].includes(result.verdict)) {
    console.log('[Gemini] Invalid verdict:', result.verdict)
    return false
  }

  // Проверяем verdictLabel
  if (typeof result.verdictLabel !== 'string') {
    console.log('[Gemini] Invalid verdictLabel:', result.verdictLabel)
    return false
  }

  // Проверяем verdictDescription
  if (typeof result.verdictDescription !== 'string') {
    console.log('[Gemini] Invalid verdictDescription:', result.verdictDescription)
    return false
  }

  // Проверяем summary
  if (!Array.isArray(result.summary)) {
    console.log('[Gemini] Summary is not array:', result.summary)
    return false
  }

  for (let i = 0; i < result.summary.length; i++) {
    const item = result.summary[i]
    if (!item || typeof item !== 'object') {
      console.log(`[Gemini] Summary[${i}] is not object`)
      return false
    }
    const summaryItem = item as Record<string, unknown>
    if (typeof summaryItem.emoji !== 'string' || typeof summaryItem.text !== 'string') {
      console.log(`[Gemini] Summary[${i}] invalid:`, summaryItem)
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

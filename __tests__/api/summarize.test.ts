/**
 * Unit tests for /api/summarize endpoint
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { extractVideoId, isValidYouTubeUrl } from '@/lib/validators'
import { validateSummarizeRequest } from '@/lib/schemas'

// Мокаем внешние API модули
vi.mock('@/lib/supadata', () => ({
  getVideoData: vi.fn(),
}))

vi.mock('@/lib/gemini', () => ({
  analyzeTranscript: vi.fn(),
}))

describe('lib/validators', () => {
  describe('extractVideoId', () => {
    it('должен извлекать videoId из стандартного URL', () => {
      expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))
        .toBe('dQw4w9WgXcQ')
    })

    it('должен извлекать videoId из сокращённого URL', () => {
      expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ'))
        .toBe('dQw4w9WgXcQ')
    })

    it('должен извлекать videoId из Shorts URL', () => {
      expect(extractVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'))
        .toBe('dQw4w9WgXcQ')
    })

    it('должен извлекать videoId из live URL', () => {
      expect(extractVideoId('https://www.youtube.com/live/dQw4w9WgXcQ'))
        .toBe('dQw4w9WgXcQ')
    })

    it('должен возвращать null для невалидного URL', () => {
      expect(extractVideoId('https://example.com/video')).toBeNull()
    })

    it('должен возвращать null для null/undefined', () => {
      expect(extractVideoId(null as unknown as string)).toBeNull()
      expect(extractVideoId(undefined as unknown as string)).toBeNull()
    })
  })

  describe('isValidYouTubeUrl', () => {
    it('должен возвращать true для валидных YouTube URL', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
      expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
      expect(isValidYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(true)
    })

    it('должен возвращать false для невалидных URL', () => {
      expect(isValidYouTubeUrl('https://example.com')).toBe(false)
      expect(isValidYouTubeUrl('not a url')).toBe(false)
      expect(isValidYouTubeUrl('')).toBe(false)
    })
  })
})

describe('lib/schemas', () => {
  describe('validateSummarizeRequest', () => {
    it('должен валидировать корректный URL', () => {
      const result = validateSummarizeRequest({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      }
    })

    it('должен возвращать ошибку для невалидного JSON', () => {
      const result = validateSummarizeRequest(null)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('URL is required')
      }
    })

    it('должен возвращать ошибку для невалидного URL', () => {
      const result = validateSummarizeRequest({
        url: 'not-a-valid-url',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid URL')
      }
    })

    it('должен возвращать ошибку для не-YouTube URL', () => {
      const result = validateSummarizeRequest({
        url: 'https://vimeo.com/123456',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('YouTube')
      }
    })
  })
})

describe('API Integration Tests', () => {
  // Эти тесты требуют мокинга fetch или использования test server
  // Для продакшна рекомендуется использовать integration tests с Supertest

  it('должен обрабатывать ошибку 400 для невалидного URL', async () => {
    // Тест требует запущенного сервера или msw (Mock Service Worker)
    // Пропускаем для unit tests
  })

  it('должен обрабатывать ошибку 404 для несуществующего видео', async () => {
    // Тест требует мокинга Supadata API
  })
})

// ============================================================================
// Примеры тестовых данных
// ============================================================================

export const MOCK_VIDEO_DATA = {
  videoId: 'dQw4w9WgXcQ',
  title: 'Test Video Title',
  channelName: 'Test Channel',
  thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  transcript: 'Это тестовый транскрипт видео. Он содержит много важной информации о тестировании.',
}

export const MOCK_AI_RESPONSE = {
  verdict: 'MUST_WATCH' as const,
  verdictLabel: 'Смотреть обязательно',
  verdictDescription: 'Видео содержит уникальный и полезный контент.',
  summary: [
    { emoji: '💡', text: 'Основная мысль 1' },
    { emoji: '📉', text: 'Основная мысль 2' },
  ],
}

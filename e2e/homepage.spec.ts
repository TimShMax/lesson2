import { test, expect } from '@playwright/test'

/**
 * Homepage E2E Tests
 * Tests for the main landing page of VerdictAI
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/VerdictAI - Is It Worth Watching/)
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Is It Worth Watching/i })).toBeVisible()
    
    // Check description - use more specific selector
    await expect(page.locator('section').first().getByText(/Paste a YouTube link/i)).toBeVisible()
  })

  test('should display navigation menu', async ({ page }) => {
    // Check header navigation
    const header = page.locator('header')
    await expect(header).toBeVisible()
    
    // Check navigation links - use exact match for header nav
    await expect(header.getByRole('link', { name: 'Features' })).toBeVisible()
    await expect(header.getByRole('link', { name: 'How It Works', exact: true })).toBeVisible()
    await expect(header.getByRole('link', { name: 'Demo' })).toBeVisible()
  })

  test('should display features section', async ({ page }) => {
    // Scroll to features
    await page.locator('#features').scrollIntoViewIfNeeded()
    
    // Check features heading
    await expect(page.getByRole('heading', { name: /Everything you need to decide/i })).toBeVisible()
    
    // Check feature cards
    await expect(page.getByText(/Instant Analysis/i)).toBeVisible()
    await expect(page.getByText(/AI-Powered Summaries/i)).toBeVisible()
    await expect(page.getByText(/Save Hours/i)).toBeVisible()
  })

  test('should display how it works section', async ({ page }) => {
    // Scroll to how it works
    await page.locator('#how-it-works').scrollIntoViewIfNeeded()
    
    // Check section heading
    await expect(page.getByRole('heading', { name: /Three steps. Zero effort/i })).toBeVisible()
    
    // Check steps - use role heading for step titles
    await expect(page.getByRole('heading', { name: 'Paste a YouTube Link' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /AI Processes the Content/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Get Your Verdict/i })).toBeVisible()
  })

  test('should display verdict badges examples', async ({ page }) => {
    // Scroll to examples section
    await page.locator('#features').scrollIntoViewIfNeeded()
    
    // Check verdict badges are displayed
    await expect(page.getByText(/MUST WATCH/i).first()).toBeVisible()
    await expect(page.getByText(/SKIP/i).first()).toBeVisible()
    await expect(page.getByText(/MEH/i).first()).toBeVisible()
  })

  test('should display CTA buttons', async ({ page }) => {
    // Check primary CTA
    await expect(page.getByRole('link', { name: /Try It Free/i })).toBeVisible()
    
    // Check secondary CTA
    await expect(page.getByRole('link', { name: /See How It Works/i })).toBeVisible()
  })

  test('should display footer', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded()
    
    // Check footer content - use footer-scoped selector
    await expect(page.locator('footer').getByText(/VerdictAI/i)).toBeVisible()
    await expect(page.locator('footer').getByRole('link', { name: /Terms/i })).toBeVisible()
    await expect(page.locator('footer').getByRole('link', { name: /Privacy/i })).toBeVisible()
  })

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check mobile menu button is visible
    const menuButton = page.getByRole('button', { name: /Open menu/i })
    await expect(menuButton).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    
    // Check desktop navigation is visible
    await expect(page.getByRole('link', { name: /Features/i })).toBeVisible()
  })
})

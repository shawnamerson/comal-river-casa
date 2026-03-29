import { test, expect } from '@playwright/test'

test.describe('Admin route protection', () => {
  test('unauthenticated user visiting /admin is redirected to /login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user visiting /admin/bookings is redirected to /login', async ({ page }) => {
    await page.goto('/admin/bookings')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user visiting /admin/rates is redirected to /login', async ({ page }) => {
    await page.goto('/admin/rates')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user visiting /admin/analytics is redirected to /login', async ({ page }) => {
    await page.goto('/admin/analytics')
    await expect(page).toHaveURL(/\/login/)
  })
})

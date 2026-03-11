import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RESUME_PATH = path.resolve('/Users/saurabhsingh/Documents/Resume_Mar_2026.pdf')
const SCREENSHOTS_DIR = path.resolve(__dirname, 'screenshots')

const JOB_DESCRIPTION = `Minimum qualifications:
Bachelor's degree or equivalent practical experience.
8 years of experience in software development.
5 years of experience testing, and launching software products.
3 years of experience with software design and architecture.

Preferred qualifications:
Master's degree or PhD in Engineering, Computer Science, or a related technical field.
8 years of experience with data structures/algorithms.
3 years of experience in a technical leadership role leading project teams and setting technical direction.
3 years of experience working in an organization involving cross-functional, or cross-business projects.
About the job
Google's software engineers develop the next-generation technologies that change how billions of users connect, explore, and interact with information and one another. Our products need to handle information at massive scale, and extend well beyond web search. We're looking for engineers who bring fresh ideas from all areas, including information retrieval, distributed computing, large-scale system design, networking and data storage, security, artificial intelligence, natural language processing, UI design and mobile; the list goes on and is growing every day. As a software engineer, you will work on a specific project critical to Google's needs with opportunities to switch teams and projects as you and our fast-paced business grow and evolve. We need our engineers to be versatile, display leadership qualities and be enthusiastic to take on new problems across the full-stack as we continue to push technology forward.

With your technical expertise you will manage project priorities, deadlines, and deliverables. You will design, develop, test, deploy, maintain, and enhance software solutions.

Google Cloud accelerates every organization's ability to digitally transform its business and industry. We deliver enterprise-grade solutions that leverage Google's cutting-edge technology, and tools that help developers build more sustainably. Customers in more than 200 countries and territories turn to Google Cloud as their trusted partner to enable growth and solve their most critical business problems.

Responsibilities
Provide technical leadership on high-impact projects.
Influence and coach a distributed team of engineers.
Facilitate alignment and clarity across teams on goals, outcomes, and timelines.
Manage project priorities, deadlines, and deliverables.
Design, develop, test, deploy, maintain, and enhance large scale software solutions.`

test('FitScoreAI full flow — upload resume, paste JD, view results', async ({ page }) => {
  // Step 1: Landing page — Upload step
  await page.goto('/')
  await expect(page.getByText('Upload Your Resume')).toBeVisible()
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-upload-step.png`, fullPage: true })

  // Step 2: Upload the resume PDF via the hidden file input
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(RESUME_PATH)

  // Verify file name is shown
  await expect(page.getByText('Resume_Mar_2026.pdf')).toBeVisible()
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-file-selected.png`, fullPage: true })

  // Step 3: Click Continue to go to JD step
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Paste the Job Description')).toBeVisible()
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-jd-input-empty.png`, fullPage: true })

  // Step 4: Paste the job description
  const textarea = page.locator('textarea')
  await textarea.fill(JOB_DESCRIPTION)
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-jd-input-filled.png`, fullPage: true })

  // Step 5: Click Analyze Fit
  await page.getByRole('button', { name: 'Analyze Fit' }).click()

  // Should show loading state
  await expect(page.getByText('Analyzing your resume...')).toBeVisible()
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-loading.png`, fullPage: true })

  // Step 6: Wait for results or error (up to 90s for Claude API response)
  const resultsOrError = page.getByText('Overall Fit Score').or(page.getByText('Something went wrong'))
  await expect(resultsOrError).toBeVisible({ timeout: 90_000 })

  // If we hit error state, screenshot it and fail with a clear message
  if (await page.getByText('Something went wrong').isVisible()) {
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-error-state.png`, fullPage: true })
    throw new Error('API returned an error — see 06-error-state.png')
  }

  // Small delay for score animation to complete
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-results-overview.png`, fullPage: true })

  // Step 7: Click on the first metric card to expand it
  const firstMetricCard = page.locator('[class*="cursor-pointer"]').first()
  await firstMetricCard.click()
  await page.waitForTimeout(300) // transition
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/07-metric-expanded.png`, fullPage: true })

  // Step 8: Full-page screenshot showing all metrics
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/08-results-full-page.png`, fullPage: true })
})

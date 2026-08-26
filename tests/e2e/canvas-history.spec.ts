import { expect, test, type Page } from "@playwright/test"
import { makeCommittedProject } from "../unit/canvas-fixtures"

async function seedPrototypeProject(page: Page): Promise<void> {
  const project = makeCommittedProject()
  await page.addInitScript((payload) => {
    window.localStorage.setItem("protomatch:projects", JSON.stringify(payload))
  }, {
    state: {
      projects: [project],
      onboardingCompleted: true,
    },
    version: 1,
  })
}

test("캔버스 이전·다음이 추가를 되돌린다", async ({ page }) => {
  await seedPrototypeProject(page)
  await page.goto("/projects/p-canvas?step=prototype")

  const applyButton = page.locator('[data-palette-type="button"]').getByRole("button", { name: "적용" })
  await expect(applyButton).toBeVisible()
  await applyButton.click()
  await expect(page.locator("[data-canvas-instance]")).toHaveCount(1)

  await page.getByRole("button", { name: "이전" }).click()
  await expect(page.locator("[data-canvas-instance]")).toHaveCount(0)

  await page.getByRole("button", { name: "다음" }).click()
  await expect(page.locator("[data-canvas-instance]")).toHaveCount(1)

  await page.keyboard.press("ControlOrMeta+z")
  await expect(page.locator("[data-canvas-instance]")).toHaveCount(0)
})

import { expect, test, type Page } from "@playwright/test"
import { makeCommittedProject } from "../unit/canvas-fixtures"

async function seedGalleryProject(page: Page): Promise<void> {
  const project = makeCommittedProject({
    name: "쇼핑몰",
    wireframes: [
      {
        id: "w1",
        generationId: "g3",
        sourceConceptId: "c1",
        sourcePaletteId: "pal1",
        title: "홈 카드 갤러리",
        structureNotes: "카드 그리드",
        blocks: [{ id: "b1", role: "list", notes: "" }],
        status: "committed",
        committedAt: "2026-08-24T00:00:00.000Z",
      },
    ],
  })
  await page.addInitScript(
    (payload) => {
      window.localStorage.setItem("protomatch:projects", JSON.stringify(payload))
    },
    {
      state: {
        projects: [project],
        onboardingCompleted: true,
      },
      version: 1,
    }
  )
}

test("갤러리 카드 슬롯을 리사이즈한다", async ({ page }) => {
  await seedGalleryProject(page)
  await page.goto("/projects/p-canvas?step=prototype")

  const card = page.locator('[data-canvas-slot="gallery-0"]')
  await expect(card).toBeVisible()
  await card.evaluate((node) => {
    node.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }))
    node.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true }))
  })
  const before = await card.boundingBox()
  expect(before).toBeTruthy()

  const seHandle = card.locator('[data-resize-handle="se"]')
  await expect(seHandle).toBeVisible()
  const handleBox = await seHandle.boundingBox()
  expect(handleBox).toBeTruthy()

  await page.mouse.move(
    handleBox!.x + handleBox!.width / 2,
    handleBox!.y + handleBox!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(handleBox!.x + 90, handleBox!.y + 70, { steps: 8 })
  await page.mouse.up()

  const after = await card.boundingBox()
  expect(after).toBeTruthy()
  expect(after!.width).toBeGreaterThan(before!.width + 20)
  expect(after!.height).toBeGreaterThan(before!.height + 20)
})

test("헤더 버튼을 따로 리사이즈한다", async ({ page }) => {
  await seedGalleryProject(page)
  await page.goto("/projects/p-canvas?step=prototype")

  const header = page.locator('[data-canvas-slot="header"]')
  const button = page.locator('[data-canvas-slot="header-cta"]')
  await expect(button).toBeVisible()
  const headerBefore = await header.boundingBox()
  const before = await button.boundingBox()
  expect(headerBefore).toBeTruthy()
  expect(before).toBeTruthy()

  await button.evaluate((node) => {
    node.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }))
    node.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true }))
  })
  const seHandle = button.locator('[data-resize-handle="se"]')
  await expect(seHandle).toBeVisible()
  const handleBox = await seHandle.boundingBox()
  expect(handleBox).toBeTruthy()

  await page.mouse.move(
    handleBox!.x + handleBox!.width / 2,
    handleBox!.y + handleBox!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(handleBox!.x + 80, handleBox!.y + 40, { steps: 8 })
  await page.mouse.up()

  const after = await button.boundingBox()
  const headerAfter = await header.boundingBox()
  expect(after).toBeTruthy()
  expect(after!.width).toBeGreaterThan(before!.width + 16)
  expect(Math.abs((headerAfter?.width ?? 0) - (headerBefore?.width ?? 0))).toBeLessThan(8)
})

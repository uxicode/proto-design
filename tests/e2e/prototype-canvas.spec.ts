import { expect, test } from "@playwright/test"

test("프로토타입 캔버스: 적용·이동·라벨·새로고침 유지", async ({ page }) => {
  await page.goto("/projects/new")
  await page.getByLabel("프로젝트 이름").fill("캔버스 E2E")
  await page.getByRole("button", { name: "만들기" }).click()

  await page.getByRole("radio", { name: "핀테크" }).click()
  await page.getByLabel("키워드").fill("신뢰")
  await page.getByRole("button", { name: "추가" }).click()
  await page.getByLabel("키워드").fill("대시보드")
  await page.getByRole("button", { name: "추가" }).click()
  await page.getByRole("button", { name: "분야와 키워드 저장" }).click()

  await page.getByRole("button", { name: "컨셉 3안 생성" }).click()
  await expect(page.getByRole("button", { name: "이 안으로 확정" }).first()).toBeVisible({
    timeout: 20_000,
  })
  await page.getByRole("button", { name: "이 안으로 확정" }).first().click()

  await page.getByRole("button", { name: "팔레트 3안 생성" }).click()
  await expect(page.getByRole("button", { name: "이 안으로 확정" }).first()).toBeVisible({
    timeout: 20_000,
  })
  await page.getByRole("button", { name: "이 안으로 확정" }).first().click()

  await page.getByRole("button", { name: "와이어프레임 20안 생성" }).click()
  await expect(page.getByRole("button", { name: "이 안으로 확정" }).first()).toBeVisible({
    timeout: 20_000,
  })
  await page.getByRole("button", { name: "이 안으로 확정" }).first().click()

  await page.getByRole("button", { name: "컴포넌트 3안 생성" }).click()
  await expect(page.getByRole("button", { name: "이 안으로 확정" }).first()).toBeVisible({
    timeout: 20_000,
  })
  await page.getByRole("button", { name: "이 안으로 확정" }).first().click()

  await expect(page.getByRole("region", { name: "최종 프로토타입" })).toBeVisible()
  await expect(
    page
      .getByRole("region", { name: "최종 프로토타입" })
      .getByRole("region", { name: "확정 컨셉·팔레트·와이어프레임" })
  ).toBeVisible()
  await expect(
    page.getByRole("region", { name: "최종 프로토타입" }).locator("img")
  ).toHaveCount(0)

  const applyButton = page.locator('[data-palette-type="button"]').getByRole("button", { name: "적용" })
  await applyButton.click()

  const stage = page.locator("[data-canvas-stage]")
  const instance = page.locator("[data-canvas-instance]").first()
  await expect(instance).toBeVisible()

  const stageBox = await stage.boundingBox()
  const instanceBox = await instance.boundingBox()
  expect(stageBox).toBeTruthy()
  expect(instanceBox).toBeTruthy()
  const stageCenterX = stageBox!.x + stageBox!.width / 2
  const stageCenterY = stageBox!.y + stageBox!.height / 2
  const instanceCenterX = instanceBox!.x + instanceBox!.width / 2
  const instanceCenterY = instanceBox!.y + instanceBox!.height / 2
  expect(Math.abs(instanceCenterX - stageCenterX)).toBeLessThanOrEqual(8)
  expect(Math.abs(instanceCenterY - stageCenterY)).toBeLessThanOrEqual(8)

  await instance.hover()
  await page.mouse.down()
  await page.mouse.move(instanceBox!.x + 90, instanceBox!.y + 50)
  await page.mouse.up()
  const movedBox = await instance.boundingBox()
  expect(movedBox).toBeTruthy()
  expect(movedBox!.x).not.toBe(instanceBox!.x)

  const seHandle = page.locator('[data-resize-handle="se"]')
  await expect(seHandle).toBeVisible()
  const widthBefore = Number(await page.getByRole("spinbutton", { name: "너비" }).inputValue())
  const heightBefore = Number(await page.getByRole("spinbutton", { name: "높이" }).inputValue())
  const handleBox = await seHandle.boundingBox()
  expect(handleBox).toBeTruthy()
  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(handleBox!.x + 90, handleBox!.y + 70, { steps: 8 })
  await page.mouse.up()
  const widthAfter = Number(await page.getByRole("spinbutton", { name: "너비" }).inputValue())
  const heightAfter = Number(await page.getByRole("spinbutton", { name: "높이" }).inputValue())
  expect(widthAfter).toBeGreaterThan(widthBefore + 20)
  expect(heightAfter).toBeGreaterThan(heightBefore + 20)

  await page.getByLabel("라벨").fill("가입")
  await expect(instance.getByText("가입")).toBeVisible()

  await page.reload()
  await expect(page.locator("[data-canvas-instance]")).toHaveCount(1)
  await expect(page.getByText("가입").first()).toBeVisible()
  await page.locator("[data-canvas-instance]").first().click()
  await expect(page.getByRole("spinbutton", { name: "너비" })).toHaveValue(String(Math.round(widthAfter)))
  await expect(page.getByRole("spinbutton", { name: "높이" })).toHaveValue(String(Math.round(heightAfter)))
})

import { expect, test } from "@playwright/test"

test("해피패스: 단계 확정 후 최종 이미지와 새로고침 유지", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "시작하기" }).click()
  await expect(page).toHaveURL(/\/projects/)

  await page.getByRole("link", { name: "새 프로젝트" }).click()
  await page.getByLabel("프로젝트 이름").fill("E2E 핀테크 홈")
  await page.getByRole("button", { name: "만들기" }).click()

  await expect(page.getByRole("heading", { name: "E2E 핀테크 홈" })).toBeVisible()

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

  const prototypeButton = page.getByRole("button", { name: "프로토타입 생성" })
  await expect(prototypeButton).toBeEnabled()
  await prototypeButton.click()
  await expect(page.getByRole("region", { name: "최종 프로토타입" })).toBeVisible({
    timeout: 20_000,
  })
  await expect(
    page
      .getByRole("region", { name: "최종 프로토타입" })
      .getByRole("region", { name: "확정 컨셉·팔레트·와이어프레임" })
  ).toBeVisible()
  await expect(
    page.getByRole("region", { name: "최종 프로토타입" }).locator("img")
  ).toHaveCount(0)
  await expect(
    page.getByRole("region", { name: "최종 프로토타입" }).locator("h2, h3, table, form, ul").first()
  ).toBeVisible()

  await page.reload()
  await expect(page.getByRole("region", { name: "최종 프로토타입" })).toBeVisible()
})

test("컨셉만 확정하면 최종 생성이 잠긴다", async ({ page }) => {
  await page.goto("/projects/new")
  await page.getByLabel("프로젝트 이름").fill("잠금 테스트")
  await page.getByRole("button", { name: "만들기" }).click()
  await page.getByRole("radio", { name: "교육" }).click()
  await page.getByLabel("키워드").fill("차분한")
  await page.getByRole("button", { name: "추가" }).click()
  await page.getByRole("button", { name: "분야와 키워드 저장" }).click()
  await page.getByRole("button", { name: "컨셉 3안 생성" }).click()
  await expect(page.getByRole("button", { name: "이 안으로 확정" }).first()).toBeVisible({
    timeout: 20_000,
  })
  await page.getByRole("button", { name: "이 안으로 확정" }).first().click()

  await expect(page.getByRole("button", { name: "프로토타입" })).toBeDisabled()
})

import { describe, expect, it } from "vitest"
import { resolveLayoutKind } from "@/lib/ai/preview-theme"

describe("resolveLayoutKind", () => {
  it("와이어프레임 제목으로 20종 레이아웃을 고른다", () => {
    expect(resolveLayoutKind({ title: "홈 사이드바 앱" })).toBe("app")
    expect(resolveLayoutKind({ title: "홈 대시보드 지표" })).toBe("dashboard")
    expect(resolveLayoutKind({ title: "홈 카드 갤러리" })).toBe("gallery")
    expect(resolveLayoutKind({ title: "홈 히어로 우선" })).toBe("hero")
    expect(resolveLayoutKind({ title: "홈 가격 3열" })).toBe("pricing")
    expect(resolveLayoutKind({ title: "홈 월간 캘린더" })).toBe("calendar")
  })

  it("사이드바 블록이면 앱 셸이다", () => {
    expect(
      resolveLayoutKind({
        blocks: [{ id: "b1", role: "sidebar", notes: "" }],
      })
    ).toBe("app")
  })
})

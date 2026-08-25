import { describe, expect, it } from "vitest"
import { renderWireframePreview } from "@/lib/ai/wireframe-preview"

describe("renderWireframePreview", () => {
  it("컨셉 사진 경로가 아니라 SVG 와이어프레임을 반환한다", () => {
    const preview = renderWireframePreview({
      title: "홈 히어로 우선",
      prompt: "low-fidelity grayscale wireframe, hero-first landing",
      slot: 0,
      blocks: [
        { id: "nav", role: "nav", notes: "상단 내비" },
        { id: "hero", role: "hero", notes: "가치제안" },
        { id: "form", role: "form", notes: "CTA" },
        { id: "footer", role: "footer", notes: "푸터" },
      ],
    })
    expect(preview.dataUrl.startsWith("data:image/svg+xml")).toBe(true)
    expect(preview.dataUrl.includes("/stock/")).toBe(false)
    expect(decodeURIComponent(preview.dataUrl)).toContain("HERO")
  })

  it("사이드바 블록이면 앱 레이아웃을 그린다", () => {
    const preview = renderWireframePreview({
      title: "사이드바 앱",
      prompt: "sidebar",
      slot: 1,
      blocks: [
        { id: "nav", role: "nav", notes: "유틸" },
        { id: "sidebar", role: "sidebar", notes: "섹션" },
        { id: "list", role: "list", notes: "리스트" },
        { id: "content", role: "content", notes: "상세" },
      ],
    })
    const svg = decodeURIComponent(preview.dataUrl)
    expect(svg).toContain("SIDEBAR")
    expect(svg).toContain("LIST")
  })

  it("가격·대시보드·온보딩 프롬프트는 서로 다른 레이아웃을 그린다", () => {
    const pricing = decodeURIComponent(
      renderWireframePreview({ title: "가격 3열", prompt: "pricing three-column", slot: 4 }).dataUrl
    )
    const dashboard = decodeURIComponent(
      renderWireframePreview({ title: "대시보드 지표", prompt: "dashboard metrics", slot: 5 }).dataUrl
    )
    const onboard = decodeURIComponent(
      renderWireframePreview({ title: "중앙 온보딩", prompt: "centered onboarding form", slot: 6 }).dataUrl
    )
    expect(pricing).toContain("PLAN")
    expect(dashboard).toContain("KPI")
    expect(onboard).toContain("FORM")
    expect(pricing).not.toContain("KPI")
    expect(dashboard).not.toContain("PLAN")
  })

  it("칸반·비디오·인박스 프롬프트는 서로 다른 레이아웃을 그린다", () => {
    const kanban = decodeURIComponent(
      renderWireframePreview({ title: "칸반 보드", prompt: "kanban board columns", slot: 10 }).dataUrl
    )
    const video = decodeURIComponent(
      renderWireframePreview({ title: "비디오 시청", prompt: "video-player watch", slot: 15 }).dataUrl
    )
    const inbox = decodeURIComponent(
      renderWireframePreview({ title: "인박스", prompt: "inbox mail thread", slot: 19 }).dataUrl
    )
    expect(kanban).toContain("COL")
    expect(video).toContain("PLAYER")
    expect(inbox).toContain("MAIL")
    expect(kanban).not.toContain("PLAYER")
    expect(video).not.toContain("MAIL")
  })
})

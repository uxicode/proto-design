import type { Project } from "@/types/domain"

export function makeCommittedProject(overrides: Partial<Project> = {}): Project {
  const timestamp = "2026-08-24T00:00:00.000Z"
  return {
    id: "p-canvas",
    name: "캔버스",
    domainKey: "fintech",
    domainCustom: null,
    keywords: ["신뢰", "대시보드"],
    briefVersion: 1,
    currentStep: "prototype",
    concepts: [
      {
        id: "c1",
        generationId: "g1",
        title: "신뢰 대시보드",
        summary: "열 글자가 넘는 컨셉 요약입니다.",
        visualHints: ["대비"],
        status: "committed",
        committedAt: timestamp,
      },
    ],
    palettes: [
      {
        id: "pal1",
        generationId: "g2",
        sourceConceptId: "c1",
        name: "세이지",
        swatches: [
          { role: "primary", hex: "#2F5D50" },
          { role: "secondary", hex: "#7A9E8F" },
          { role: "background", hex: "#F7F6F2" },
          { role: "text", hex: "#1C241F" },
          { role: "accent", hex: "#D4A017" },
        ],
        status: "committed",
        committedAt: timestamp,
      },
    ],
    wireframes: [
      {
        id: "w1",
        generationId: "g3",
        sourceConceptId: "c1",
        sourcePaletteId: "pal1",
        title: "앱 셸",
        structureNotes: "사이드바와 본문",
        blocks: [{ id: "b1", role: "sidebar", notes: "" }],
        status: "committed",
        committedAt: timestamp,
      },
    ],
    componentSets: [
      {
        id: "cs1",
        generationId: "g4",
        sourceConceptId: "c1",
        sourcePaletteId: "pal1",
        sourceWireframeId: "w1",
        title: "솔리드 키트",
        items: [{ role: "button", variant: "solid", notes: "" }],
        status: "committed",
        committedAt: timestamp,
      },
    ],
    prototype: null,
    canvasInstances: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  }
}

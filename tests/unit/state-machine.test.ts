import { describe, expect, it } from "vitest"
import {
  applyBriefChange,
  canGenerate,
  commitArtifact,
  deriveCurrentStep,
} from "@/lib/generation/state-machine"
import type { Concept, Project } from "@/types/domain"

function baseProject(overrides: Partial<Project> = {}): Project {
  const timestamp = "2026-08-24T00:00:00.000Z"
  return {
    id: "p1",
    name: "테스트",
    domainKey: "fintech",
    domainCustom: null,
    keywords: ["신뢰", "대시보드"],
    briefVersion: 1,
    currentStep: "concept",
    concepts: [],
    palettes: [],
    wireframes: [],
    componentSets: [],
    prototype: null,
    canvasInstances: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  }
}

function concept(id: string, status: Concept["status"]): Concept {
  return {
    id,
    generationId: "g1",
    title: `컨셉 ${id}`,
    summary: "열 글자가 넘는 요약 텍스트입니다.",
    visualHints: ["힌트"],
    status,
    committedAt: status === "committed" ? "2026-08-24T00:00:00.000Z" : undefined,
  }
}

describe("canGenerate", () => {
  it("키워드가 없으면 컨셉 생성을 막는다", () => {
    const project = baseProject({ keywords: [], domainKey: "fintech" })
    const result = canGenerate(project, "concept")
    expect(result.ok).toBe(false)
    expect(result.code).toBe("VALIDATION_ERROR")
  })

  it("컨셉 미확정 시 팔레트를 잠근다", () => {
    const result = canGenerate(baseProject(), "palette")
    expect(result.ok).toBe(false)
    expect(result.code).toBe("STEP_LOCKED")
  })

  it("중간 단계 없이 최종 이미지를 막는다", () => {
    const result = canGenerate(baseProject(), "prototype")
    expect(result.ok).toBe(false)
    expect(result.code).toBe("STEP_LOCKED")
  })
})

describe("commitArtifact", () => {
  it("확정은 단계당 1개이고 이전 확정은 superseded가 된다", () => {
    const project = baseProject({
      concepts: [concept("a", "candidate"), concept("b", "candidate")],
    })
    const first = commitArtifact(project, "concept", "a")
    expect(first.concepts.find((item) => item.id === "a")?.status).toBe("committed")
    const withNew = {
      ...first,
      concepts: [...first.concepts, concept("c", "candidate")],
    }
    const second = commitArtifact(withNew, "concept", "c")
    expect(second.concepts.find((item) => item.id === "c")?.status).toBe("committed")
    expect(second.concepts.find((item) => item.id === "a")?.status).toBe("superseded")
    expect(second.concepts.filter((item) => item.status === "committed")).toHaveLength(1)
  })

  it("재확정하면 이후 단계를 stale 처리한다", () => {
    let project = baseProject({
      concepts: [concept("a", "candidate")],
    })
    project = commitArtifact(project, "concept", "a")
    project = {
      ...project,
      palettes: [
        {
          id: "pal1",
          generationId: "g2",
          sourceConceptId: "a",
          name: "잉크",
          swatches: [
            { role: "primary", hex: "#111111" },
            { role: "secondary", hex: "#222222" },
            { role: "background", hex: "#FFFFFF" },
            { role: "text", hex: "#000000" },
            { role: "accent", hex: "#FF0000" },
          ],
          status: "candidate",
        },
      ],
    }
    project = commitArtifact(project, "palette", "pal1")
    expect(project.palettes[0].status).toBe("committed")

    project = {
      ...project,
      concepts: [...project.concepts, concept("b", "candidate")],
    }
    project = commitArtifact(project, "concept", "b")
    expect(project.palettes[0].status).toBe("stale")
    expect(canGenerate(project, "prototype").ok).toBe(false)
  })

  it("이전 stale 후보가 남아도 네 단계가 다시 확정되면 최종 생성이 열린다", () => {
    const swatches = [
      { role: "primary" as const, hex: "#111111" },
      { role: "secondary" as const, hex: "#222222" },
      { role: "background" as const, hex: "#FFFFFF" },
      { role: "text" as const, hex: "#000000" },
      { role: "accent" as const, hex: "#FF0000" },
    ]
    const project = baseProject({
      concepts: [concept("c-old", "stale"), concept("c-new", "committed")],
      palettes: [
        {
          id: "p-old",
          generationId: "g2",
          sourceConceptId: "c-old",
          name: "이전",
          swatches,
          status: "stale",
        },
        {
          id: "p-new",
          generationId: "g3",
          sourceConceptId: "c-new",
          name: "현재",
          swatches,
          status: "committed",
          committedAt: "2026-08-24T00:00:00.000Z",
        },
      ],
      wireframes: [
        {
          id: "w1",
          generationId: "g4",
          sourceConceptId: "c-new",
          sourcePaletteId: "p-new",
          title: "홈 히어로",
          structureNotes: "상단 히어로와 폼 구조입니다.",
          blocks: [
            { id: "nav", role: "nav", notes: "내비" },
            { id: "hero", role: "hero", notes: "히어로" },
            { id: "footer", role: "footer", notes: "푸터" },
          ],
          status: "committed",
          committedAt: "2026-08-24T00:00:00.000Z",
        },
      ],
      componentSets: [
        {
          id: "cs1",
          generationId: "g5",
          sourceConceptId: "c-new",
          sourcePaletteId: "p-new",
          sourceWireframeId: "w1",
          title: "솔리드",
          items: [
            { role: "button", variant: "filled", notes: "버튼" },
            { role: "input", variant: "underline", notes: "입력" },
            { role: "card", variant: "elevated", notes: "카드" },
            { role: "navigation", variant: "horizontal", notes: "내비" },
          ],
          status: "committed",
          committedAt: "2026-08-24T00:00:00.000Z",
        },
      ],
    })
    expect(canGenerate(project, "prototype").ok).toBe(true)
  })
})

describe("applyBriefChange", () => {
  it("브리프가 바뀌면 이후 단계가 stale이 되고 이전 행은 남는다", () => {
    let project = baseProject({
      concepts: [concept("a", "candidate")],
    })
    project = commitArtifact(project, "concept", "a")
    const next = applyBriefChange(project, {
      domainKey: "healthcare",
      domainCustom: null,
      keywords: ["차분한"],
    })
    expect(next.briefVersion).toBe(project.briefVersion + 1)
    expect(next.concepts[0].status).toBe("stale")
    expect(next.concepts[0].id).toBe("a")
    expect(deriveCurrentStep(next)).toBe("concept")
    expect(canGenerate(next, "palette").ok).toBe(false)
  })
})

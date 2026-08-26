import { describe, expect, it } from "vitest"
import { buildInputSnapshot } from "@/lib/generation/context-builder"
import { commitArtifact } from "@/lib/generation/state-machine"
import type { Concept, Palette, Project } from "@/types/domain"

function projectWithConcept(): Project {
  const timestamp = "2026-08-24T00:00:00.000Z"
  const concept: Concept = {
    id: "c1",
    generationId: "g1",
    title: "선명",
    summary: "열 글자가 넘는 컨셉 요약입니다.",
    visualHints: ["대비"],
    status: "candidate",
  }
  let project: Project = {
    id: "p1",
    name: "테스트",
    domainKey: "education",
    domainCustom: null,
    keywords: ["따뜻한"],
    briefVersion: 1,
    currentStep: "concept",
    concepts: [concept],
    palettes: [],
    wireframes: [],
    componentSets: [],
    prototype: null,
    canvasInstances: [],
    canvasSlots: {},
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  project = commitArtifact(project, "concept", "c1")
  const palette: Palette = {
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
    status: "candidate",
  }
  project = { ...project, palettes: [palette] }
  return commitArtifact(project, "palette", "pal1")
}

describe("buildInputSnapshot", () => {
  it("팔레트 단계에 와이어프레임을 넣지 않는다", () => {
    const snapshot = buildInputSnapshot(projectWithConcept(), "palette")
    expect(snapshot.committedConcept?.title).toBe("선명")
    expect(snapshot.committedWireframe).toBeUndefined()
    expect(snapshot.committedComponentSet).toBeUndefined()
  })

  it("컨셉 단계에는 확정 팔레트를 넣지 않는다", () => {
    const snapshot = buildInputSnapshot(projectWithConcept(), "concept")
    expect(snapshot.committedConcept).toBeUndefined()
    expect(snapshot.committedPalette).toBeUndefined()
    expect(snapshot.keywords).toEqual(["따뜻한"])
    expect(snapshot.entropy).toBeTruthy()
    expect(snapshot.avoidTitles).toContain("선명")
  })
})

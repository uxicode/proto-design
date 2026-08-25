import { ARTIFACT_STATUS, type ArtifactStatus, type Project } from "@/types/domain"
import { canGenerate, getCommittedArtifact, getStepArtifacts } from "@/lib/generation/state-machine"
import type { GenerationStep } from "@/types/domain"

const STEP_LABELS: Record<Exclude<GenerationStep, "prototype">, string> = {
  concept: "컨셉",
  palette: "팔레트",
  wireframe: "와이어프레임",
  components: "컴포넌트",
}

export function isCanvasEditable(project: Project): boolean {
  return canGenerate(project, "prototype").ok
}

export function canvasLockMessage(project: Project): string {
  const required: Exclude<GenerationStep, "prototype">[] = [
    "concept",
    "palette",
    "wireframe",
    "components",
  ]
  const missing = required.filter((step) => !getCommittedArtifact(getStepArtifacts(project, step)))
  if (missing.length === 0) return ""
  const staleSteps = missing.filter((step) =>
    getStepArtifacts(project, step).some((item) => item.status === ARTIFACT_STATUS.stale)
  )
  if (staleSteps.length > 0) {
    return `${staleSteps.map((step) => STEP_LABELS[step]).join(", ")} 단계가 오래되었습니다. 다시 확정하세요.`
  }
  return `${missing.map((step) => STEP_LABELS[step]).join(", ")}을(를) 먼저 확정하세요.`
}

export function getDisplayArtifact<T extends { status: ArtifactStatus }>(
  artifacts: T[]
): T | undefined {
  const committed = artifacts.find((item) => item.status === ARTIFACT_STATUS.committed)
  if (committed) return committed
  for (let index = artifacts.length - 1; index >= 0; index -= 1) {
    if (artifacts[index].status === ARTIFACT_STATUS.stale) return artifacts[index]
  }
  return undefined
}

export function canRenderCanvasMock(project: Project): boolean {
  return Boolean(
    getDisplayArtifact(project.concepts) &&
      getDisplayArtifact(project.palettes) &&
      getDisplayArtifact(project.wireframes) &&
      getDisplayArtifact(project.componentSets)
  )
}

export function isSafeHttpUrl(value: string): boolean {
  if (!value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

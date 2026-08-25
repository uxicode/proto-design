import {
  ARTIFACT_STATUS,
  ERROR_CODES,
  GENERATION_STEPS,
  PROJECT_STEPS,
  type ArtifactStatus,
  type BriefInput,
  type ComponentSet,
  type Concept,
  type GenerationStep,
  type Palette,
  type Project,
  type ProjectStep,
  type Wireframe,
} from "@/types/domain"

export const STEP_ORDER: ProjectStep[] = [
  PROJECT_STEPS.input,
  PROJECT_STEPS.concept,
  PROJECT_STEPS.palette,
  PROJECT_STEPS.wireframe,
  PROJECT_STEPS.components,
  PROJECT_STEPS.prototype,
]

export interface GuardResult {
  ok: boolean
  code?: typeof ERROR_CODES.STEP_LOCKED | typeof ERROR_CODES.STEP_STALE | typeof ERROR_CODES.VALIDATION_ERROR
  message?: string
}

type StepArtifact = Concept | Palette | Wireframe | ComponentSet

export function isBriefComplete(project: Pick<Project, "domainKey" | "keywords" | "domainCustom">): boolean {
  if (!project.domainKey) return false
  if (project.domainKey === "other" && !project.domainCustom?.trim()) return false
  return project.keywords.length >= 1
}

export function getStepArtifacts(project: Project, step: GenerationStep): StepArtifact[] {
  if (step === "concept") return project.concepts
  if (step === "palette") return project.palettes
  if (step === "wireframe") return project.wireframes
  if (step === "components") return project.componentSets
  return []
}

export function getCommittedArtifact<T extends StepArtifact>(
  artifacts: T[]
): T | undefined {
  return artifacts.find((item) => item.status === ARTIFACT_STATUS.committed)
}

export function hasCommitted(project: Project, step: Exclude<GenerationStep, "prototype">): boolean {
  return Boolean(getCommittedArtifact(getStepArtifacts(project, step)))
}

export function laterGenerationSteps(step: GenerationStep): GenerationStep[] {
  const index = GENERATION_STEPS.indexOf(step)
  return GENERATION_STEPS.slice(index + 1)
}

export function deriveCurrentStep(project: Project): ProjectStep {
  if (!isBriefComplete(project)) return PROJECT_STEPS.input
  if (!hasCommitted(project, "concept")) return PROJECT_STEPS.concept
  if (!hasCommitted(project, "palette")) return PROJECT_STEPS.palette
  if (!hasCommitted(project, "wireframe")) return PROJECT_STEPS.wireframe
  if (!hasCommitted(project, "components")) return PROJECT_STEPS.components
  return PROJECT_STEPS.prototype
}

export function hasStaleArtifacts(project: Project): boolean {
  const steps: Exclude<GenerationStep, "prototype">[] = [
    "concept",
    "palette",
    "wireframe",
    "components",
  ]
  return steps.some((step) => {
    const artifacts = getStepArtifacts(project, step)
    const hasStale = artifacts.some((item) => item.status === ARTIFACT_STATUS.stale)
    return hasStale && !hasCommitted(project, step)
  })
}

export function canGenerate(project: Project, step: GenerationStep): GuardResult {
  if (step === "concept") {
    if (!isBriefComplete(project)) {
      return {
        ok: false,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "분야와 키워드를 먼저 저장해 주세요.",
      }
    }
    return { ok: true }
  }

  if (step === "palette") {
    if (!hasCommitted(project, "concept")) {
      return {
        ok: false,
        code: ERROR_CODES.STEP_LOCKED,
        message: "컨셉을 먼저 확정하세요.",
      }
    }
    return { ok: true }
  }

  if (step === "wireframe") {
    if (!hasCommitted(project, "palette")) {
      return {
        ok: false,
        code: ERROR_CODES.STEP_LOCKED,
        message: "컬러 팔레트를 먼저 확정하세요.",
      }
    }
    return { ok: true }
  }

  if (step === "components") {
    if (!hasCommitted(project, "wireframe")) {
      return {
        ok: false,
        code: ERROR_CODES.STEP_LOCKED,
        message: "와이어프레임을 먼저 확정하세요.",
      }
    }
    return { ok: true }
  }

  const required: Exclude<GenerationStep, "prototype">[] = [
    "concept",
    "palette",
    "wireframe",
    "components",
  ]
  const missing = required.filter((item) => !hasCommitted(project, item))
  if (missing.length > 0) {
    const blockedByStale = missing.some((step) =>
      getStepArtifacts(project, step).some((item) => item.status === ARTIFACT_STATUS.stale)
    )
    return {
      ok: false,
      code: blockedByStale ? ERROR_CODES.STEP_STALE : ERROR_CODES.STEP_LOCKED,
      message: blockedByStale
        ? "이후 단계를 다시 확정하세요."
        : "중간 네 단계를 모두 확정한 뒤에만 최종 이미지를 만들 수 있습니다.",
    }
  }
  return { ok: true }
}

function markLaterStale(project: Project, fromStep: GenerationStep): Project {
  const later = laterGenerationSteps(fromStep)
  let next: Project = { ...project }

  if (later.includes("concept")) {
    next = { ...next, concepts: markListStale(next.concepts) }
  }
  if (later.includes("palette")) {
    next = { ...next, palettes: markListStale(next.palettes) }
  }
  if (later.includes("wireframe")) {
    next = { ...next, wireframes: markListStale(next.wireframes) }
  }
  if (later.includes("components")) {
    next = { ...next, componentSets: markListStale(next.componentSets) }
  }

  return next
}

function markListStale<T extends StepArtifact>(items: T[]): T[] {
  return items.map((item) => {
    if (
      item.status === ARTIFACT_STATUS.committed ||
      item.status === ARTIFACT_STATUS.candidate
    ) {
      return { ...item, status: ARTIFACT_STATUS.stale, committedAt: undefined }
    }
    return item
  })
}

export function commitArtifact(
  project: Project,
  step: Exclude<GenerationStep, "prototype">,
  artifactId: string
): Project {
  const artifacts = getStepArtifacts(project, step)
  const target = artifacts.find((item) => item.id === artifactId)

  if (!target) {
    throw new Error("대상을 찾을 수 없습니다.")
  }
  if (target.status !== ARTIFACT_STATUS.candidate) {
    throw new Error("후보만 확정할 수 있습니다.")
  }

  const committedAt = new Date().toISOString()
  const updated = artifacts.map((item) => {
    if (item.id === artifactId) {
      return {
        ...item,
        status: ARTIFACT_STATUS.committed,
        committedAt,
      }
    }
    if (item.status === ARTIFACT_STATUS.committed) {
      return { ...item, status: ARTIFACT_STATUS.superseded, committedAt: undefined }
    }
    return item
  })

  let next: Project = { ...project, updatedAt: committedAt }
  if (step === "concept") next = { ...next, concepts: updated as Concept[] }
  if (step === "palette") next = { ...next, palettes: updated as Palette[] }
  if (step === "wireframe") next = { ...next, wireframes: updated as Wireframe[] }
  if (step === "components") {
    next = { ...next, componentSets: updated as ComponentSet[] }
  }

  next = markLaterStale(next, step)
  next = { ...next, currentStep: deriveCurrentStep(next) }
  return next
}

function isSameBrief(project: Project, brief: BriefInput): boolean {
  const currentCustom = project.domainCustom?.trim() ?? null
  const nextCustom =
    brief.domainKey === "other" ? brief.domainCustom?.trim() ?? null : null
  if (project.domainKey !== brief.domainKey) return false
  if (currentCustom !== nextCustom) return false
  if (project.keywords.length !== brief.keywords.length) return false
  return project.keywords.every((word, index) => word === brief.keywords[index])
}

export function applyBriefChange(project: Project, brief: BriefInput): Project {
  if (isSameBrief(project, brief)) {
    return {
      ...project,
      domainKey: brief.domainKey,
      domainCustom: brief.domainKey === "other" ? brief.domainCustom : null,
      keywords: brief.keywords,
    }
  }

  const updatedAt = new Date().toISOString()
  const next: Project = {
    ...project,
    domainKey: brief.domainKey,
    domainCustom: brief.domainKey === "other" ? brief.domainCustom : null,
    keywords: brief.keywords,
    briefVersion: project.briefVersion + 1,
    concepts: markListStale(project.concepts),
    palettes: markListStale(project.palettes),
    wireframes: markListStale(project.wireframes),
    componentSets: markListStale(project.componentSets),
    updatedAt,
  }

  return { ...next, currentStep: deriveCurrentStep(next) }
}

export function replaceCandidates<T extends StepArtifact>(
  existing: T[],
  incoming: T[]
): T[] {
  const kept = existing.filter(
    (item) =>
      item.status === ARTIFACT_STATUS.committed ||
      item.status === ARTIFACT_STATUS.superseded ||
      item.status === ARTIFACT_STATUS.stale
  )
  return [...kept, ...incoming]
}

export function stripHeavyPreviews<T extends StepArtifact>(items: T[]): T[] {
  return items.map((item) => {
    if (
      item.status === ARTIFACT_STATUS.stale ||
      item.status === ARTIFACT_STATUS.superseded
    ) {
      if ("visualPreviewUrl" in item) {
        return { ...item, visualPreviewUrl: undefined }
      }
      if ("layoutPreviewUrl" in item) {
        return { ...item, layoutPreviewUrl: undefined }
      }
      if ("previewUrl" in item) {
        return { ...item, previewUrl: undefined }
      }
    }
    return item
  })
}

export function getStepStatus(
  project: Project,
  step: ProjectStep
): "complete" | "current" | "locked" | "stale" {
  const current = deriveCurrentStep(project)
  if (step === PROJECT_STEPS.input) {
    if (isBriefComplete(project)) return "complete"
    return "current"
  }

  if (step === PROJECT_STEPS.prototype) {
    if (canGenerate(project, "prototype").ok) {
      return project.prototype ? "complete" : "current"
    }
    if (hasStaleArtifacts(project) && isBriefComplete(project)) return "stale"
    return "locked"
  }

  const artifacts = getStepArtifacts(project, step)
  if (artifacts.some((item) => item.status === ARTIFACT_STATUS.stale) && !hasCommitted(project, step)) {
    if (STEP_ORDER.indexOf(step) <= STEP_ORDER.indexOf(current)) return "stale"
    return "stale"
  }
  if (hasCommitted(project, step as Exclude<GenerationStep, "prototype">)) {
    return "complete"
  }
  if (step === current) return "current"
  if (STEP_ORDER.indexOf(step) < STEP_ORDER.indexOf(current)) return "current"
  return "locked"
}

export function isLockedStep(project: Project, step: ProjectStep): boolean {
  return getStepStatus(project, step) === "locked"
}

export type { ArtifactStatus }

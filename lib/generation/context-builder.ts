import { getDomainLabel } from "@/lib/config/domains"
import {
  canGenerate,
  getCommittedArtifact,
} from "@/lib/generation/state-machine"
import { ERROR_CODES, type GenerationStep, type InputSnapshot, type Project } from "@/types/domain"
import { AppError, errorStatus } from "@/lib/errors"

export function buildInputSnapshot(
  project: Project,
  step: GenerationStep
): InputSnapshot {
  if (!project.domainKey) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "분야를 먼저 저장해 주세요.",
      errorStatus(ERROR_CODES.VALIDATION_ERROR)
    )
  }

  const snapshot: InputSnapshot = {
    projectId: project.id,
    briefVersion: project.briefVersion,
    domainKey: project.domainKey,
    domainLabel: getDomainLabel(project.domainKey, project.domainCustom),
    keywords: project.keywords,
    entropy: crypto.randomUUID(),
    avoidTitles: Array.from(new Set(project.concepts.map((item) => item.title))),
  }

  const concept = getCommittedArtifact(project.concepts)
  const palette = getCommittedArtifact(project.palettes)
  const wireframe = getCommittedArtifact(project.wireframes)
  const componentSet = getCommittedArtifact(project.componentSets)

  if (step !== "concept" && concept) {
    snapshot.committedConcept = {
      id: concept.id,
      title: concept.title,
      summary: concept.summary,
      visualHints: concept.visualHints,
      status: concept.status,
    }
  }

  if (
    (step === "wireframe" || step === "components" || step === "prototype") &&
    palette
  ) {
    snapshot.committedPalette = {
      id: palette.id,
      name: palette.name,
      swatches: palette.swatches,
      status: palette.status,
    }
  }

  if ((step === "components" || step === "prototype") && wireframe) {
    snapshot.committedWireframe = {
      id: wireframe.id,
      title: wireframe.title,
      structureNotes: wireframe.structureNotes,
      blocks: wireframe.blocks,
      status: wireframe.status,
    }
  }

  if (step === "prototype" && componentSet) {
    snapshot.committedComponentSet = {
      id: componentSet.id,
      title: componentSet.title,
      items: componentSet.items,
      status: componentSet.status,
    }
  }

  return snapshot
}

export function assertCanBuildSnapshot(project: Project, step: GenerationStep): void {
  const guard = canGenerate(project, step)
  if (!guard.ok) {
    throw new AppError(
      guard.code ?? ERROR_CODES.STEP_LOCKED,
      guard.message ?? "이 단계는 아직 잠겨 있습니다.",
      errorStatus(guard.code ?? ERROR_CODES.STEP_LOCKED)
    )
  }
}

export function assertSnapshotForStep(snapshot: InputSnapshot, step: GenerationStep): void {
  function rejectIfStale(status: string | undefined, label: string): void {
    if (status === "stale") {
      throw new AppError(
        ERROR_CODES.STEP_STALE,
        `${label}가 오래되었습니다. 이후 단계를 다시 확정하세요.`,
        errorStatus(ERROR_CODES.STEP_STALE)
      )
    }
  }

  if (step === "concept") return

  if (!snapshot.committedConcept) {
    throw new AppError(
      ERROR_CODES.STEP_LOCKED,
      "컨셉을 먼저 확정하세요.",
      errorStatus(ERROR_CODES.STEP_LOCKED)
    )
  }
  rejectIfStale(snapshot.committedConcept.status, "컨셉")

  if (step === "palette") return

  if (!snapshot.committedPalette) {
    throw new AppError(
      ERROR_CODES.STEP_LOCKED,
      "컬러 팔레트를 먼저 확정하세요.",
      errorStatus(ERROR_CODES.STEP_LOCKED)
    )
  }
  rejectIfStale(snapshot.committedPalette.status, "팔레트")

  if (step === "wireframe") return

  if (!snapshot.committedWireframe) {
    throw new AppError(
      ERROR_CODES.STEP_LOCKED,
      "와이어프레임을 먼저 확정하세요.",
      errorStatus(ERROR_CODES.STEP_LOCKED)
    )
  }
  rejectIfStale(snapshot.committedWireframe.status, "와이어프레임")

  if (step === "components") return

  if (!snapshot.committedComponentSet) {
    throw new AppError(
      ERROR_CODES.STEP_LOCKED,
      "컴포넌트 세트를 먼저 확정하세요.",
      errorStatus(ERROR_CODES.STEP_LOCKED)
    )
  }
  rejectIfStale(snapshot.committedComponentSet.status, "컴포넌트")
}

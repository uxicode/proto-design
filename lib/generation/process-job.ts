import { getImageAdapter, getTextAdapter } from "@/lib/ai"
import { pickUniqueStockPaths } from "@/lib/stock/pick"
import { STEP_TIMEOUT_MS } from "@/lib/config/timeouts"
import { AppError } from "@/lib/errors"
import { logEvent } from "@/lib/logging"
import {
  componentSetSchema,
  conceptSetSchema,
  paletteSetSchema,
  wireframeSetSchema,
} from "@/lib/generation/schemas"
import {
  casToRunning,
  completeJob,
  getJob,
  isTimedOut,
  type GenerationArtifactPayload,
} from "@/lib/generation/job-store"
import {
  ERROR_CODES,
  GENERATION_STATUS,
  type ComponentSet,
  type Concept,
  type GenerationStep,
  type InputSnapshot,
  type Palette,
  type PrototypeAsset,
  type Wireframe,
} from "@/types/domain"

function newId(): string {
  return crypto.randomUUID()
}

export async function processGenerationJob(id: string): Promise<void> {
  const queued = getJob(id)
  if (!queued) return
  if (isTimedOut(queued)) {
    completeJob(id, {
      status: GENERATION_STATUS.failed,
      errorCode: ERROR_CODES.GENERATION_TIMEOUT,
      errorMessageUser: "생성 시간이 초과되었습니다. 다시 시도해 주세요.",
    })
    logEvent({ event: "generation.timeout", generationId: id, step: queued.step })
    return
  }

  const job = casToRunning(id)
  if (!job) return

  logEvent({
    event: "generation.started",
    generationId: id,
    projectId: job.projectId,
    step: job.step,
  })

  const started = Date.now()
  const timeoutMs = STEP_TIMEOUT_MS[job.step]
  const remaining = Math.max(1_000, timeoutMs - (Date.now() - started))
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), remaining)

  try {
    const artifacts = await runStep(
      job.step,
      job.inputSnapshot,
      job.id,
      controller.signal
    )
    completeJob(id, {
      status: GENERATION_STATUS.succeeded,
      artifacts,
    })
    logEvent({
      event: "generation.succeeded",
      generationId: id,
      step: job.step,
      latencyMs: Date.now() - started,
    })
  } catch (error) {
    const aborted = controller.signal.aborted
    const isApp = error instanceof AppError
    const code = aborted
      ? ERROR_CODES.GENERATION_TIMEOUT
      : isApp
        ? error.code
        : ERROR_CODES.GENERATION_FAILED
    const message = aborted
      ? "생성 시간이 초과되었습니다. 다시 시도해 주세요."
      : isApp
        ? error.message
        : "생성에 실패했습니다. 다시 시도해 주세요."

    completeJob(id, {
      status: GENERATION_STATUS.failed,
      errorCode: code,
      errorMessageUser: message,
    })
    logEvent({
      event: aborted ? "generation.timeout" : "generation.failed",
      generationId: id,
      step: job.step,
      code,
    })
  } finally {
    clearTimeout(timer)
  }
}

async function runStep(
  step: GenerationStep,
  snapshot: InputSnapshot,
  generationId: string,
  signal: AbortSignal
): Promise<GenerationArtifactPayload> {
  const text = getTextAdapter()
  const image = getImageAdapter()

  if (step === "concept") {
    const parsed = conceptSetSchema.parse(await text.generateConceptSet(snapshot))
    const paths = pickUniqueStockPaths({
      domainKey: snapshot.domainKey,
      step: "concept",
      entropy: snapshot.entropy,
      salts: parsed.candidates.map((candidate) => candidate.title),
    })
    const concepts: Concept[] = parsed.candidates.map((candidate, slot) => ({
      id: newId(),
      generationId,
      title: candidate.title,
      summary: candidate.summary,
      visualHints: candidate.visualHints,
      visualPreviewUrl: paths[slot],
      status: "candidate",
    }))
    return { concepts }
  }

  if (step === "palette") {
    const parsed = paletteSetSchema.parse(await text.generatePaletteSet(snapshot))
    const palettes: Palette[] = parsed.candidates.map((candidate) => ({
      id: newId(),
      generationId,
      sourceConceptId: snapshot.committedConcept!.id,
      name: candidate.name,
      swatches: candidate.swatches,
      status: "candidate",
    }))
    return { palettes }
  }

  if (step === "wireframe") {
    const parsed = wireframeSetSchema.parse(await text.generateWireframeSet(snapshot))
    const wireframes: Wireframe[] = await Promise.all(
      parsed.candidates.map(async (candidate, slot) => {
        const preview = await image.generateWireframePreview(
          {
            snapshot,
            prompt: candidate.layoutPrompt,
            slot,
            step: "wireframe",
            title: candidate.title,
            blocks: candidate.blocks,
          },
          signal
        )
        return {
          id: newId(),
          generationId,
          sourceConceptId: snapshot.committedConcept!.id,
          sourcePaletteId: snapshot.committedPalette!.id,
          title: candidate.title,
          structureNotes: candidate.structureNotes,
          blocks: candidate.blocks,
          layoutPreviewUrl: preview.dataUrl,
          status: "candidate" as const,
        }
      })
    )
    return { wireframes }
  }

  if (step === "components") {
    const parsed = componentSetSchema.parse(await text.generateComponentSet(snapshot))
    const componentSets: ComponentSet[] = await Promise.all(
      parsed.candidates.map(async (candidate, slot) => {
        const preview = await image.generateComponentPreview(
          {
            snapshot,
            prompt: candidate.previewPrompt,
            slot,
            step: "components",
            title: candidate.title,
            items: candidate.items,
          },
          signal
        )
        return {
          id: newId(),
          generationId,
          sourceConceptId: snapshot.committedConcept!.id,
          sourcePaletteId: snapshot.committedPalette!.id,
          sourceWireframeId: snapshot.committedWireframe!.id,
          title: candidate.title,
          items: candidate.items,
          previewUrl: preview.dataUrl,
          status: "candidate" as const,
        }
      })
    )
    return { componentSets }
  }

  const swatches = snapshot.committedPalette?.swatches
    .map((item) => `${item.role} ${item.hex}`)
    .join(", ")
  const prompt = [
    "한 장의 데스크톱 UI 화면.",
    `분야: ${snapshot.domainLabel}`,
    `키워드: ${snapshot.keywords.join(", ")}`,
    `컨셉: ${snapshot.committedConcept?.title} — ${snapshot.committedConcept?.summary}`,
    `팔레트: ${swatches}`,
    `레이아웃: ${snapshot.committedWireframe?.title}. ${snapshot.committedWireframe?.structureNotes}`,
    `컴포넌트: ${snapshot.committedComponentSet?.title}`,
    "확정과 모순되는 새 컨셉이나 색을 만들지 마세요.",
  ].join("\n")

  const imageBlob = await image.generatePrototype(
    {
      snapshot,
      prompt,
      slot: 0,
      step: "prototype",
    },
    signal
  )
  const prototype: PrototypeAsset = {
    id: newId(),
    generationId,
    imageUrl: imageBlob.dataUrl,
    width: imageBlob.width,
    height: imageBlob.height,
    snapshot: {
      conceptId: snapshot.committedConcept!.id,
      paletteId: snapshot.committedPalette!.id,
      wireframeId: snapshot.committedWireframe!.id,
      componentSetId: snapshot.committedComponentSet!.id,
      domainKey: snapshot.domainKey,
      keywords: snapshot.keywords,
      briefVersion: snapshot.briefVersion,
    },
    createdAt: new Date().toISOString(),
  }
  return { prototype }
}

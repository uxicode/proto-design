import { STEP_TIMEOUT_MS } from "@/lib/config/timeouts"
import { AppError, errorStatus, toErrorBody } from "@/lib/errors"
import { logEvent } from "@/lib/logging"
import { assertSafeText, snapshotToSafetyText } from "@/lib/ai/safety"
import { assertSnapshotForStep } from "@/lib/generation/context-builder"
import { processGenerationJob } from "@/lib/generation/process-job"
import { generationRequestSchema } from "@/lib/generation/schemas"
import {
  createQueuedJob,
  getInflightJob,
  getJob,
  getJobByIdempotency,
  toPollPayload,
} from "@/lib/generation/job-store"
import { ERROR_CODES, GENERATION_STATUS } from "@/types/domain"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: Request): Promise<Response> {
  try {
    const json = await request.json()
    const parsed = generationRequestSchema.safeParse(json)
    if (!parsed.success) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "요청 형식이 올바르지 않습니다.",
        errorStatus(ERROR_CODES.VALIDATION_ERROR)
      )
    }

    const { projectId, step, idempotencyKey, inputSnapshot } = parsed.data

    const replay = getJobByIdempotency(idempotencyKey)
    if (replay) {
      return Response.json(
        { generationId: replay.id, status: replay.status },
        { status: 202 }
      )
    }

    if (
      inputSnapshot.projectId !== projectId ||
      inputSnapshot.keywords.length < 1
    ) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "분야와 키워드를 확인해 주세요.",
        errorStatus(ERROR_CODES.VALIDATION_ERROR)
      )
    }

    assertSafeText(
      snapshotToSafetyText({
        domainLabel: inputSnapshot.domainLabel,
        keywords: inputSnapshot.keywords,
      })
    )
    assertSnapshotForStep(inputSnapshot, step)

    const inflight = getInflightJob(projectId, step)
    if (
      inflight &&
      (inflight.status === GENERATION_STATUS.queued ||
        inflight.status === GENERATION_STATUS.running)
    ) {
      throw new AppError(
        ERROR_CODES.GENERATION_IN_FLIGHT,
        "이 단계는 이미 생성 중입니다.",
        errorStatus(ERROR_CODES.GENERATION_IN_FLIGHT)
      )
    }

    const generationId = crypto.randomUUID()
    const timeoutAt = new Date(Date.now() + STEP_TIMEOUT_MS[step]).toISOString()
    const job = createQueuedJob({
      id: generationId,
      projectId,
      step,
      idempotencyKey,
      inputSnapshot,
      timeoutAt,
    })

    logEvent({
      event: "generation.accepted",
      generationId: job.id,
      projectId,
      step,
    })

    void processGenerationJob(job.id)

    return Response.json(
      { generationId: job.id, status: job.status },
      { status: 202 }
    )
  } catch (error) {
    if (error instanceof AppError && error.code === ERROR_CODES.SAFETY_BLOCKED) {
      logEvent({ event: "safety.blocked", code: error.code })
    }
    const { status, body } = toErrorBody(error)
    return Response.json(body, { status })
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const id = new URL(request.url).searchParams.get("id")
    if (!id) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "생성 작업을 찾을 수 없습니다.",
        errorStatus(ERROR_CODES.NOT_FOUND)
      )
    }
    const job = getJob(id)
    if (!job) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "생성 작업을 찾을 수 없습니다.",
        errorStatus(ERROR_CODES.NOT_FOUND)
      )
    }
    return Response.json(toPollPayload(job))
  } catch (error) {
    const { status, body } = toErrorBody(error)
    return Response.json(body, { status })
  }
}

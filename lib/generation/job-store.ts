import {
  GENERATION_STATUS,
  type GenerationStatus,
  type GenerationStep,
  type InputSnapshot,
} from "@/types/domain"

export interface GenerationArtifactPayload {
  concepts?: unknown[]
  palettes?: unknown[]
  wireframes?: unknown[]
  componentSets?: unknown[]
  prototype?: unknown
}

export interface GenerationJob {
  id: string
  projectId: string
  step: GenerationStep
  status: GenerationStatus
  idempotencyKey: string
  inputSnapshot: InputSnapshot
  errorCode?: string
  errorMessageUser?: string
  artifacts?: GenerationArtifactPayload
  createdAt: string
  startedAt?: string
  completedAt?: string
  timeoutAt: string
}

const globalForJobs = globalThis as typeof globalThis & {
  __protomatchJobs?: Map<string, GenerationJob>
  __protomatchInflight?: Map<string, string>
  __protomatchIdempotency?: Map<string, string>
}

function jobs(): Map<string, GenerationJob> {
  if (!globalForJobs.__protomatchJobs) {
    globalForJobs.__protomatchJobs = new Map()
  }
  return globalForJobs.__protomatchJobs
}

function inflightKeys(): Map<string, string> {
  if (!globalForJobs.__protomatchInflight) {
    globalForJobs.__protomatchInflight = new Map()
  }
  return globalForJobs.__protomatchInflight
}

function idempotencyKeys(): Map<string, string> {
  if (!globalForJobs.__protomatchIdempotency) {
    globalForJobs.__protomatchIdempotency = new Map()
  }
  return globalForJobs.__protomatchIdempotency
}

export function inflightKey(projectId: string, step: GenerationStep): string {
  return `${projectId}:${step}`
}

export function getJob(id: string): GenerationJob | undefined {
  return jobs().get(id)
}

export function getJobByIdempotency(key: string): GenerationJob | undefined {
  const id = idempotencyKeys().get(key)
  if (!id) return undefined
  return jobs().get(id)
}

export function getInflightJob(
  projectId: string,
  step: GenerationStep
): GenerationJob | undefined {
  const id = inflightKeys().get(inflightKey(projectId, step))
  if (!id) return undefined
  return jobs().get(id)
}

export function createQueuedJob(input: {
  id: string
  projectId: string
  step: GenerationStep
  idempotencyKey: string
  inputSnapshot: InputSnapshot
  timeoutAt: string
}): GenerationJob {
  const job: GenerationJob = {
    ...input,
    status: GENERATION_STATUS.queued,
    createdAt: new Date().toISOString(),
  }
  jobs().set(job.id, job)
  idempotencyKeys().set(job.idempotencyKey, job.id)
  inflightKeys().set(inflightKey(job.projectId, job.step), job.id)
  return job
}

export function casToRunning(id: string): GenerationJob | undefined {
  const job = jobs().get(id)
  if (!job || job.status !== GENERATION_STATUS.queued) return undefined
  const next: GenerationJob = {
    ...job,
    status: GENERATION_STATUS.running,
    startedAt: new Date().toISOString(),
  }
  jobs().set(id, next)
  return next
}

export function completeJob(
  id: string,
  patch: Pick<GenerationJob, "status" | "errorCode" | "errorMessageUser" | "artifacts">
): GenerationJob | undefined {
  const job = jobs().get(id)
  if (!job) return undefined
  const next: GenerationJob = {
    ...job,
    ...patch,
    completedAt: new Date().toISOString(),
  }
  jobs().set(id, next)
  if (
    next.status === GENERATION_STATUS.succeeded ||
    next.status === GENERATION_STATUS.failed
  ) {
    const current = inflightKeys().get(inflightKey(next.projectId, next.step))
    if (current === id) inflightKeys().delete(inflightKey(next.projectId, next.step))
  }
  return next
}

export function isTimedOut(job: GenerationJob, now = Date.now()): boolean {
  return now > new Date(job.timeoutAt).getTime()
}

export function toPollPayload(job: GenerationJob) {
  return {
    id: job.id,
    status: job.status,
    step: job.step,
    errorCode: job.errorCode,
    errorMessageUser: job.errorMessageUser,
    artifacts: job.artifacts,
  }
}

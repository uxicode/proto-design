import { describe, expect, it } from "vitest"
import {
  createQueuedJob,
  getJob,
  toPollPayload,
} from "@/lib/generation/job-store"
import type { InputSnapshot } from "@/types/domain"

const snapshot: InputSnapshot = {
  projectId: "p1",
  briefVersion: 1,
  domainKey: "fintech",
  domainLabel: "핀테크",
  keywords: ["신뢰"],
}

describe("job-store", () => {
  it("생성한 잡을 바로 조회할 수 있다", () => {
    const job = createQueuedJob({
      id: crypto.randomUUID(),
      projectId: "p1",
      step: "concept",
      idempotencyKey: crypto.randomUUID(),
      inputSnapshot: snapshot,
      timeoutAt: new Date(Date.now() + 10_000).toISOString(),
    })
    expect(getJob(job.id)?.id).toBe(job.id)
    expect(toPollPayload(job).status).toBe("queued")
  })
})

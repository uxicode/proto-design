type LogEvent =
  | "generation.accepted"
  | "generation.started"
  | "generation.succeeded"
  | "generation.failed"
  | "safety.blocked"
  | "generation.timeout"

interface LogPayload {
  event: LogEvent
  generationId?: string
  projectId?: string
  step?: string
  code?: string
  latencyMs?: number
}

export function logEvent(payload: LogPayload): void {
  console.info(
    JSON.stringify({
      ts: new Date().toISOString(),
      ...payload,
    })
  )
}

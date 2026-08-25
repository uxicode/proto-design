import type { GenerationStep } from "@/types/domain"

export const STEP_TIMEOUT_MS: Record<GenerationStep, number> = {
  concept: 45_000,
  palette: 45_000,
  wireframe: 45_000,
  components: 45_000,
  prototype: 90_000,
}

export const POLL_INTERVAL_MS = 2_000
export const PROMPT_VERSION = "pm-proto-v1"

import { ERROR_CODES } from "@/types/domain"
import { AppError, errorStatus } from "@/lib/errors"

const BLOCKED_PATTERNS = [
  /porn/i,
  /nsfw/i,
  /sexual/i,
  /nude/i,
  /포르노/,
  /성인\s*콘텐츠/,
  /아동\s*성/,
]

export function assertSafeText(text: string): void {
  const hit = BLOCKED_PATTERNS.some((pattern) => pattern.test(text))
  if (hit) {
    throw new AppError(
      ERROR_CODES.SAFETY_BLOCKED,
      "입력에 허용되지 않는 내용이 있습니다. 키워드를 수정해 주세요.",
      errorStatus(ERROR_CODES.SAFETY_BLOCKED)
    )
  }
}

export function snapshotToSafetyText(payload: {
  domainLabel: string
  keywords: string[]
  extra?: string[]
}): string {
  return [payload.domainLabel, ...payload.keywords, ...(payload.extra ?? [])].join(" ")
}

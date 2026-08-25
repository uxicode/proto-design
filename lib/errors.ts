import { ERROR_CODES, type ErrorCode } from "@/types/domain"

export class AppError extends Error {
  readonly code: ErrorCode
  readonly httpStatus: number

  constructor(code: ErrorCode, message: string, httpStatus: number) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.httpStatus = httpStatus
  }
}

export function errorStatus(code: ErrorCode): number {
  if (code === ERROR_CODES.VALIDATION_ERROR) return 400
  if (code === ERROR_CODES.SAFETY_BLOCKED) return 400
  if (code === ERROR_CODES.NOT_FOUND) return 404
  if (code === ERROR_CODES.STEP_LOCKED) return 409
  if (code === ERROR_CODES.STEP_STALE) return 409
  if (code === ERROR_CODES.GENERATION_IN_FLIGHT) return 409
  return 400
}

export function toErrorBody(error: unknown): {
  status: number
  body: { code: ErrorCode; message: string }
} {
  if (error instanceof AppError) {
    return {
      status: error.httpStatus,
      body: { code: error.code, message: error.message },
    }
  }

  return {
    status: 500,
    body: {
      code: ERROR_CODES.GENERATION_FAILED,
      message: "생성 중 오류가 발생했습니다. 다시 시도해 주세요.",
    },
  }
}

import { ERROR_CODES } from "@/types/domain"
import { AppError, errorStatus } from "@/lib/errors"

const DEFAULT_TEXT_MODEL = "gemini-3.6-flash"
const DEFAULT_IMAGE_MODEL = "gemini-3.1-flash-image"

export function getGeminiConfig() {
  const apiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? ""
  if (!apiKey) {
    throw new AppError(
      ERROR_CODES.GENERATION_FAILED,
      "Gemini API 키가 없습니다. GEMINI_API_KEY를 설정해 주세요.",
      errorStatus(ERROR_CODES.GENERATION_FAILED)
    )
  }

  return {
    apiKey,
    baseUrl: (
      process.env.GEMINI_BASE_URL ??
      "https://generativelanguage.googleapis.com/v1beta"
    ).replace(/\/$/, ""),
    textModel: process.env.GEMINI_TEXT_MODEL ?? DEFAULT_TEXT_MODEL,
    imageModel: process.env.GEMINI_IMAGE_MODEL ?? DEFAULT_IMAGE_MODEL,
  }
}

interface GeminiPart {
  text?: string
  inlineData?: { mimeType?: string; data?: string }
  inline_data?: { mime_type?: string; data?: string }
}

interface GeminiResponse {
  error?: { message?: string; status?: string }
  candidates?: {
    content?: { parts?: GeminiPart[] }
    finishReason?: string
  }[]
}

export async function geminiGenerateContent(input: {
  model: string
  system?: string
  user: string
  json?: boolean
  image?: boolean
  temperature?: number
  signal?: AbortSignal
}): Promise<GeminiResponse> {
  const { apiKey, baseUrl } = getGeminiConfig()
  const fallbackModel = input.image ? DEFAULT_IMAGE_MODEL : DEFAULT_TEXT_MODEL
  const models = uniqueModels(input.model, fallbackModel)

  const generationConfig: Record<string, unknown> = {
    temperature: input.temperature ?? 0.7,
  }
  if (input.json) {
    generationConfig.responseMimeType = "application/json"
  }
  if (input.image) {
    generationConfig.responseModalities = ["TEXT", "IMAGE"]
  }

  const body: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: [{ text: input.user }],
      },
    ],
    generationConfig,
  }
  if (input.system) {
    body.systemInstruction = {
      parts: [{ text: input.system }],
    }
  }

  let lastStatus = 0
  let lastError: GeminiResponse["error"]
  let lastModel = models[0] ?? input.model

  for (const model of models) {
    lastModel = model
    const response = await fetch(`${baseUrl}/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: input.signal,
    })
    const json = (await response.json()) as GeminiResponse
    if (response.ok && !json.error) return json

    lastStatus = response.status
    lastError = json.error
    const isMissingModel =
      response.status === 404 || json.error?.status === "NOT_FOUND"
    if (!isMissingModel) break
    if (model !== fallbackModel) {
      console.info(
        JSON.stringify({
          event: "gemini.fallback",
          from: model,
          to: fallbackModel,
        })
      )
    }
  }

  console.info(
    JSON.stringify({
      event: "gemini.error",
      model: lastModel,
      httpStatus: lastStatus,
      status: lastError?.status ?? "UNKNOWN",
    })
  )
  throw new AppError(
    ERROR_CODES.GENERATION_FAILED,
    userMessageForGeminiError(lastStatus, lastError),
    errorStatus(ERROR_CODES.GENERATION_FAILED)
  )
}

function uniqueModels(...models: string[]): string[] {
  return Array.from(new Set(models.filter(Boolean)))
}

function userMessageForGeminiError(
  httpStatus: number,
  error: GeminiResponse["error"]
): string {
  const status = error?.status ?? ""
  if (httpStatus === 404 || status === "NOT_FOUND") {
    return "이 API 키로는 설정한 Gemini 모델을 쓸 수 없습니다. GEMINI_TEXT_MODEL을 gemini-3.6-flash로 바꿔 주세요."
  }
  if (httpStatus === 429 || status === "RESOURCE_EXHAUSTED") {
    return "Gemini 할당량이 초과되었습니다. 잠시 후 다시 시도해 주세요."
  }
  if (
    httpStatus === 401 ||
    httpStatus === 403 ||
    status === "UNAUTHENTICATED" ||
    status === "PERMISSION_DENIED"
  ) {
    return "Gemini API 키 권한을 확인해 주세요."
  }
  return "Gemini 호출에 실패했습니다."
}

export function firstTextPart(response: GeminiResponse): string {
  const parts = response.candidates?.[0]?.content?.parts ?? []
  const text = parts
    .map((part) => part.text?.trim())
    .filter((value): value is string => Boolean(value))
    .join("\n")
  if (!text) {
    throw new AppError(
      ERROR_CODES.GENERATION_FAILED,
      "모델 응답이 비어 있습니다.",
      errorStatus(ERROR_CODES.GENERATION_FAILED)
    )
  }
  return text
}

export function firstImagePart(response: GeminiResponse): {
  mimeType: string
  data: string
} {
  const parts = response.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    const mimeType = part.inlineData?.mimeType ?? part.inline_data?.mime_type
    const data = part.inlineData?.data ?? part.inline_data?.data
    if (mimeType && data) return { mimeType, data }
  }
  throw new AppError(
    ERROR_CODES.GENERATION_FAILED,
    "이미지 결과가 비어 있습니다.",
    errorStatus(ERROR_CODES.GENERATION_FAILED)
  )
}

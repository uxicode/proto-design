import { DOMAIN_PRESETS } from "@/lib/config/domains"
import type { BriefInput, DomainKey } from "@/types/domain"

export const NAME_MIN = 1
export const NAME_MAX = 80
export const KEYWORD_MIN = 2
export const KEYWORD_MAX = 30
export const KEYWORDS_MAX = 15
export const DOMAIN_CUSTOM_MIN = 2
export const DOMAIN_CUSTOM_MAX = 40

export function validateProjectName(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed.length < NAME_MIN) return "프로젝트 이름을 입력해 주세요."
  if (trimmed.length > NAME_MAX) return "이름은 80자 이하여야 합니다."
  return null
}

export function validateKeywords(keywords: string[]): string | null {
  if (keywords.length < 1) return "키워드를 1개 이상 입력해 주세요."
  if (keywords.length > KEYWORDS_MAX) return "키워드는 최대 15개입니다."
  const invalid = keywords.find(
    (word) => word.length < KEYWORD_MIN || word.length > KEYWORD_MAX
  )
  if (invalid) return "각 키워드는 2~30자여야 합니다."
  return null
}

export function validateBrief(brief: BriefInput): string | null {
  const known = DOMAIN_PRESETS.some((item) => item.key === brief.domainKey)
  if (!known) return "분야를 선택해 주세요."
  if (brief.domainKey === "other") {
    const custom = brief.domainCustom?.trim() ?? ""
    if (custom.length < DOMAIN_CUSTOM_MIN || custom.length > DOMAIN_CUSTOM_MAX) {
      return "기타 분야는 2~40자로 입력해 주세요."
    }
  }
  return validateKeywords(brief.keywords)
}

export function isDomainKey(value: string): value is DomainKey {
  return DOMAIN_PRESETS.some((item) => item.key === value)
}

import type { DomainKey } from "@/types/domain"

export interface DomainPreset {
  key: DomainKey
  label: string
}

export const DOMAIN_PRESETS: DomainPreset[] = [
  { key: "healthcare", label: "헬스케어" },
  { key: "fintech", label: "핀테크" },
  { key: "ecommerce", label: "이커머스" },
  { key: "education", label: "교육" },
  { key: "saas_internal", label: "사내툴" },
  { key: "other", label: "기타" },
]

export function getDomainLabel(
  domainKey: DomainKey | null,
  domainCustom: string | null
): string {
  if (!domainKey) return ""
  if (domainKey === "other") return domainCustom?.trim() || "기타"
  const preset = DOMAIN_PRESETS.find((item) => item.key === domainKey)
  return preset?.label ?? domainKey
}

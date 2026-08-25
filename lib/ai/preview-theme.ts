import type { WireframeLayoutId } from "@/lib/generation/wireframe-rank"
import type { ComponentItem, Swatch, WireframeBlock } from "@/types/domain"

export type LayoutKind = WireframeLayoutId
export type KitKind = "solid" | "soft" | "compact"

export interface PreviewColors {
  primary: string
  secondary: string
  background: string
  text: string
  accent: string
}

const TITLE_LAYOUTS: Array<{ pattern: RegExp; id: LayoutKind }> = [
  { pattern: /사이드바 앱|sidebar app/i, id: "app" },
  { pattern: /카드 갤러리|card gallery/i, id: "gallery" },
  { pattern: /히어로 우선|hero-first/i, id: "hero" },
  { pattern: /스플릿 히어로|split-hero/i, id: "split" },
  { pattern: /가격 3열|pricing three/i, id: "pricing" },
  { pattern: /대시보드 지표|dashboard metrics/i, id: "dashboard" },
  { pattern: /중앙 온보딩|centered onboarding/i, id: "onboard" },
  { pattern: /아티클 리드|article reading/i, id: "article" },
  { pattern: /체크아웃 스텝|checkout stepper/i, id: "checkout" },
  { pattern: /설정 패널|settings panel/i, id: "settings" },
  { pattern: /칸반 보드|kanban board/i, id: "kanban" },
  { pattern: /채팅 스레드|chat messenger/i, id: "chat" },
  { pattern: /검색 결과|search-results/i, id: "search" },
  { pattern: /프로필 헤더|profile header/i, id: "profile" },
  { pattern: /지도 스플릿|map-split/i, id: "map" },
  { pattern: /비디오 시청|video-player/i, id: "video" },
  { pattern: /활동 타임라인|activity timeline/i, id: "timeline" },
  { pattern: /빈 상태 위자드|empty-wizard/i, id: "wizard" },
  { pattern: /월간 캘린더|calendar month/i, id: "calendar" },
  { pattern: /인박스|inbox mail/i, id: "inbox" },
]

export function resolveLayoutKind(input: {
  prompt?: string
  blocks?: WireframeBlock[]
  title?: string
}): LayoutKind {
  const haystack = `${input.title ?? ""} ${input.prompt ?? ""}`
  const fromTitle = TITLE_LAYOUTS.find((item) => item.pattern.test(haystack))
  if (fromTitle) return fromTitle.id

  const roles = new Set((input.blocks ?? []).map((block) => block.role))
  if (roles.has("sidebar")) return "app"
  if (roles.has("hero") && roles.has("form")) return "hero"
  if (roles.has("hero")) return "split"
  if (roles.has("list") && !roles.has("hero")) return "gallery"

  if (/sidebar|app|대시보드|dashboard|설정|settings|kanban|칸반|inbox|인박스|chat|채팅|calendar|캘린더/i.test(haystack))
    return "app"
  if (/gallery|card|카드|필터|가격|pricing|search-results|검색 결과|map-split|지도|timeline|타임라인/i.test(haystack))
    return "gallery"
  if (/checkout|체크아웃|온보딩|onboarding|스플릿|split|video-player|비디오|profile|프로필|empty-wizard|위자드/i.test(haystack))
    return "hero"
  return "hero"
}

export function prototypePreviewFamily(kind: LayoutKind): "hero" | "app" | "gallery" {
  if (
    kind === "app" ||
    kind === "dashboard" ||
    kind === "settings" ||
    kind === "kanban" ||
    kind === "inbox" ||
    kind === "chat"
  )
    return "app"
  if (kind === "gallery" || kind === "pricing" || kind === "search" || kind === "profile")
    return "gallery"
  return "hero"
}

export function resolveKitKind(input: {
  title?: string
  prompt?: string
  items?: ComponentItem[]
}): KitKind {
  const haystack = `${input.title ?? ""} ${input.prompt ?? ""} ${(input.items ?? [])
    .map((item) => `${item.variant} ${item.notes}`)
    .join(" ")}`
  if (/soft|pill|둥근|rounded/i.test(haystack)) return "soft"
  if (/compact|dense|밀도|icon-rail|컴팩트/i.test(haystack)) return "compact"
  return "solid"
}

export function paletteFromSwatches(swatches: Swatch[] | undefined): PreviewColors {
  const byRole = new Map((swatches ?? []).map((item) => [item.role, item.hex]))
  return {
    primary: byRole.get("primary") ?? "#1F3A5F",
    secondary: byRole.get("secondary") ?? "#5B7C99",
    background: byRole.get("background") ?? "#FAFAF9",
    text: byRole.get("text") ?? "#111827",
    accent: byRole.get("accent") ?? "#C45C26",
  }
}

export function kitRadius(kind: KitKind): number {
  if (kind === "soft") return 22
  if (kind === "compact") return 4
  return 8
}

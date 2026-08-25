import type { ImageBlob } from "@/lib/ai/types"
import type { WireframeBlock } from "@/types/domain"

const ROLE_LABEL: Record<WireframeBlock["role"], string> = {
  nav: "NAV",
  hero: "HERO",
  form: "FORM",
  list: "LIST",
  footer: "FOOTER",
  sidebar: "SIDEBAR",
  content: "CONTENT",
}

export function renderWireframePreview(input: {
  title?: string
  prompt: string
  blocks?: WireframeBlock[]
  slot: number
}): ImageBlob {
  const kind = resolveLayoutKind({
    prompt: input.prompt,
    blocks: input.blocks,
    slot: input.slot,
    title: input.title,
  })
  return {
    dataUrl: toDataUrl(wireframeSvg(kind, input.title, input.blocks ?? [])),
    width: 960,
    height: 600,
  }
}

type LayoutKind =
  | "hero"
  | "app"
  | "gallery"
  | "split"
  | "pricing"
  | "dashboard"
  | "onboard"
  | "article"
  | "checkout"
  | "settings"
  | "kanban"
  | "chat"
  | "search"
  | "profile"
  | "map"
  | "video"
  | "timeline"
  | "wizard"
  | "calendar"
  | "inbox"

const LAYOUT_KINDS: LayoutKind[] = [
  "hero",
  "app",
  "gallery",
  "split",
  "pricing",
  "dashboard",
  "onboard",
  "article",
  "checkout",
  "settings",
  "kanban",
  "chat",
  "search",
  "profile",
  "map",
  "video",
  "timeline",
  "wizard",
  "calendar",
  "inbox",
]

function resolveLayoutKind(input: {
  prompt: string
  blocks?: WireframeBlock[]
  slot: number
  title?: string
}): LayoutKind {
  const haystack = `${input.title ?? ""} ${input.prompt}`
  if (/split-hero|스플릿/i.test(haystack)) return "split"
  if (/pricing|가격/i.test(haystack)) return "pricing"
  if (/kanban|칸반/i.test(haystack)) return "kanban"
  if (/inbox|인박스/i.test(haystack)) return "inbox"
  if (/chat|채팅|messenger/i.test(haystack)) return "chat"
  if (/search-results|검색 결과/i.test(haystack)) return "search"
  if (/profile|프로필/i.test(haystack)) return "profile"
  if (/map-split|지도/i.test(haystack)) return "map"
  if (/video-player|비디오/i.test(haystack)) return "video"
  if (/timeline|타임라인/i.test(haystack)) return "timeline"
  if (/empty-wizard|위자드|빈 상태/i.test(haystack)) return "wizard"
  if (/calendar|캘린더/i.test(haystack)) return "calendar"
  if (/dashboard|대시보드|지표/i.test(haystack)) return "dashboard"
  if (/onboarding|온보딩/i.test(haystack)) return "onboard"
  if (/article|아티클/i.test(haystack)) return "article"
  if (/checkout|체크아웃/i.test(haystack)) return "checkout"
  if (/settings|설정/i.test(haystack)) return "settings"
  const roles = new Set((input.blocks ?? []).map((block) => block.role))
  if (roles.has("sidebar") && roles.has("form")) return "settings"
  if (roles.has("sidebar")) return "app"
  if (roles.has("hero") && roles.has("content")) return "split"
  if (roles.has("hero")) return "hero"
  if (roles.has("list") && !roles.has("hero")) return "gallery"
  return LAYOUT_KINDS[input.slot % LAYOUT_KINDS.length] ?? "hero"
}

function noteFor(blocks: WireframeBlock[], role: WireframeBlock["role"]): string {
  const block = blocks.find((item) => item.role === role)
  return block?.notes ?? ROLE_LABEL[role]
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function box(
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  note: string
): string {
  const title = escapeXml(label)
  const caption = escapeXml(note.slice(0, 42))
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#FFFFFF" stroke="#9CA3AF" stroke-width="2"/>
    <text x="${x + 16}" y="${y + 28}" fill="#4B5563" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="700">${title}</text>
    <text x="${x + 16}" y="${y + 50}" fill="#9CA3AF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">${caption}</text>
  `
}

function lines(x: number, y: number, width: number, count: number): string {
  return Array.from({ length: count }, (_, index) => {
    const w = index % 2 === 0 ? width : Math.round(width * 0.72)
    return `<rect x="${x}" y="${y + index * 22}" width="${w}" height="10" fill="#E5E7EB"/>`
  }).join("")
}

function wireframeSvg(
  kind: LayoutKind,
  title: string | undefined,
  blocks: WireframeBlock[]
): string {
  const heading = escapeXml((title ?? "와이어프레임").slice(0, 36))
  const frame = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
    <rect width="960" height="600" fill="#F3F4F6"/>
    <text x="24" y="28" fill="#6B7280" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">${heading} · lo-fi</text>`

  if (kind === "app") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 200, 480, ROLE_LABEL.sidebar, noteFor(blocks, "sidebar"))}
      ${box(228, 104, 460, 480, ROLE_LABEL.list, noteFor(blocks, "list"))}
      ${lines(248, 168, 420, 12)}
      ${box(700, 104, 244, 480, ROLE_LABEL.content, noteFor(blocks, "content"))}
      ${lines(720, 168, 204, 8)}
    </svg>`
  }

  if (kind === "gallery") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 928, 52, ROLE_LABEL.content, noteFor(blocks, "content"))}
      <rect x="32" y="118" width="72" height="24" rx="12" fill="#D1D5DB"/>
      <rect x="112" y="118" width="72" height="24" rx="12" fill="#E5E7EB"/>
      <rect x="192" y="118" width="72" height="24" rx="12" fill="#E5E7EB"/>
      ${box(16, 168, 300, 300, ROLE_LABEL.list, noteFor(blocks, "list"))}
      <rect x="40" y="228" width="252" height="140" fill="#E5E7EB"/>
      ${box(330, 168, 300, 300, "CARD", "그리드 2")}
      <rect x="354" y="228" width="252" height="140" fill="#E5E7EB"/>
      ${box(644, 168, 300, 300, "CARD", "그리드 3")}
      <rect x="668" y="228" width="252" height="140" fill="#E5E7EB"/>
      ${box(16, 480, 928, 104, ROLE_LABEL.footer, noteFor(blocks, "footer"))}
    </svg>`
  }

  if (kind === "split") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 452, 380, ROLE_LABEL.hero, noteFor(blocks, "hero"))}
      <rect x="40" y="300" width="160" height="36" fill="#9CA3AF"/>
      ${box(480, 104, 464, 380, ROLE_LABEL.content, noteFor(blocks, "content"))}
      <line x1="520" y1="160" x2="900" y2="420" stroke="#D1D5DB" stroke-width="2"/>
      <line x1="900" y1="160" x2="520" y2="420" stroke="#D1D5DB" stroke-width="2"/>
      ${box(16, 496, 928, 88, ROLE_LABEL.footer, noteFor(blocks, "footer"))}
    </svg>`
  }

  if (kind === "pricing") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 928, 64, ROLE_LABEL.content, noteFor(blocks, "content"))}
      ${box(16, 180, 300, 300, "PLAN", "기본")}
      ${box(330, 180, 300, 300, "PLAN", "추천")}
      ${box(644, 180, 300, 300, "PLAN", "엔터프라이즈")}
      <rect x="48" y="400" width="236" height="36" fill="#9CA3AF"/>
      <rect x="362" y="400" width="236" height="36" fill="#6B7280"/>
      <rect x="676" y="400" width="236" height="36" fill="#9CA3AF"/>
      ${box(16, 492, 928, 92, ROLE_LABEL.footer, noteFor(blocks, "footer"))}
    </svg>`
  }

  if (kind === "dashboard") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 72, 480, ROLE_LABEL.sidebar, noteFor(blocks, "sidebar"))}
      ${box(100, 104, 200, 88, "KPI", "활성")}
      ${box(312, 104, 200, 88, "KPI", "전환")}
      ${box(524, 104, 200, 88, "KPI", "매출")}
      ${box(736, 104, 208, 88, ROLE_LABEL.content, noteFor(blocks, "content"))}
      ${box(100, 204, 844, 380, ROLE_LABEL.list, noteFor(blocks, "list"))}
      ${lines(124, 268, 796, 10)}
    </svg>`
  }

  if (kind === "onboard") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(280, 112, 400, 40, ROLE_LABEL.content, noteFor(blocks, "content"))}
      <rect x="300" y="124" width="80" height="16" fill="#9CA3AF"/>
      <rect x="400" y="124" width="80" height="16" fill="#D1D5DB"/>
      <rect x="500" y="124" width="80" height="16" fill="#D1D5DB"/>
      ${box(240, 168, 480, 300, ROLE_LABEL.form, noteFor(blocks, "form"))}
      <rect x="280" y="240" width="400" height="32" fill="#F3F4F6" stroke="#9CA3AF"/>
      <rect x="280" y="288" width="400" height="32" fill="#F3F4F6" stroke="#9CA3AF"/>
      <rect x="280" y="360" width="400" height="40" fill="#9CA3AF"/>
      ${box(16, 492, 928, 92, ROLE_LABEL.footer, noteFor(blocks, "footer"))}
    </svg>`
  }

  if (kind === "article") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 620, 380, ROLE_LABEL.content, noteFor(blocks, "content"))}
      ${lines(40, 168, 560, 10)}
      ${box(648, 104, 296, 380, ROLE_LABEL.sidebar, noteFor(blocks, "sidebar"))}
      ${lines(668, 168, 252, 8)}
      ${box(16, 496, 928, 88, ROLE_LABEL.footer, noteFor(blocks, "footer"))}
    </svg>`
  }

  if (kind === "checkout") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      <rect x="80" y="60" width="120" height="16" fill="#9CA3AF"/>
      <rect x="220" y="60" width="120" height="16" fill="#D1D5DB"/>
      <rect x="360" y="60" width="120" height="16" fill="#D1D5DB"/>
      ${box(16, 104, 600, 380, ROLE_LABEL.form, noteFor(blocks, "form"))}
      <rect x="40" y="180" width="552" height="32" fill="#F3F4F6" stroke="#9CA3AF"/>
      <rect x="40" y="228" width="552" height="32" fill="#F3F4F6" stroke="#9CA3AF"/>
      <rect x="40" y="276" width="260" height="32" fill="#F3F4F6" stroke="#9CA3AF"/>
      ${box(628, 104, 316, 380, ROLE_LABEL.content, noteFor(blocks, "content"))}
      ${lines(648, 180, 276, 6)}
      <rect x="648" y="400" width="276" height="40" fill="#9CA3AF"/>
      ${box(16, 496, 928, 88, ROLE_LABEL.footer, noteFor(blocks, "footer"))}
    </svg>`
  }

  if (kind === "settings") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 240, 380, ROLE_LABEL.sidebar, noteFor(blocks, "sidebar"))}
      ${lines(36, 168, 200, 8)}
      ${box(268, 104, 676, 300, ROLE_LABEL.form, noteFor(blocks, "form"))}
      <rect x="292" y="180" width="628" height="28" fill="#F3F4F6" stroke="#9CA3AF"/>
      <rect x="292" y="224" width="628" height="28" fill="#F3F4F6" stroke="#9CA3AF"/>
      <rect x="292" y="268" width="628" height="28" fill="#F3F4F6" stroke="#9CA3AF"/>
      ${box(268, 416, 676, 68, ROLE_LABEL.content, noteFor(blocks, "content"))}
      <rect x="780" y="432" width="140" height="36" fill="#9CA3AF"/>
    </svg>`
  }

  if (kind === "kanban") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 160, 480, ROLE_LABEL.sidebar, noteFor(blocks, "sidebar"))}
      ${box(188, 104, 236, 480, "COL", "할 일")}
      <rect x="208" y="168" width="196" height="64" fill="#E5E7EB"/>
      <rect x="208" y="244" width="196" height="64" fill="#E5E7EB"/>
      ${box(436, 104, 236, 480, "COL", "진행")}
      <rect x="456" y="168" width="196" height="88" fill="#D1D5DB"/>
      ${box(684, 104, 260, 480, "COL", "완료")}
      <rect x="704" y="168" width="220" height="64" fill="#E5E7EB"/>
      <rect x="704" y="244" width="220" height="64" fill="#E5E7EB"/>
    </svg>`
  }

  if (kind === "chat") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 280, 400, ROLE_LABEL.list, noteFor(blocks, "list"))}
      ${lines(36, 168, 240, 8)}
      ${box(308, 104, 636, 320, ROLE_LABEL.content, noteFor(blocks, "content"))}
      <rect x="340" y="168" width="240" height="36" rx="18" fill="#E5E7EB"/>
      <rect x="620" y="220" width="280" height="36" rx="18" fill="#D1D5DB"/>
      <rect x="340" y="272" width="200" height="36" rx="18" fill="#E5E7EB"/>
      ${box(308, 436, 636, 148, ROLE_LABEL.form, noteFor(blocks, "form"))}
      <rect x="332" y="500" width="520" height="40" fill="#F3F4F6" stroke="#9CA3AF"/>
      <rect x="864" y="500" width="56" height="40" fill="#9CA3AF"/>
    </svg>`
  }

  if (kind === "search") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      <rect x="200" y="52" width="560" height="32" fill="#FFFFFF" stroke="#9CA3AF"/>
      ${box(16, 104, 928, 52, ROLE_LABEL.content, noteFor(blocks, "content"))}
      <rect x="32" y="118" width="80" height="24" rx="12" fill="#D1D5DB"/>
      <rect x="124" y="118" width="80" height="24" rx="12" fill="#E5E7EB"/>
      ${box(16, 168, 928, 88, "RESULT", "결과 1")}
      ${lines(40, 212, 760, 2)}
      ${box(16, 268, 928, 88, "RESULT", "결과 2")}
      ${lines(40, 312, 700, 2)}
      ${box(16, 368, 928, 88, "RESULT", "결과 3")}
      ${box(16, 468, 928, 116, ROLE_LABEL.footer, noteFor(blocks, "footer"))}
    </svg>`
  }

  if (kind === "profile") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 928, 180, ROLE_LABEL.hero, noteFor(blocks, "hero"))}
      <circle cx="88" cy="232" r="36" fill="#D1D5DB"/>
      <rect x="140" y="220" width="160" height="24" fill="#9CA3AF"/>
      ${box(16, 296, 928, 48, ROLE_LABEL.content, noteFor(blocks, "content"))}
      <rect x="40" y="310" width="72" height="20" fill="#9CA3AF"/>
      <rect x="128" y="310" width="72" height="20" fill="#D1D5DB"/>
      <rect x="216" y="310" width="72" height="20" fill="#D1D5DB"/>
      ${box(16, 356, 300, 228, ROLE_LABEL.list, noteFor(blocks, "list"))}
      ${box(328, 356, 300, 228, "GRID", "포스트 2")}
      ${box(640, 356, 304, 228, "GRID", "포스트 3")}
    </svg>`
  }

  if (kind === "map") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 300, 392, ROLE_LABEL.list, noteFor(blocks, "list"))}
      ${lines(36, 168, 260, 8)}
      ${box(328, 104, 616, 392, "MAP", noteFor(blocks, "content"))}
      <circle cx="520" cy="260" r="8" fill="#6B7280"/>
      <circle cx="680" cy="320" r="8" fill="#6B7280"/>
      <circle cx="780" cy="220" r="8" fill="#9CA3AF"/>
      <path d="M480 240 L640 300 L760 210" fill="none" stroke="#D1D5DB" stroke-width="3"/>
      ${box(16, 508, 928, 76, ROLE_LABEL.footer, noteFor(blocks, "footer"))}
    </svg>`
  }

  if (kind === "video") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 620, 300, "PLAYER", noteFor(blocks, "hero"))}
      <polygon points="300,220 380,270 300,320" fill="#9CA3AF"/>
      <rect x="40" y="370" width="480" height="10" fill="#E5E7EB"/>
      <rect x="40" y="370" width="180" height="10" fill="#9CA3AF"/>
      ${box(16, 416, 620, 168, ROLE_LABEL.content, noteFor(blocks, "content"))}
      ${lines(40, 470, 560, 4)}
      ${box(648, 104, 296, 480, ROLE_LABEL.list, noteFor(blocks, "list"))}
      <rect x="668" y="168" width="256" height="80" fill="#E5E7EB"/>
      <rect x="668" y="264" width="256" height="80" fill="#E5E7EB"/>
      <rect x="668" y="360" width="256" height="80" fill="#E5E7EB"/>
    </svg>`
  }

  if (kind === "timeline") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 928, 48, ROLE_LABEL.content, noteFor(blocks, "content"))}
      <rect x="40" y="118" width="72" height="20" rx="10" fill="#9CA3AF"/>
      <rect x="124" y="118" width="72" height="20" rx="10" fill="#E5E7EB"/>
      <line x1="80" y1="176" x2="80" y2="520" stroke="#D1D5DB" stroke-width="4"/>
      ${box(112, 168, 832, 96, "FEED", "이벤트 1")}
      <circle cx="80" cy="216" r="10" fill="#9CA3AF"/>
      ${box(112, 280, 832, 96, "FEED", "이벤트 2")}
      <circle cx="80" cy="328" r="10" fill="#9CA3AF"/>
      ${box(112, 392, 832, 96, "FEED", "이벤트 3")}
      <circle cx="80" cy="440" r="10" fill="#9CA3AF"/>
      ${box(16, 508, 928, 76, ROLE_LABEL.footer, noteFor(blocks, "footer"))}
    </svg>`
  }

  if (kind === "wizard") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(240, 120, 480, 220, "EMPTY", noteFor(blocks, "hero"))}
      <circle cx="480" cy="210" r="40" fill="#E5E7EB"/>
      ${box(240, 356, 480, 80, ROLE_LABEL.content, noteFor(blocks, "content"))}
      ${box(240, 452, 480, 80, ROLE_LABEL.form, noteFor(blocks, "form"))}
      <rect x="360" y="476" width="240" height="36" fill="#9CA3AF"/>
    </svg>`
  }

  if (kind === "calendar") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 640, 480, ROLE_LABEL.content, noteFor(blocks, "content"))}
      ${Array.from({ length: 28 }, (_, index) => {
        const col = index % 7
        const row = Math.floor(index / 7)
        return `<rect x="${40 + col * 86}" y="${168 + row * 92}" width="76" height="80" fill="#FFFFFF" stroke="#D1D5DB"/><text x="${52 + col * 86}" y="${188 + row * 92}" fill="#9CA3AF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">${index + 1}</text>`
      }).join("")}
      ${box(668, 104, 276, 320, ROLE_LABEL.list, noteFor(blocks, "list"))}
      ${lines(688, 168, 236, 6)}
      ${box(668, 436, 276, 148, ROLE_LABEL.form, noteFor(blocks, "form"))}
      <rect x="688" y="500" width="236" height="36" fill="#9CA3AF"/>
    </svg>`
  }

  if (kind === "inbox") {
    return `${frame}
      ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
      ${box(16, 104, 160, 480, ROLE_LABEL.sidebar, noteFor(blocks, "sidebar"))}
      ${lines(36, 168, 120, 7)}
      ${box(188, 104, 280, 480, ROLE_LABEL.list, noteFor(blocks, "list"))}
      <rect x="208" y="168" width="240" height="56" fill="#E5E7EB"/>
      <rect x="208" y="236" width="240" height="56" fill="#F3F4F6"/>
      <rect x="208" y="304" width="240" height="56" fill="#F3F4F6"/>
      ${box(480, 104, 464, 480, "MAIL", noteFor(blocks, "content"))}
      ${lines(500, 168, 424, 10)}
    </svg>`
  }

  return `${frame}
    ${box(16, 44, 928, 48, ROLE_LABEL.nav, noteFor(blocks, "nav"))}
    ${box(16, 104, 928, 250, ROLE_LABEL.hero, noteFor(blocks, "hero"))}
    <line x1="40" y1="140" x2="920" y2="330" stroke="#D1D5DB" stroke-width="2"/>
    <line x1="920" y1="140" x2="40" y2="330" stroke="#D1D5DB" stroke-width="2"/>
    <rect x="40" y="280" width="160" height="36" fill="#9CA3AF"/>
    ${box(16, 366, 928, 122, ROLE_LABEL.form, noteFor(blocks, "form"))}
    <rect x="40" y="414" width="280" height="36" fill="#FFFFFF" stroke="#9CA3AF"/>
    <rect x="332" y="414" width="120" height="36" fill="#9CA3AF"/>
    ${box(16, 500, 928, 84, ROLE_LABEL.footer, noteFor(blocks, "footer"))}
  </svg>`
}

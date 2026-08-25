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

export function mockImage(
  label: string,
  background: string,
  subtitle?: string
): { dataUrl: string; width: number; height: number } {
  return {
    dataUrl: toDataUrl(moodboardSvg(label, background, subtitle ?? "")),
    width: 960,
    height: 600,
  }
}

export function mockConceptMood(prompt: string): {
  dataUrl: string
  width: number
  height: number
} {
  const kind = resolveConceptKind(prompt)
  return {
    dataUrl: toDataUrl(conceptMoodSvg(kind, prompt)),
    width: 960,
    height: 600,
  }
}

export function mockWireframePreview(prompt: string): {
  dataUrl: string
  width: number
  height: number
} {
  const isApp = /sidebar|app|대시보드|dashboard/i.test(prompt)
  const isGallery = /gallery|card|카드|필터/i.test(prompt)
  return {
    dataUrl: toDataUrl(wireframeSvg(isApp ? "app" : isGallery ? "gallery" : "hero")),
    width: 960,
    height: 600,
  }
}

export function mockComponentPreview(prompt: string): {
  dataUrl: string
  width: number
  height: number
} {
  const kind = /soft|pill|둥근/i.test(prompt)
    ? "soft"
    : /compact|dense|밀도/i.test(prompt)
      ? "compact"
      : "solid"
  return {
    dataUrl: toDataUrl(componentKitSvg(kind)),
    width: 960,
    height: 600,
  }
}

export function mockPrototypePreview(prompt: string): {
  dataUrl: string
  width: number
  height: number
} {
  return {
    dataUrl: toDataUrl(prototypeSvg(prompt)),
    width: 960,
    height: 600,
  }
}

type ConceptKind = "clean" | "warm" | "dense"

function resolveConceptKind(prompt: string): ConceptKind {
  if (/warm|온기|soft|친근/i.test(prompt)) return "warm"
  if (/dense|밀도|dashboard|쿨 그레이|cool gray/i.test(prompt)) return "dense"
  return "clean"
}

function moodboardSvg(label: string, background: string, subtitle: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
    <rect width="960" height="600" fill="${background}"/>
    <rect x="48" y="48" width="864" height="504" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
    <text x="480" y="280" text-anchor="middle" fill="white" font-family="Georgia, serif" font-size="32">${escapeXml(label)}</text>
    <text x="480" y="330" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="sans-serif" font-size="16">${escapeXml(subtitle.slice(0, 48))}</text>
  </svg>`
}

function conceptMoodSvg(kind: ConceptKind, prompt: string): string {
  if (kind === "warm") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
      <rect width="960" height="600" fill="#F4EDE3"/>
      <rect x="0" y="0" width="960" height="72" fill="#E8D5C4"/>
      <circle cx="56" cy="36" r="14" fill="#C45C26"/>
      <rect x="80" y="28" width="120" height="16" rx="8" fill="#D7C3B3"/>
      <rect x="720" y="22" width="88" height="28" rx="14" fill="#C45C26"/>
      <rect x="820" y="22" width="88" height="28" rx="14" fill="#FFFFFF"/>
      <rect x="64" y="120" width="520" height="360" rx="28" fill="#FFFFFF"/>
      <text x="96" y="180" fill="#3D2A1F" font-family="Georgia, serif" font-size="36">따뜻한 첫인상</text>
      <text x="96" y="230" fill="#8A6A55" font-family="sans-serif" font-size="18">여백과 둥근 카드로 신뢰를 쌓는 톤</text>
      <rect x="96" y="270" width="180" height="44" rx="22" fill="#C45C26"/>
      <rect x="292" y="270" width="140" height="44" rx="22" fill="#F4EDE3"/>
      <rect x="96" y="340" width="200" height="88" rx="20" fill="#F7F1EA"/>
      <rect x="312" y="340" width="200" height="88" rx="20" fill="#F7F1EA"/>
      <rect x="620" y="120" width="276" height="168" rx="24" fill="#D98A5B"/>
      <rect x="620" y="308" width="276" height="172" rx="24" fill="#2F5D50"/>
      <text x="64" y="560" fill="#8A6A55" font-family="sans-serif" font-size="14">${escapeXml(prompt.slice(0, 42))}</text>
    </svg>`
  }

  if (kind === "dense") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
      <rect width="960" height="600" fill="#EEF1F4"/>
      <rect width="72" height="600" fill="#2B2F36"/>
      <rect x="16" y="20" width="40" height="40" rx="8" fill="#2563EB"/>
      <rect x="22" y="90" width="28" height="28" rx="6" fill="#4B5563"/>
      <rect x="22" y="134" width="28" height="28" rx="6" fill="#4B5563"/>
      <rect x="22" y="178" width="28" height="28" rx="6" fill="#6B7280"/>
      <rect x="96" y="24" width="840" height="48" fill="#FFFFFF"/>
      <rect x="112" y="38" width="220" height="20" rx="4" fill="#D1D5DB"/>
      <rect x="96" y="92" width="200" height="92" rx="8" fill="#FFFFFF"/>
      <rect x="312" y="92" width="200" height="92" rx="8" fill="#FFFFFF"/>
      <rect x="528" y="92" width="200" height="92" rx="8" fill="#FFFFFF"/>
      <rect x="744" y="92" width="192" height="92" rx="8" fill="#FFFFFF"/>
      <text x="112" y="128" fill="#6B7280" font-family="sans-serif" font-size="12">활성 사용자</text>
      <text x="112" y="158" fill="#111827" font-family="sans-serif" font-size="22" font-weight="700">12,480</text>
      <rect x="96" y="204" width="840" height="352" rx="8" fill="#FFFFFF"/>
      <rect x="120" y="228" width="792" height="16" rx="4" fill="#E5E7EB"/>
      <rect x="120" y="260" width="792" height="16" rx="4" fill="#F3F4F6"/>
      <rect x="120" y="292" width="792" height="16" rx="4" fill="#E5E7EB"/>
      <rect x="120" y="324" width="792" height="16" rx="4" fill="#F3F4F6"/>
      <rect x="120" y="356" width="792" height="16" rx="4" fill="#E5E7EB"/>
      <rect x="120" y="388" width="640" height="16" rx="4" fill="#F3F4F6"/>
      <text x="120" y="450" fill="#111827" font-family="sans-serif" font-size="20" font-weight="600">밀도 있는 전문가 화면</text>
      <text x="120" y="482" fill="#6B7280" font-family="sans-serif" font-size="14">리스트·지표·쿨 그레이 계층</text>
    </svg>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
    <rect width="960" height="600" fill="#F4F1EA"/>
    <rect width="960" height="64" fill="#1F3A5F"/>
    <text x="40" y="42" fill="#F4F1EA" font-family="Georgia, serif" font-size="22">Editorial</text>
    <text x="720" y="40" fill="#F4F1EA" font-family="sans-serif" font-size="14">Work  Pricing  Login</text>
    <text x="64" y="180" fill="#1A1A1A" font-family="Georgia, serif" font-size="52">선명하고 또렷한</text>
    <text x="64" y="240" fill="#1A1A1A" font-family="Georgia, serif" font-size="52">비주얼 방향</text>
    <text x="64" y="300" fill="#5B7C99" font-family="sans-serif" font-size="18">높은 대비 · 정돈된 그리드 · 큰 타이포</text>
    <rect x="64" y="340" width="200" height="52" fill="#C45C26"/>
    <text x="100" y="374" fill="#FFFFFF" font-family="sans-serif" font-size="16">시작하기</text>
    <rect x="560" y="140" width="336" height="380" fill="#1F3A5F"/>
    <rect x="592" y="180" width="272" height="24" fill="#5B7C99"/>
    <rect x="592" y="220" width="200" height="16" fill="#F4F1EA" opacity="0.35"/>
    <rect x="592" y="252" width="272" height="120" fill="#F4F1EA"/>
    <rect x="592" y="392" width="128" height="40" fill="#C45C26"/>
    <rect x="736" y="392" width="128" height="40" fill="#5B7C99"/>
  </svg>`
}

function wireframeSvg(kind: "hero" | "app" | "gallery"): string {
  if (kind === "app") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
      <rect width="960" height="600" fill="#F3F4F6"/>
      <rect width="960" height="48" fill="#D1D5DB"/>
      <rect y="48" width="200" height="552" fill="#E5E7EB"/>
      <rect x="16" y="68" width="168" height="16" fill="#9CA3AF"/>
      <rect x="16" y="100" width="168" height="16" fill="#C4C9D1"/>
      <rect x="16" y="132" width="168" height="16" fill="#C4C9D1"/>
      <rect x="224" y="72" width="700" height="40" fill="#FFFFFF" stroke="#9CA3AF"/>
      <rect x="224" y="128" width="700" height="432" fill="#FFFFFF" stroke="#9CA3AF"/>
      <rect x="248" y="152" width="652" height="20" fill="#E5E7EB"/>
      <rect x="248" y="188" width="652" height="20" fill="#F3F4F6"/>
      <rect x="248" y="224" width="652" height="20" fill="#E5E7EB"/>
      <text x="24" y="36" fill="#4B5563" font-family="sans-serif" font-size="14">NAV</text>
      <text x="24" y="320" fill="#6B7280" font-family="sans-serif" font-size="12">SIDEBAR</text>
      <text x="248" y="400" fill="#6B7280" font-family="sans-serif" font-size="14">CONTENT / LIST</text>
    </svg>`
  }
  if (kind === "gallery") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
      <rect width="960" height="600" fill="#F9FAFB"/>
      <rect width="960" height="56" fill="#E5E7EB"/>
      <rect x="40" y="80" width="80" height="24" rx="12" fill="#D1D5DB"/>
      <rect x="132" y="80" width="80" height="24" rx="12" fill="#D1D5DB"/>
      <rect x="224" y="80" width="80" height="24" rx="12" fill="#D1D5DB"/>
      <rect x="40" y="128" width="280" height="180" fill="#FFFFFF" stroke="#9CA3AF"/>
      <rect x="340" y="128" width="280" height="180" fill="#FFFFFF" stroke="#9CA3AF"/>
      <rect x="640" y="128" width="280" height="180" fill="#FFFFFF" stroke="#9CA3AF"/>
      <rect x="40" y="328" width="280" height="180" fill="#FFFFFF" stroke="#9CA3AF"/>
      <rect x="340" y="328" width="280" height="180" fill="#FFFFFF" stroke="#9CA3AF"/>
      <rect x="640" y="328" width="280" height="180" fill="#FFFFFF" stroke="#9CA3AF"/>
      <text x="40" y="36" fill="#4B5563" font-family="sans-serif" font-size="14">FILTER + CARD GRID</text>
    </svg>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
    <rect width="960" height="600" fill="#F3F4F6"/>
    <rect width="960" height="56" fill="#D1D5DB"/>
    <rect x="40" y="80" width="880" height="220" fill="#FFFFFF" stroke="#9CA3AF"/>
    <text x="64" y="140" fill="#6B7280" font-family="sans-serif" font-size="14">HERO / VALUE PROP</text>
    <rect x="64" y="170" width="240" height="36" fill="#9CA3AF"/>
    <rect x="40" y="320" width="880" height="140" fill="#FFFFFF" stroke="#9CA3AF"/>
    <text x="64" y="380" fill="#6B7280" font-family="sans-serif" font-size="14">FORM / CTA</text>
    <rect x="40" y="480" width="880" height="80" fill="#E5E7EB"/>
    <text x="64" y="526" fill="#6B7280" font-family="sans-serif" font-size="14">FOOTER</text>
  </svg>`
}

function componentKitSvg(kind: "solid" | "soft" | "compact"): string {
  const radius = kind === "soft" ? 24 : kind === "compact" ? 4 : 8
  const buttonH = kind === "compact" ? 28 : 44
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
    <rect width="960" height="600" fill="#FAFAF9"/>
    <text x="48" y="56" fill="#111827" font-family="sans-serif" font-size="22" font-weight="600">UI Kit · ${kind}</text>
    <rect x="48" y="88" width="160" height="${buttonH}" rx="${radius}" fill="#1F3A5F"/>
    <rect x="228" y="88" width="160" height="${buttonH}" rx="${radius}" fill="#FFFFFF" stroke="#1F3A5F"/>
    <rect x="48" y="160" width="340" height="48" rx="${radius}" fill="#FFFFFF" stroke="#D1D5DB"/>
    <rect x="48" y="232" width="260" height="140" rx="${Math.max(radius, 12)}" fill="#FFFFFF" stroke="#E5E7EB"/>
    <rect x="68" y="252" width="160" height="16" fill="#E5E7EB"/>
    <rect x="68" y="280" width="220" height="12" fill="#F3F4F6"/>
    <rect x="68" y="320" width="100" height="28" rx="${radius}" fill="#C45C26"/>
    <rect x="430" y="88" width="72" height="28" rx="14" fill="#EEF2FF"/>
    <rect x="430" y="160" width="480" height="40" fill="#F3F4F6"/>
    <rect x="438" y="168" width="88" height="24" fill="#1F3A5F"/>
    <rect x="430" y="232" width="64" height="200" rx="8" fill="#1F3A5F"/>
    <rect x="510" y="232" width="400" height="48" fill="#FFFFFF" stroke="#E5E7EB"/>
    <rect x="510" y="292" width="400" height="48" fill="#FFFFFF" stroke="#E5E7EB"/>
    <rect x="510" y="352" width="400" height="80" fill="#FFFFFF" stroke="#E5E7EB"/>
  </svg>`
}

function prototypeSvg(prompt: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
    <rect width="960" height="600" fill="#F7F6F2"/>
    <rect width="960" height="64" fill="#1F3A5F"/>
    <circle cx="40" cy="32" r="10" fill="#C45C26"/>
    <rect x="64" y="24" width="90" height="16" rx="4" fill="#5B7C99"/>
    <rect x="700" y="20" width="72" height="24" rx="4" fill="#5B7C99"/>
    <rect x="784" y="20" width="72" height="24" rx="4" fill="#C45C26"/>
    <text x="48" y="140" fill="#1A1A1A" font-family="Georgia, serif" font-size="36">한 화면 프로토타입</text>
    <text x="48" y="180" fill="#5B7C99" font-family="sans-serif" font-size="16">${escapeXml(prompt.slice(0, 54))}</text>
    <rect x="48" y="220" width="420" height="280" rx="12" fill="#FFFFFF"/>
    <rect x="72" y="248" width="240" height="20" fill="#E8E4DA"/>
    <rect x="72" y="284" width="372" height="14" fill="#F4F1EA"/>
    <rect x="72" y="312" width="300" height="14" fill="#F4F1EA"/>
    <rect x="72" y="360" width="140" height="40" rx="6" fill="#C45C26"/>
    <rect x="500" y="220" width="412" height="132" rx="12" fill="#2F5D50"/>
    <rect x="500" y="368" width="196" height="132" rx="12" fill="#FFFFFF"/>
    <rect x="716" y="368" width="196" height="132" rx="12" fill="#FFFFFF"/>
  </svg>`
}
